import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';
import { DealStatus } from '../common/enums';

interface DbDeal {
  id: string;
  title: string;
  description: string;
  amount: number;
  fee_amount: number;
  net_amount: number;
  currency: string;
  status: string;
  deadline: string;
  buyer_id: string;
  seller_id: string;
  stripe_payment_intent_id: string | null;
  stripe_transfer_id: string | null;
  delivery_note: string | null;
  delivered_at: string | null;
  completed_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
}

interface DbUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private db: SupabaseService,
    private config: ConfigService,
    private notifications: NotificationsService,
  ) {
    this.stripe = new Stripe(this.config.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  private async getDealById(id: string): Promise<DbDeal | null> {
    return this.db.queryOne<DbDeal>(`SELECT * FROM deal WHERE id = $1`, [id]);
  }

  private async getUserById(id: string): Promise<DbUser | null> {
    return this.db.queryOne<DbUser>(`SELECT * FROM "user" WHERE id = $1`, [id]);
  }

  // pg returns BIGINT as string — convert to Date safely
  private ts(raw: string | null): Date {
    if (raw === null || raw === undefined) return new Date(0);
    const ms = Number(raw);
    return isNaN(ms) ? new Date(0) : new Date(ms);
  }

  private toDealShape(deal: DbDeal) {
    return {
      id: deal.id,
      title: deal.title,
      amount: deal.amount,
      feeAmount: deal.fee_amount,
      netAmount: deal.net_amount,
      currency: deal.currency,
      status: deal.status,
      buyerId: deal.buyer_id,
      sellerId: deal.seller_id,
      stripePaymentIntentId: deal.stripe_payment_intent_id,
      deadline: this.ts(deal.deadline),
      createdAt: this.ts(deal.created_at),
    };
  }

  async createPaymentIntent(dealId: string, buyerId: string) {
    const deal = await this.getDealById(dealId);
    if (!deal) throw new NotFoundException('Deal not found');
    if (deal.buyer_id !== buyerId) throw new BadRequestException('Only the buyer can fund this deal');
    if (deal.status !== DealStatus.PENDING) {
      throw new BadRequestException(`Deal is already ${deal.status}`);
    }

    const amountInCents = Math.round(deal.amount * 100);
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: deal.currency,
      capture_method: 'automatic',
      metadata: {
        dealId: deal.id,
        buyerId: deal.buyer_id,
        sellerId: deal.seller_id,
        title: deal.title,
      },
      description: `SecureDeal: ${deal.title}`,
    });

    await this.db.execute(
      `UPDATE deal SET stripe_payment_intent_id = $1, updated_at = $2 WHERE id = $3`,
      [paymentIntent.id, Date.now(), dealId],
    );

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: deal.amount,
      feeAmount: deal.fee_amount,
      netAmount: deal.net_amount,
      currency: deal.currency,
    };
  }

  async confirmFunding(dealId: string) {
    const deal = await this.getDealById(dealId);
    if (!deal) throw new NotFoundException('Deal not found');

    await this.db.execute(
      `UPDATE deal SET status = $1, updated_at = $2 WHERE id = $3`,
      [DealStatus.FUNDED, Date.now(), dealId],
    );

    await Promise.all([
      this.notifications.create(deal.buyer_id, dealId, 'DEAL_FUNDED', 'Deal Funded!', `Your payment of S/ ${deal.amount} for "${deal.title}" has been received and held securely.`),
      this.notifications.create(deal.seller_id, dealId, 'DEAL_FUNDED', 'Deal Funded!', `The buyer has funded the deal "${deal.title}". You can now proceed with delivery.`),
    ]);

    const updated = await this.getDealById(dealId);
    if (!updated) throw new NotFoundException('Deal not found after funding');
    return this.toDealShape(updated);
  }

  async handleWebhook(payload: Buffer, signature: string) {
    const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed: ${(err as Error).message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const dealId = pi.metadata?.dealId;
        if (dealId) {
          const deal = await this.getDealById(dealId);
          if (deal && deal.status === DealStatus.PENDING) {
            await this.confirmFunding(dealId);
          }
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const dealId = pi.metadata?.dealId;
        if (dealId) {
          await this.notifications.create(
            pi.metadata.buyerId,
            dealId,
            'PAYMENT_FAILED',
            'Payment Failed',
            'Your payment attempt failed. Please try again.',
          );
        }
        break;
      }
    }

    return { received: true };
  }

  async manualConfirmFunding(dealId: string, buyerId: string) {
    const deal = await this.getDealById(dealId);
    if (!deal) throw new NotFoundException('Deal not found');
    if (deal.buyer_id !== buyerId) throw new BadRequestException('Not authorized');
    if (deal.status !== DealStatus.PENDING) {
      throw new BadRequestException(`Deal is already ${deal.status}`);
    }
    return this.confirmFunding(dealId);
  }

  async releaseFunds(dealId: string, buyerId: string) {
    const deal = await this.getDealById(dealId);
    if (!deal) throw new NotFoundException('Deal not found');
    if (deal.buyer_id !== buyerId) throw new BadRequestException('Only the buyer can release funds');
    if (deal.status !== DealStatus.DELIVERED) {
      throw new BadRequestException('Deal must be DELIVERED before releasing funds');
    }

    const now = Date.now();
    await this.db.execute(
      `UPDATE deal SET status = 'COMPLETED', completed_at = $1, updated_at = $1 WHERE id = $2`,
      [now, dealId],
    );

    const [buyer, seller] = await Promise.all([
      this.getUserById(deal.buyer_id),
      this.getUserById(deal.seller_id),
    ]);

    await Promise.all([
      this.notifications.create(deal.seller_id, dealId, 'FUNDS_RELEASED', 'Funds Released!', `S/ ${deal.net_amount} (after ${deal.fee_amount} platform fee) has been released for "${deal.title}".`),
      this.notifications.create(deal.buyer_id, dealId, 'DEAL_COMPLETED', 'Deal Completed', `Deal "${deal.title}" is now complete. Funds have been released to the seller.`),
    ]);

    const updated = await this.getDealById(dealId);
    return {
      ...this.toDealShape(updated!),
      buyer: buyer ? { id: buyer.id, name: buyer.name, email: buyer.email } : null,
      seller: seller ? { id: seller.id, name: seller.name, email: seller.email } : null,
    };
  }

  async refundBuyer(dealId: string) {
    const deal = await this.getDealById(dealId);
    if (!deal) throw new NotFoundException('Deal not found');
    if (!deal.stripe_payment_intent_id) {
      throw new BadRequestException('No payment found for this deal');
    }

    const refund = await this.stripe.refunds.create({
      payment_intent: deal.stripe_payment_intent_id,
      reason: 'fraudulent',
    });

    const now = Date.now();
    await this.db.execute(
      `UPDATE deal SET status = 'REFUNDED', refunded_at = $1, updated_at = $1 WHERE id = $2`,
      [now, dealId],
    );

    await this.notifications.create(
      deal.buyer_id,
      dealId,
      'FUNDS_REFUNDED',
      'Refund Issued',
      `Your S/ ${deal.amount} payment for "${deal.title}" has been refunded.`,
    );

    const updated = await this.getDealById(dealId);
    return { updated: this.toDealShape(updated!), refundId: refund.id };
  }

  async getPaymentStatus(dealId: string, userId: string) {
    const deal = await this.getDealById(dealId);
    if (!deal) throw new NotFoundException('Deal not found');
    if (deal.buyer_id !== userId && deal.seller_id !== userId) {
      throw new BadRequestException('Not authorized');
    }

    if (!deal.stripe_payment_intent_id) return { status: 'no_payment', deal: this.toDealShape(deal) };

    const pi = await this.stripe.paymentIntents.retrieve(deal.stripe_payment_intent_id);
    return {
      status: pi.status,
      amount: pi.amount / 100,
      currency: pi.currency,
      deal: this.toDealShape(deal),
    };
  }
}
