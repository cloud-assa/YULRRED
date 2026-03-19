import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { SpacetimeService } from '../spacetime/spacetime.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { PaymentsService } from '../payments/payments.service';
import { CreateDisputeDto, ResolveDisputeDto } from './dto/create-dispute.dto';
import { DealStatus, DisputeStatus } from '../common/enums';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cuid: () => string = require('cuid');

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
export class DisputesService {
  constructor(
    private spacetime: SpacetimeService,
    private notifications: NotificationsService,
    private email: EmailService,
    private payments: PaymentsService,
  ) {}

  private esc(v: string) {
    return v.replace(/'/g, "''");
  }

  private async getDealById(id: string): Promise<DbDeal | null> {
    return this.spacetime.sqlOne<DbDeal>(`SELECT * FROM deal WHERE id = '${this.esc(id)}'`);
  }

  private async getUserById(id: string): Promise<DbUser | null> {
    return this.spacetime.sqlOne<DbUser>(`SELECT * FROM user WHERE id = '${this.esc(id)}'`);
  }

  private toDisputeShape(d: DbDispute, deal?: unknown, raisedBy?: DbUser | null) {
    const resolvedAt = unwrap(d.resolved_at);
    const evidence = unwrap(d.evidence);
    const resolution = unwrap(d.resolution);
    const result: Record<string, unknown> = {
      id: d.id,
      dealId: d.deal_id,
      raisedById: d.raised_by_id,
      reason: d.reason,
      evidence,
      status: d.status,
      resolution,
      resolvedAt: resolvedAt ? new Date(resolvedAt) : null,
      createdAt: new Date(d.created_at),
    };
    if (deal !== undefined) result.deal = deal;
    if (raisedBy !== undefined) {
      result.raisedBy = raisedBy
        ? { id: raisedBy.id, name: raisedBy.name, email: raisedBy.email }
        : null;
    }
    return result;
  }

  private toDealShape(deal: DbDeal, buyer?: DbUser | null, seller?: DbUser | null) {
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
      createdAt: new Date(deal.created_at),
      buyer: buyer ? { id: buyer.id, name: buyer.name, email: buyer.email } : null,
      seller: seller ? { id: seller.id, name: seller.name, email: seller.email } : null,
    };
  }

  async raise(dealId: string, userId: string, dto: CreateDisputeDto) {
    const deal = await this.getDealById(dealId);
    if (!deal) throw new NotFoundException('Deal not found');
    if (deal.buyer_id !== userId && deal.seller_id !== userId) {
      throw new ForbiddenException('Not a party to this deal');
    }
    if (deal.status !== DealStatus.FUNDED && deal.status !== DealStatus.DELIVERED) {
      throw new BadRequestException('Can only raise dispute on FUNDED or DELIVERED deals');
    }

    const existing = await this.spacetime.sqlOne<DbDispute>(
      `SELECT * FROM dispute WHERE deal_id = '${this.esc(dealId)}'`,
    );
    if (existing) throw new ConflictException('A dispute already exists for this deal');

    const disputeId = cuid();
    await Promise.all([
      this.spacetime.call('create_dispute', [disputeId, dealId, userId, dto.reason, dto.evidence ? { some: dto.evidence } : { none: [] }]),
      this.spacetime.call('update_deal_status', [dealId, DealStatus.DISPUTED]),
    ]);

    const dispute = await this.spacetime.sqlOne<DbDispute>(`SELECT * FROM dispute WHERE id = '${this.esc(disputeId)}'`);
    const [buyer, seller, raisedBy] = await Promise.all([
      this.getUserById(deal.buyer_id),
      this.getUserById(deal.seller_id),
      this.getUserById(userId),
    ]);

    const otherPartyId = deal.buyer_id === userId ? deal.seller_id : deal.buyer_id;
    await Promise.all([
      this.notifications.create(otherPartyId, dealId, 'DISPUTE_RAISED', 'Dispute Raised', `A dispute has been raised on deal "${deal.title}". Our team will review it.`),
      this.notifications.create(userId, dealId, 'DISPUTE_RAISED', 'Dispute Submitted', `Your dispute for "${deal.title}" has been submitted and is under review.`),
      this.email.sendDisputeRaised(
        { id: buyer!.id, name: buyer!.name, email: buyer!.email },
        { id: seller!.id, name: seller!.name, email: seller!.email },
        this.toDealShape(deal, buyer, seller),
        dto.reason,
      ),
    ]);

    return this.toDisputeShape(dispute!, this.toDealShape(deal, buyer, seller), raisedBy);
  }

  async findAll() {
    const allDisputes = await this.spacetime.sql<DbDispute>('SELECT * FROM dispute');
    const disputes = allDisputes.sort((a, b) => b.created_at - a.created_at);
    const allDeals = await this.spacetime.sql<DbDeal>('SELECT * FROM deal');
    const allUsers = await this.spacetime.sql<DbUser>('SELECT * FROM user');
    const dealMap = new Map(allDeals.map((d) => [d.id, d]));
    const userMap = new Map(allUsers.map((u) => [u.id, u]));

    return disputes.map((d) => {
      const deal = dealMap.get(d.deal_id);
      const raisedBy = userMap.get(d.raised_by_id) ?? null;
      const dealShape = deal
        ? this.toDealShape(deal, userMap.get(deal.buyer_id) ?? null, userMap.get(deal.seller_id) ?? null)
        : null;
      return this.toDisputeShape(d, dealShape, raisedBy);
    });
  }

  async findOne(id: string) {
    const dispute = await this.spacetime.sqlOne<DbDispute>(
      `SELECT * FROM dispute WHERE id = '${this.esc(id)}'`,
    );
    if (!dispute) throw new NotFoundException('Dispute not found');

    const deal = await this.getDealById(dispute.deal_id);
    const raisedBy = await this.getUserById(dispute.raised_by_id);
    const buyer = deal ? await this.getUserById(deal.buyer_id) : null;
    const seller = deal ? await this.getUserById(deal.seller_id) : null;
    const dealShape = deal ? this.toDealShape(deal, buyer, seller) : null;

    return this.toDisputeShape(dispute, dealShape, raisedBy);
  }

  async updateStatus(id: string, status: DisputeStatus) {
    const dispute = await this.spacetime.sqlOne<DbDispute>(
      `SELECT * FROM dispute WHERE id = '${this.esc(id)}'`,
    );
    if (!dispute) throw new NotFoundException('Dispute not found');
    await this.spacetime.call('update_dispute_status', [id, status]);
    return this.spacetime.sqlOne<DbDispute>(`SELECT * FROM dispute WHERE id = '${this.esc(id)}'`);
  }

  async resolve(id: string, dto: ResolveDisputeDto) {
    const dispute = await this.spacetime.sqlOne<DbDispute>(
      `SELECT * FROM dispute WHERE id = '${this.esc(id)}'`,
    );
    if (!dispute) throw new NotFoundException('Dispute not found');
    if (
      dispute.status === DisputeStatus.RESOLVED_BUYER ||
      dispute.status === DisputeStatus.RESOLVED_SELLER
    ) {
      throw new BadRequestException('Dispute is already resolved');
    }

    const deal = await this.getDealById(dispute.deal_id);
    if (!deal) throw new NotFoundException('Associated deal not found');
    const [buyer, seller] = await Promise.all([
      this.getUserById(deal.buyer_id),
      this.getUserById(deal.seller_id),
    ]);

    await this.spacetime.call('resolve_dispute', [id, dto.resolution, dto.resolutionNote ?? '']);

    const dealShape = this.toDealShape(deal, buyer, seller);

    if (dto.resolution === 'RESOLVED_BUYER') {
      await this.payments.refundBuyer(deal.id);
      await Promise.all([
        this.notifications.create(deal.buyer_id, deal.id, 'DISPUTE_RESOLVED', 'Dispute Resolved — Refund Issued', `The dispute for "${deal.title}" was resolved in your favor. A refund of $${deal.amount} has been issued.`),
        this.notifications.create(deal.seller_id, deal.id, 'DISPUTE_RESOLVED', 'Dispute Resolved', `The dispute for "${deal.title}" was resolved in favor of the buyer. ${dto.resolutionNote}`),
      ]);
    } else {
      await this.spacetime.call('mark_deal_completed', [deal.id]);
      await Promise.all([
        this.notifications.create(deal.seller_id, deal.id, 'DISPUTE_RESOLVED', 'Dispute Resolved — Funds Released', `The dispute for "${deal.title}" was resolved in your favor. Funds will be transferred shortly.`),
        this.notifications.create(deal.buyer_id, deal.id, 'DISPUTE_RESOLVED', 'Dispute Resolved', `The dispute for "${deal.title}" was resolved in favor of the seller. ${dto.resolutionNote}`),
      ]);
    }

    await this.email.sendDisputeResolved(
      { id: buyer!.id, name: buyer!.name, email: buyer!.email },
      { id: seller!.id, name: seller!.name, email: seller!.email },
      dealShape,
      dto.resolution,
      dto.resolutionNote,
    );

    const updated = await this.spacetime.sqlOne<DbDispute>(
      `SELECT * FROM dispute WHERE id = '${this.esc(id)}'`,
    );
    return this.toDisputeShape(updated!, dealShape, null);
  }
}
