import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import * as bcrypt from 'bcryptjs';

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

interface DbNotification {
  id: string;
  user_id: string;
  deal_id: string | null;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

@Injectable()
export class UsersService {
  constructor(private db: SupabaseService) {}

  async findAll() {
    const users = await this.db.query<DbUser>(
      `SELECT * FROM "user" ORDER BY created_at DESC`,
    );
    return users.map(this.toSafeUser);
  }

  async findOne(id: string) {
    const user = await this.db.queryOne<DbUser>(
      `SELECT * FROM "user" WHERE id = $1`,
      [id],
    );
    if (!user) return null;
    return this.toSafeUser(user);
  }

  async getDashboardStats(userId: string) {
    const [fetchedDeals, fetchedNotifications] = await Promise.all([
      this.db.query<DbDeal>(
        `SELECT * FROM deal WHERE buyer_id = $1 OR seller_id = $1`,
        [userId],
      ),
      this.db.query<DbNotification>(
        `SELECT * FROM notification WHERE user_id = $1`,
        [userId],
      ),
    ]);
    const allDeals = fetchedDeals.sort((a, b) => Number(b.created_at) - Number(a.created_at));
    const notifications = fetchedNotifications
      .filter((n) => !n.read)
      .sort((a, b) => Number(b.created_at) - Number(a.created_at))
      .slice(0, 10);

    const buyerDeals = allDeals.filter((d) => d.buyer_id === userId).slice(0, 5);
    const sellerDeals = allDeals.filter((d) => d.seller_id === userId).slice(0, 5);

    // Batch-fetch all involved users with ANY($1) instead of N OR conditions
    const involvedIds = [...new Set([
      ...allDeals.map((d) => d.buyer_id),
      ...allDeals.map((d) => d.seller_id),
    ])];
    let userMap = new Map<string, DbUser>();
    if (involvedIds.length > 0) {
      const involvedUsers = await this.db.query<DbUser>(
        `SELECT * FROM "user" WHERE id = ANY($1)`,
        [involvedIds],
      );
      userMap = new Map(involvedUsers.map((u) => [u.id, u]));
    }

    const enrichDeal = (deal: DbDeal) => {
      const buyer = userMap.get(deal.buyer_id);
      const seller = userMap.get(deal.seller_id);
      return {
        ...this.toDeal(deal),
        buyer: buyer ? { id: buyer.id, name: buyer.name, email: buyer.email } : null,
        seller: seller ? { id: seller.id, name: seller.name, email: seller.email } : null,
      };
    };

    const completedDeals = allDeals.filter((d) => d.status === 'COMPLETED');
    const terminalStatuses = new Set(['COMPLETED', 'CANCELLED', 'REFUNDED']);
    const activeDeals = allDeals.filter((d) => !terminalStatuses.has(d.status));

    return {
      buyerDeals: buyerDeals.map(enrichDeal),
      sellerDeals: sellerDeals.map(enrichDeal),
      notifications: notifications.map(this.toNotification),
      stats: {
        totalVolume: completedDeals.reduce((sum, d) => sum + (d.amount || 0), 0),
        buyerDealsCount: allDeals.filter((d) => d.buyer_id === userId).length,
        sellerDealsCount: allDeals.filter((d) => d.seller_id === userId).length,
        activeDeals: activeDeals.length,
      },
    };
  }

  private toSafeUser(user: DbUser) {
    const ms = Number(user.created_at);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: ms ? new Date(ms) : new Date(0),
    };
  }

  private toDeal(deal: DbDeal) {
    return {
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
  }

  private toNotification(n: DbNotification) {
    return {
      id: n.id,
      userId: n.user_id,
      dealId: n.deal_id,
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
      createdAt: new Date(Number(n.created_at)),
    };
  }

  // pg returns BIGINT as string — convert to Date safely
  private tsToDate(raw: string | null): Date | null {
    if (raw === null || raw === undefined) return null;
    const ms = Number(raw);
    if (!ms || isNaN(ms)) return null;
    return new Date(ms);
  }

  async deleteUser(id: string) {
    const user = await this.db.queryOne<DbUser>(
      `SELECT * FROM "user" WHERE id = $1`,
      [id],
    );
    if (!user) throw new NotFoundException('User not found');

    const deals = await this.db.query<{ id: string; status: string }>(
      `SELECT id, status FROM deal WHERE buyer_id = $1 OR seller_id = $1`,
      [id],
    );
    const activeStatuses = ['PENDING', 'FUNDED', 'DELIVERED', 'AWAITING_APPROVAL', 'DISPUTED'];
    const activeDeals = deals.filter((d) => activeStatuses.includes(d.status));
    if (activeDeals.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar: el usuario tiene ${activeDeals.length} trato(s) activo(s). Resuélvelos primero.`,
      );
    }

    await this.db.execute(`DELETE FROM "user" WHERE id = $1`, [id]);
    return { deleted: true, id };
  }

  async updateCredentials(id: string, dto: { name?: string; email?: string; password?: string }) {
    const user = await this.db.queryOne<DbUser>(
      `SELECT * FROM "user" WHERE id = $1`,
      [id],
    );
    if (!user) throw new NotFoundException('User not found');

    if (dto.email && dto.email !== user.email) {
      const existing = await this.db.queryOne<DbUser>(
        `SELECT * FROM "user" WHERE email = $1`,
        [dto.email],
      );
      if (existing) throw new ConflictException('El email ya está en uso por otro usuario');
    }

    const newName = dto.name ?? user.name;
    const newEmail = dto.email ?? user.email;
    const newPassword = dto.password
      ? await bcrypt.hash(dto.password, 10)
      : user.password;

    await this.db.execute(
      `UPDATE "user" SET name = $1, email = $2, password = $3, updated_at = $4 WHERE id = $5`,
      [newName, newEmail, newPassword, Date.now(), id],
    );
    return { id, name: newName, email: newEmail, role: user.role };
  }
}
