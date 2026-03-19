import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { SpacetimeService } from '../spacetime/spacetime.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { MarkDeliveredDto } from './dto/update-deal.dto';
import { DealStatus } from '../common/enums';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cuid: () => string = require('cuid');

const FEE_PERCENT = parseFloat(process.env.ESCROW_FEE_PERCENT || '5') / 100;

const unwrap = (v: any) =>
  v && typeof v === 'object' && 'some' in v
    ? v.some
    : v === null || (v && typeof v === 'object' && 'none' in v)
    ? null
    : v;

interface DbUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: string;
  created_at: number;
  updated_at: number;
}

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

interface DbDispute {
  id: string;
  deal_id: string;
  raised_by_id: string;
  reason: string;
  evidence: string | null;
  status: string;
  resolution: string | null;
  resolved_at: number | null;
  created_at: number;
}

@Injectable()
export class DealsService {
  constructor(
    private spacetime: SpacetimeService,
    private notifications: NotificationsService,
    private email: EmailService,
  ) {}

  private calcFees(amount: number) {
    const feeAmount = parseFloat((amount * FEE_PERCENT).toFixed(2));
    const netAmount = parseFloat((amount - feeAmount).toFixed(2));
    return { feeAmount, netAmount };
  }

  private esc(value: string) {
    return value.replace(/'/g, "''");
  }

  private toDeal(deal: DbDeal, buyer?: DbUser | null, seller?: DbUser | null, dispute?: DbDispute | null) {
    const deliveredAt = unwrap(deal.delivered_at);
    const completedAt = unwrap(deal.completed_at);
    const refundedAt = unwrap(deal.refunded_at);
    const deliveryNote = unwrap(deal.delivery_note);
    const stripePaymentIntentId = unwrap(deal.stripe_payment_intent_id);

    const result: Record<string, unknown> = {
      id: deal.id,
      title: deal.title,
      description: deal.description,
      amount: deal.amount,
      feeAmount: deal.fee_amount,
      netAmount: deal.net_amount,
      currency: deal.currency,
      status: deal.status,
      deadline: new Date(deal.deadline),
      buyerId: deal.buyer_id,
      sellerId: deal.seller_id,
      stripePaymentIntentId,
      deliveryNote,
      deliveredAt: deliveredAt ? new Date(deliveredAt) : null,
      completedAt: completedAt ? new Date(completedAt) : null,
      refundedAt: refundedAt ? new Date(refundedAt) : null,
      createdAt: new Date(deal.created_at),
      updatedAt: new Date(deal.updated_at),
    };
    if (buyer !== undefined) {
      result.buyer = buyer ? { id: buyer.id, name: buyer.name, email: buyer.email } : null;
    }
    if (seller !== undefined) {
      result.seller = seller ? { id: seller.id, name: seller.name, email: seller.email } : null;
    }
    if (dispute !== undefined) {
      const resolvedAt = unwrap(dispute?.resolved_at);
      const evidence = unwrap(dispute?.evidence);
      const resolution = unwrap(dispute?.resolution);
      if (dispute) {
        const raisedByUser =
          dispute.raised_by_id === deal.buyer_id ? buyer : seller;
        result.dispute = {
          id: dispute.id,
          dealId: dispute.deal_id,
          raisedById: dispute.raised_by_id,
          raisedBy: raisedByUser
            ? { id: raisedByUser.id, name: raisedByUser.name, email: raisedByUser.email }
            : null,
          reason: dispute.reason,
          evidence,
          status: dispute.status,
          resolution,
          resolvedAt: resolvedAt ? new Date(resolvedAt) : null,
          createdAt: new Date(dispute.created_at),
        };
      } else {
        result.dispute = null;
      }
    }
    return result;
  }

  private async getUserById(id: string): Promise<DbUser | null> {
    return this.spacetime.sqlOne<DbUser>(`SELECT * FROM user WHERE id = '${this.esc(id)}'`);
  }

  private async getUserByEmail(email: string): Promise<DbUser | null> {
    return this.spacetime.sqlOne<DbUser>(`SELECT * FROM user WHERE email = '${this.esc(email)}'`);
  }

  private async getDealById(id: string): Promise<DbDeal | null> {
    return this.spacetime.sqlOne<DbDeal>(`SELECT * FROM deal WHERE id = '${this.esc(id)}'`);
  }

  private async getDisputeByDealId(dealId: string): Promise<DbDispute | null> {
    return this.spacetime.sqlOne<DbDispute>(`SELECT * FROM dispute WHERE deal_id = '${this.esc(dealId)}'`);
  }

  async create(buyerId: string, dto: CreateDealDto) {
    const seller = await this.getUserByEmail(dto.sellerEmail);
    if (!seller) throw new NotFoundException(`No user found with email ${dto.sellerEmail}`);
    if (seller.id === buyerId) throw new BadRequestException('Buyer and seller cannot be the same user');

    const { feeAmount, netAmount } = this.calcFees(dto.amount);
    const id = cuid();
    const deadline = new Date(dto.deadline).getTime();

    await this.spacetime.call('create_deal', [
      id,
      dto.title,
      dto.description,
      dto.amount,
      feeAmount,
      netAmount,
      'usd',
      DealStatus.PENDING,
      deadline,
      buyerId,
      seller.id,
    ]);

    const buyer = await this.getUserById(buyerId);

    // Build deal shape directly — avoid read-after-write race with SpacetimeDB
    const dealShape: DbDeal = {
      id, title: dto.title, description: dto.description,
      amount: dto.amount, fee_amount: feeAmount, net_amount: netAmount,
      currency: 'usd', status: DealStatus.PENDING, deadline,
      buyer_id: buyerId, seller_id: seller.id,
      stripe_payment_intent_id: null, stripe_transfer_id: null,
      delivery_note: null, delivered_at: null, completed_at: null, refunded_at: null,
      created_at: Date.now(), updated_at: Date.now(),
    };

    await Promise.all([
      this.notifications.create(buyerId, id, 'DEAL_CREATED', 'Deal Created', `Your deal "${dealShape.title}" has been created. Proceed to fund it.`),
      this.notifications.create(seller.id, id, 'DEAL_CREATED', 'New Deal Invitation', `${buyer?.name ?? 'Buyer'} has invited you to a deal: "${dealShape.title}"`),
      this.email.sendDealCreated(
        { id: buyer!.id, name: buyer!.name, email: buyer!.email },
        { id: seller.id, name: seller.name, email: seller.email },
        this.toDeal(dealShape),
      ),
    ]);

    return this.toDeal(dealShape, buyer, seller);
  }

  async findAll(userId: string) {
    const escapedId = this.esc(userId);
    const deals = (
      await this.spacetime.sql<DbDeal>(
        `SELECT * FROM deal WHERE buyer_id = '${escapedId}' OR seller_id = '${escapedId}'`,
      )
    ).sort((a, b) => b.created_at - a.created_at);

    // Fetch only involved users instead of the whole table
    const involvedIds = [...new Set([
      ...deals.map((d) => d.buyer_id),
      ...deals.map((d) => d.seller_id),
    ])];
    let userMap = new Map<string, DbUser>();
    if (involvedIds.length > 0) {
      const idConditions = involvedIds.map((id) => `id = '${this.esc(id)}'`).join(' OR ');
      const users = await this.spacetime.sql<DbUser>(`SELECT * FROM user WHERE ${idConditions}`);
      userMap = new Map(users.map((u) => [u.id, u]));
    }

    return Promise.all(
      deals.map(async (deal) => {
        const dispute = await this.getDisputeByDealId(deal.id);
        return this.toDeal(
          deal,
          userMap.get(deal.buyer_id) ?? null,
          userMap.get(deal.seller_id) ?? null,
          dispute,
        );
      }),
    );
  }

  async findOne(id: string, userId: string) {
    const deal = await this.getDealById(id);
    if (!deal) throw new NotFoundException('Deal not found');
    if (deal.buyer_id !== userId && deal.seller_id !== userId) {
      throw new ForbiddenException('Not authorized to view this deal');
    }

    const [buyer, seller, dispute] = await Promise.all([
      this.getUserById(deal.buyer_id),
      this.getUserById(deal.seller_id),
      this.getDisputeByDealId(id),
    ]);

    return this.toDeal(deal, buyer, seller, dispute);
  }

  async findOneAdmin(id: string) {
    const deal = await this.getDealById(id);
    if (!deal) throw new NotFoundException('Deal not found');

    const [buyer, seller, dispute] = await Promise.all([
      this.getUserById(deal.buyer_id),
      this.getUserById(deal.seller_id),
      this.getDisputeByDealId(id),
    ]);

    return this.toDeal(deal, buyer, seller, dispute);
  }

  async markDelivered(id: string, sellerId: string, dto: MarkDeliveredDto) {
    const deal = await this.getDealById(id);
    if (!deal) throw new NotFoundException('Deal not found');
    if (deal.seller_id !== sellerId) throw new ForbiddenException('Only the seller can mark as delivered');
    if (deal.status !== DealStatus.FUNDED) {
      throw new BadRequestException(`Deal must be FUNDED to mark as delivered. Current status: ${deal.status}`);
    }

    await this.spacetime.call('mark_deal_delivered', [id, dto.deliveryNote ?? '']);

    const updated = await this.getDealById(id);
    const [buyer, seller] = await Promise.all([
      this.getUserById(deal.buyer_id),
      this.getUserById(deal.seller_id),
    ]);

    await Promise.all([
      this.notifications.create(deal.buyer_id, id, 'DEAL_DELIVERED', 'Delivery Confirmed', `The seller has marked "${deal.title}" as delivered. Please review and confirm or raise a dispute.`),
      this.email.sendDeliveryConfirmation(
        { id: buyer!.id, name: buyer!.name, email: buyer!.email },
        { id: seller!.id, name: seller!.name, email: seller!.email },
        this.toDeal(updated!),
      ),
    ]);

    return this.toDeal(updated!, buyer, seller);
  }

  async confirmReceipt(id: string, buyerId: string) {
    const deal = await this.getDealById(id);
    if (!deal) throw new NotFoundException('Deal not found');
    if (deal.buyer_id !== buyerId) throw new ForbiddenException('Only the buyer can confirm receipt');
    if (deal.status !== DealStatus.DELIVERED) {
      throw new BadRequestException(`Deal must be DELIVERED to confirm receipt. Current status: ${deal.status}`);
    }

    await this.spacetime.call('mark_deal_completed', [id]);

    const updated = await this.getDealById(id);
    const [buyer, seller] = await Promise.all([
      this.getUserById(deal.buyer_id),
      this.getUserById(deal.seller_id),
    ]);

    await Promise.all([
      this.notifications.create(deal.seller_id, id, 'DEAL_COMPLETED', 'Payment Released!', `The buyer has confirmed receipt for "${deal.title}". Funds (minus 5% fee) will be transferred shortly.`),
      this.notifications.create(deal.buyer_id, id, 'DEAL_COMPLETED', 'Deal Completed', `You have confirmed receipt for "${deal.title}". The deal is now complete.`),
      this.email.sendDealCompleted(
        { id: buyer!.id, name: buyer!.name, email: buyer!.email },
        { id: seller!.id, name: seller!.name, email: seller!.email },
        this.toDeal(updated!),
      ),
    ]);

    return this.toDeal(updated!, buyer, seller);
  }

  async cancel(id: string, userId: string) {
    const deal = await this.getDealById(id);
    if (!deal) throw new NotFoundException('Deal not found');
    if (deal.buyer_id !== userId && deal.seller_id !== userId) throw new ForbiddenException('Not authorized');
    if (deal.status !== DealStatus.PENDING) {
      throw new BadRequestException('Only PENDING deals can be cancelled. Funded deals require a dispute.');
    }

    await this.spacetime.call('cancel_deal', [id]);
    return this.getDealById(id);
  }

  async getAllAdmin() {
    const deals = (await this.spacetime.sql<DbDeal>('SELECT * FROM deal'))
      .sort((a, b) => b.created_at - a.created_at);

    const involvedIds = [...new Set([
      ...deals.map((d) => d.buyer_id),
      ...deals.map((d) => d.seller_id),
    ])];
    let userMap = new Map<string, DbUser>();
    if (involvedIds.length > 0) {
      const idConditions = involvedIds.map((id) => `id = '${this.esc(id)}'`).join(' OR ');
      const users = await this.spacetime.sql<DbUser>(`SELECT * FROM user WHERE ${idConditions}`);
      userMap = new Map(users.map((u) => [u.id, u]));
    }

    return Promise.all(
      deals.map(async (deal) => {
        const dispute = await this.getDisputeByDealId(deal.id);
        return this.toDeal(
          deal,
          userMap.get(deal.buyer_id) ?? null,
          userMap.get(deal.seller_id) ?? null,
          dispute,
        );
      }),
    );
  }
}
