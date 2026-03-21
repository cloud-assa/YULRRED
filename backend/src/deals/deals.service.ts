import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { MarkDeliveredDto } from './dto/update-deal.dto';
import { DealStatus } from '../common/enums';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cuid: () => string = require('cuid');

const FEE_PERCENT = parseFloat(process.env.ESCROW_FEE_PERCENT || '5') / 100;

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
  product_url: string | null;
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
export class DealsService {
  constructor(
    private db: SupabaseService,
    private notifications: NotificationsService,
    private email: EmailService,
  ) {}

  private calcFees(amount: number) {
    const feeAmount = parseFloat((amount * FEE_PERCENT).toFixed(2));
    const netAmount = parseFloat((amount - feeAmount).toFixed(2));
    return { feeAmount, netAmount };
  }

  // pg returns BIGINT as string — convert to Date safely
  private tsToDate(raw: string | null): Date | null {
    if (raw === null || raw === undefined) return null;
    const ms = Number(raw);
    if (!ms || isNaN(ms)) return null;
    return new Date(ms);
  }

  private toDeal(deal: DbDeal, buyer?: DbUser | null, seller?: DbUser | null, dispute?: DbDispute | null) {
    const result: Record<string, unknown> = {
      id: deal.id,
      title: deal.title,
      description: deal.description,
      amount: deal.amount,
      feeAmount: deal.fee_amount,
      netAmount: deal.net_amount,
      currency: deal.currency,
      status: deal.status,
      deadline: this.tsToDate(deal.deadline) ?? new Date(0),
      buyerId: deal.buyer_id,
      sellerId: deal.seller_id,
      stripePaymentIntentId: deal.stripe_payment_intent_id,
      deliveryNote: deal.delivery_note,
      deliveredAt: this.tsToDate(deal.delivered_at),
      completedAt: this.tsToDate(deal.completed_at),
      refundedAt: this.tsToDate(deal.refunded_at),
      productUrl: deal.product_url,
      createdAt: this.tsToDate(deal.created_at) ?? new Date(0),
      updatedAt: this.tsToDate(deal.updated_at) ?? new Date(0),
    };
    if (buyer !== undefined) {
      result.buyer = buyer ? { id: buyer.id, name: buyer.name, email: buyer.email } : null;
    }
    if (seller !== undefined) {
      result.seller = seller ? { id: seller.id, name: seller.name, email: seller.email } : null;
    }
    if (dispute !== undefined) {
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
          evidence: dispute.evidence,
          status: dispute.status,
          resolution: dispute.resolution,
          resolvedAt: this.tsToDate(dispute.resolved_at),
          createdAt: new Date(Number(dispute.created_at)),
        };
      } else {
        result.dispute = null;
      }
    }
    return result;
  }

  private async getUserById(id: string): Promise<DbUser | null> {
    return this.db.queryOne<DbUser>(`SELECT * FROM "user" WHERE id = $1`, [id]);
  }

  private async getUserByEmail(email: string): Promise<DbUser | null> {
    return this.db.queryOne<DbUser>(`SELECT * FROM "user" WHERE email = $1`, [email]);
  }

  private async getDealById(id: string): Promise<DbDeal | null> {
    return this.db.queryOne<DbDeal>(`SELECT * FROM deal WHERE id = $1`, [id]);
  }

  private async getDisputeByDealId(dealId: string): Promise<DbDispute | null> {
    return this.db.queryOne<DbDispute>(`SELECT * FROM dispute WHERE deal_id = $1`, [dealId]);
  }

  async create(buyerId: string, dto: CreateDealDto) {
    const seller = await this.getUserByEmail(dto.sellerEmail);
    if (!seller) throw new NotFoundException(`No user found with email ${dto.sellerEmail}`);
    if (seller.id === buyerId) throw new BadRequestException('Buyer and seller cannot be the same user');

    const { feeAmount, netAmount } = this.calcFees(dto.amount);
    const id = cuid();
    const deadline = new Date(dto.deadline).getTime();
    const now = Date.now();

    await this.db.execute(
      `INSERT INTO deal (id, title, description, amount, fee_amount, net_amount, currency, status, deadline, buyer_id, seller_id, product_url, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [id, dto.title, dto.description, dto.amount, feeAmount, netAmount, 'PEN', DealStatus.PENDING, deadline, buyerId, seller.id, dto.productUrl ?? null, now, now],
    );

    const buyer = await this.getUserById(buyerId);

    // Build deal shape directly to return immediately
    const dealShape: DbDeal = {
      id, title: dto.title, description: dto.description,
      amount: dto.amount, fee_amount: feeAmount, net_amount: netAmount,
      currency: 'PEN', status: DealStatus.PENDING, deadline: String(deadline),
      buyer_id: buyerId, seller_id: seller.id,
      stripe_payment_intent_id: null, stripe_transfer_id: null,
      delivery_note: null, delivered_at: null, completed_at: null, refunded_at: null,
      product_url: dto.productUrl ?? null,
      created_at: String(now), updated_at: String(now),
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
    const deals = await this.db.query<DbDeal>(
      `SELECT * FROM deal WHERE buyer_id = $1 OR seller_id = $1 ORDER BY created_at DESC`,
      [userId],
    );

    const involvedIds = [...new Set([
      ...deals.map((d) => d.buyer_id),
      ...deals.map((d) => d.seller_id),
    ])];
    let userMap = new Map<string, DbUser>();
    if (involvedIds.length > 0) {
      const users = await this.db.query<DbUser>(
        `SELECT * FROM "user" WHERE id = ANY($1)`,
        [involvedIds],
      );
      userMap = new Map(users.map((u) => [u.id, u]));
    }

    // Batch-fetch disputes instead of N+1 queries
    const dealIds = deals.map((d) => d.id);
    let disputeMap = new Map<string, DbDispute>();
    if (dealIds.length > 0) {
      const disputes = await this.db.query<DbDispute>(
        `SELECT * FROM dispute WHERE deal_id = ANY($1)`,
        [dealIds],
      );
      disputeMap = new Map(disputes.map((d) => [d.deal_id, d]));
    }

    return deals.map((deal) => {
      return this.toDeal(
        deal,
        userMap.get(deal.buyer_id) ?? null,
        userMap.get(deal.seller_id) ?? null,
        disputeMap.get(deal.id) ?? null,
      );
    });
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

    const now = Date.now();
    await this.db.execute(
      `UPDATE deal SET status = 'DELIVERED', delivery_note = $1, delivered_at = $2, updated_at = $2 WHERE id = $3`,
      [dto.deliveryNote ?? '', now, id],
    );

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

    // Verify evidence exists before completing
    const evidences = await this.db.query<{ id: string }>(
      `SELECT id FROM evidence WHERE deal_id = $1`,
      [id],
    );
    if (evidences.length === 0) {
      throw new BadRequestException('Se requiere al menos una evidencia antes de completar el trato. Sube fotos o documentos del producto/servicio.');
    }

    const now = Date.now();
    await this.db.execute(
      `UPDATE deal SET status = 'COMPLETED', completed_at = $1, updated_at = $1 WHERE id = $2`,
      [now, id],
    );

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

    const now = Date.now();
    await this.db.execute(
      `UPDATE deal SET status = 'CANCELLED', updated_at = $1 WHERE id = $2`,
      [now, id],
    );
    const updated = await this.getDealById(id);
    if (!updated) throw new NotFoundException('Deal not found after cancellation');
    return this.toDeal(updated);
  }

  // Admin moves deal to AWAITING_APPROVAL after inspecting product and uploading evidence
  async setAwaitingApproval(id: string) {
    const deal = await this.getDealById(id);
    if (!deal) throw new NotFoundException('Deal not found');
    if (deal.status !== DealStatus.FUNDED) {
      throw new BadRequestException(`El trato debe estar en estado FUNDED. Estado actual: ${deal.status}`);
    }
    const now = Date.now();
    await this.db.execute(
      `UPDATE deal SET status = $1, updated_at = $2 WHERE id = $3`,
      [DealStatus.AWAITING_APPROVAL, now, id],
    );
    await this.notifications.create(
      deal.buyer_id, id, 'DEAL_AWAITING_APPROVAL',
      'Revisión Requerida',
      `La plataforma ha subido evidencias del producto "${deal.title}". Por favor revísalas y aprueba para continuar.`,
    );
    const updated = await this.getDealById(id);
    return this.toDeal(updated!);
  }

  // Buyer approves platform evidence → deal continues (back to FUNDED)
  async approveService(id: string, buyerId: string) {
    const deal = await this.getDealById(id);
    if (!deal) throw new NotFoundException('Deal not found');
    if (deal.buyer_id !== buyerId) throw new ForbiddenException('Solo el comprador puede aprobar');
    if (deal.status !== DealStatus.AWAITING_APPROVAL) {
      throw new BadRequestException(`El trato debe estar en estado AWAITING_APPROVAL. Estado actual: ${deal.status}`);
    }
    const now = Date.now();
    await this.db.execute(
      `UPDATE deal SET status = $1, updated_at = $2 WHERE id = $3`,
      [DealStatus.FUNDED, now, id],
    );
    await this.notifications.create(
      deal.seller_id, id, 'DEAL_APPROVED',
      'Comprador Aprobó',
      `El comprador aprobó las evidencias del trato "${deal.title}". Puedes proceder con la entrega.`,
    );
    const updated = await this.getDealById(id);
    return this.toDeal(updated!);
  }

  async getAllAdmin() {
    const deals = await this.db.query<DbDeal>(
      `SELECT * FROM deal ORDER BY created_at DESC`,
    );

    const involvedIds = [...new Set([
      ...deals.map((d) => d.buyer_id),
      ...deals.map((d) => d.seller_id),
    ])];
    let userMap = new Map<string, DbUser>();
    if (involvedIds.length > 0) {
      const users = await this.db.query<DbUser>(
        `SELECT * FROM "user" WHERE id = ANY($1)`,
        [involvedIds],
      );
      userMap = new Map(users.map((u) => [u.id, u]));
    }

    // Batch-fetch all disputes instead of N+1
    const dealIds = deals.map((d) => d.id);
    let disputeMap = new Map<string, DbDispute>();
    if (dealIds.length > 0) {
      const disputes = await this.db.query<DbDispute>(
        `SELECT * FROM dispute WHERE deal_id = ANY($1)`,
        [dealIds],
      );
      disputeMap = new Map(disputes.map((d) => [d.deal_id, d]));
    }

    return deals.map((deal) => {
      return this.toDeal(
        deal,
        userMap.get(deal.buyer_id) ?? null,
        userMap.get(deal.seller_id) ?? null,
        disputeMap.get(deal.id) ?? null,
      );
    });
  }
}
