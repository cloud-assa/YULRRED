import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { PaymentsService } from '../payments/payments.service';
import { CreateDisputeDto, ResolveDisputeDto } from './dto/create-dispute.dto';
import { DealStatus, DisputeStatus } from '../common/enums';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cuid: () => string = require('cuid');

interface DbUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: string;
  created_at: string;
  updated_at: string;
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

interface DbDispute {
  id: string;
  deal_id: string;
  raised_by_id: string;
  reason: string;
  evidence: string | null;
  status: string;
  resolution: string | null;
  resolved_at: string | null;
  created_at: string;
}

@Injectable()
export class DisputesService {
  constructor(
    private db: SupabaseService,
    private notifications: NotificationsService,
    private email: EmailService,
    private payments: PaymentsService,
  ) {}

  private async getDealById(id: string): Promise<DbDeal | null> {
    return this.db.queryOne<DbDeal>(`SELECT * FROM deal WHERE id = $1`, [id]);
  }

  private async getUserById(id: string): Promise<DbUser | null> {
    return this.db.queryOne<DbUser>(`SELECT * FROM "user" WHERE id = $1`, [id]);
  }

  private toDisputeShape(d: DbDispute, deal?: unknown, raisedBy?: DbUser | null) {
    const result: Record<string, unknown> = {
      id: d.id,
      dealId: d.deal_id,
      raisedById: d.raised_by_id,
      reason: d.reason,
      evidence: d.evidence,
      status: d.status,
      resolution: d.resolution,
      resolvedAt: d.resolved_at ? new Date(Number(d.resolved_at)) : null,
      createdAt: new Date(Number(d.created_at)),
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
      stripePaymentIntentId: deal.stripe_payment_intent_id,
      createdAt: new Date(Number(deal.created_at)),
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

    const existing = await this.db.queryOne<DbDispute>(
      `SELECT * FROM dispute WHERE deal_id = $1`,
      [dealId],
    );
    if (existing) throw new ConflictException('A dispute already exists for this deal');

    const disputeId = cuid();
    const now = Date.now();

    await Promise.all([
      this.db.execute(
        `INSERT INTO dispute (id, deal_id, raised_by_id, reason, evidence, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [disputeId, dealId, userId, dto.reason, dto.evidence ?? null, 'OPEN', now],
      ),
      this.db.execute(
        `UPDATE deal SET status = $1, updated_at = $2 WHERE id = $3`,
        [DealStatus.DISPUTED, now, dealId],
      ),
    ]);

    const dispute = await this.db.queryOne<DbDispute>(
      `SELECT * FROM dispute WHERE id = $1`,
      [disputeId],
    );
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
    const disputes = await this.db.query<DbDispute>(
      `SELECT * FROM dispute ORDER BY created_at DESC`,
    );
    const allDeals = await this.db.query<DbDeal>(`SELECT * FROM deal`);
    const allUsers = await this.db.query<DbUser>(`SELECT * FROM "user"`);
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
    const dispute = await this.db.queryOne<DbDispute>(
      `SELECT * FROM dispute WHERE id = $1`,
      [id],
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
    const dispute = await this.db.queryOne<DbDispute>(
      `SELECT * FROM dispute WHERE id = $1`,
      [id],
    );
    if (!dispute) throw new NotFoundException('Dispute not found');
    await this.db.execute(
      `UPDATE dispute SET status = $1 WHERE id = $2`,
      [status, id],
    );
    return this.db.queryOne<DbDispute>(`SELECT * FROM dispute WHERE id = $1`, [id]);
  }

  async resolve(id: string, dto: ResolveDisputeDto) {
    const dispute = await this.db.queryOne<DbDispute>(
      `SELECT * FROM dispute WHERE id = $1`,
      [id],
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

    const now = Date.now();
    await this.db.execute(
      `UPDATE dispute SET status = $1, resolution = $2, resolved_at = $3 WHERE id = $4`,
      [dto.resolution, dto.resolutionNote ?? '', now, id],
    );

    const dealShape = this.toDealShape(deal, buyer, seller);

    if (dto.resolution === 'RESOLVED_BUYER') {
      await this.payments.refundBuyer(deal.id);
      await Promise.all([
        this.notifications.create(deal.buyer_id, deal.id, 'DISPUTE_RESOLVED', 'Dispute Resolved — Refund Issued', `The dispute for "${deal.title}" was resolved in your favor. A refund of $${deal.amount} has been issued.`),
        this.notifications.create(deal.seller_id, deal.id, 'DISPUTE_RESOLVED', 'Dispute Resolved', `The dispute for "${deal.title}" was resolved in favor of the buyer. ${dto.resolutionNote}`),
      ]);
    } else {
      await this.db.execute(
        `UPDATE deal SET status = 'COMPLETED', completed_at = $1, updated_at = $1 WHERE id = $2`,
        [now, deal.id],
      );
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

    const updated = await this.db.queryOne<DbDispute>(
      `SELECT * FROM dispute WHERE id = $1`,
      [id],
    );
    return this.toDisputeShape(updated!, dealShape, null);
  }
}
