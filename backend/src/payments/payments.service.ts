import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { SpacetimeService } from '../spacetime/spacetime.service';
import { NotificationsService } from '../notifications/notifications.service';
import { DealStatus } from '../common/enums';

const unwrap = (v: any) =>
  v && typeof v === 'object' && 'some' in v
    ? v.some
    : v === null || (v && typeof v === 'object' && 'none' in v)
    ? null
    : v;

interface DbDeal {
  id: string;
  title: string;
  description: string;
  amount: number;
  fee_amount: number;
  net_amount: number;
  currency: string;
  status: string;
  deadline: number;
  buyer_id: string;
  seller_id: string;
  stripe_payment_intent_id: string | null;
  stripe_transfer_id: string | null;
  delivery_note: string | null;
  delivered_at: number | null;
  completed_at: number | null;
  refunded_at: number | null;
  created_at: number;
  updated_at: number;
}

interface DbUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: string;
  created_at: number;
  updated_at: number;
}

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private spacetime: SpacetimeService,
    private config: ConfigService,
    private notifications: NotificationsService,
  ) {
    this.stripe = new Stripe(this.config.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  private esc(v: string) {
    return v.replace(/'/g, "''");
  }

  private async getDealById(id: string): Promise<DbDeal | null> {
    return this.spacetime.sqlOne<DbDeal>(`SELECT * FROM deal WHERE id = '${this.esc(id)}'`);
  }

  private async getUserById(id: string): Promise<DbUser | null> {
    return this.spacetime.sqlOne<DbUser>(`SELECT * FROM user WHERE id = '${this.esc(id)}'`);
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
      stripePaymentIntentId: unwrap(deal.stripe_payment_intent_id),
      deadline: new Date(deal.deadline),
      createdAt: new Date(deal.created_at),
    };
  }

  /**
   * Creates a Stripe PaymentIntent for the deal amount.
   * Funds are captured but held — not yet transferred to seller.
   */
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

    await this.spacetime.call('update_deal_stripe_intent', [dealId, paymentIntent.id]);

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: deal.amount,
      feeAmount: deal.fee_amount,
      netAmount: deal.net_amount,
      currency: deal.currency,
    };
  }

  /**
   * Called after successful Stripe payment confirmation (webhook or manual confirm).
   * Moves deal status from PENDING → FUNDED.
   */
  async confirmFunding(dealId: string) {
    const deal = await this.getDealById(dealId);
    if (!deal) throw new NotFoundException('Deal not found');

    await this.spacetime.call('update_deal_status', [dealId, DealStatus.FUNDED]);

    await Promise.all([
      this.notifications.create(deal.buyer_id, dealId, 'DEAL_FUNDED', 'Deal Funded!', `Your payment of $${deal.amount} for "${deal.title}" has been received and held securely.`),
      this.notifications.create(deal.seller_id, dealId, 'DEAL_FUNDED', 'Deal Funded!', `The buyer has funded the deal "${deal.title}". You can now proceed with delivery.`),
    ]);

    return this.getDealById(dealId);
  }

  /**
   * Handle Stripe webhook events.
   */
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

  /**
   * Manually confirm funding (for dev/testing without webhooks).
   */
  async manualConfirmFunding(dealId: string, buyerId: string) {
    const deal = await this.getDealById(dealId);
    if (!deal) throw new NotFoundException('Deal not found');
    if (deal.buyer_id !== buyerId) throw new BadRequestException('Not authorized');
    if (deal.status !== DealStatus.PENDING) {
      throw new BadRequestException(`Deal is already ${deal.status}`);
    }
    return this.confirmFunding(dealId);
  }

  /**
   * Release funds to seller after buyer confirms receipt.
   * Deducts 5% platform fee. In production, use Stripe Connect transfers.
   */
  async releaseFunds(dealId: string, buyerId: string) {
    const deal = await this.getDealById(dealId);
    if (!deal) throw new NotFoundException('Deal not found');
    if (deal.buyer_id !== buyerId) throw new BadRequestException('Only the buyer can release funds');
    if (deal.status !== DealStatus.DELIVERED) {
      throw new BadRequestException('Deal must be DELIVERED before releasing funds');
    }

    // In production with Stripe Connect:
    // const transfer = await this.stripe.transfers.create({...});

    await this.spacetime.call('mark_deal_completed', [dealId]);

    const [buyer, seller] = await Promise.all([
      this.getUserById(deal.buyer_id),
      this.getUserById(deal.seller_id),
    ]);

    await Promise.all([
      this.notifications.create(deal.seller_id, dealId, 'FUNDS_RELEASED', 'Funds Released!', `$${deal.net_amount} (after ${deal.fee_amount} platform fee) has been released for "${deal.title}".`),
      this.notifications.create(deal.buyer_id, dealId, 'DEAL_COMPLETED', 'Deal Completed', `Deal "${deal.title}" is now complete. Funds have been released to the seller.`),
    ]);

    const updated = await this.getDealById(dealId);
    return {
      ...this.toDealShape(updated!),
      buyer: buyer ? { id: buyer.id, name: buyer.name, email: buyer.email } : null,
      seller: seller ? { id: seller.id, name: seller.name, email: seller.email } : null,
    };
  }

  /**
   * Refund buyer (used when admin resolves dispute in buyer's favor).
   */
  async refundBuyer(dealId: string) {
    const deal = await this.getDealById(dealId);
    if (!deal) throw new NotFoundException('Deal not found');
    const stripePaymentIntentId = unwrap(deal.stripe_payment_intent_id);
    if (!stripePaymentIntentId) {
      throw new BadRequestException('No payment found for this deal');
    }

    const refund = await this.stripe.refunds.create({
      payment_intent: stripePaymentIntentId,
      reason: 'fraudulent',
    });

    await this.spacetime.call('mark_deal_refunded', [dealId]);

    await this.notifications.create(
      deal.buyer_id,
      dealId,
      'FUNDS_REFUNDED',
      'Refund Issued',
      `Your $${deal.amount} payment for "${deal.title}" has been refunded.`,
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

    const stripePaymentIntentId = unwrap(deal.stripe_payment_intent_id);
    if (!stripePaymentIntentId) return { status: 'no_payment', deal: this.toDealShape(deal) };

    const pi = await this.stripe.paymentIntents.retrieve(stripePaymentIntentId);
    return {
      status: pi.status,
      amount: pi.amount / 100,
      currency: pi.currency,
      deal: this.toDealShape(deal),
    };
  }
}
