import { Injectable } from '@nestjs/common';
import { SpacetimeService } from '../spacetime/spacetime.service';

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
  delivery_note: string | null;
  delivered_at: number | null;
  completed_at: number | null;
  refunded_at: number | null;
  created_at: number;
  updated_at: number;
}

interface DbNotification {
  id: string;
  user_id: string;
  deal_id: string | null;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: number;
}

@Injectable()
export class UsersService {
  constructor(private spacetime: SpacetimeService) {}

  async findAll() {
    const allUsers = await this.spacetime.sql<DbUser>('SELECT * FROM user');
    const users = allUsers.sort((a, b) => b.created_at - a.created_at);
    return users.map(this.toSafeUser);
  }

  async findOne(id: string) {
    const user = await this.spacetime.sqlOne<DbUser>(
      `SELECT * FROM user WHERE id = '${id}'`,
    );
    if (!user) return null;
    return this.toSafeUser(user);
  }

  async getDashboardStats(userId: string) {
    const [fetchedDeals, fetchedNotifications] = await Promise.all([
      this.spacetime.sql<DbDeal>('SELECT * FROM deal'),
      this.spacetime.sql<DbNotification>(
        `SELECT * FROM notification WHERE user_id = '${userId.replace(/'/g, "''")}'`,
      ),
    ]);
    const allDeals = fetchedDeals
      .filter((d) => d.buyer_id === userId || d.seller_id === userId)
      .sort((a, b) => b.created_at - a.created_at);
    const notifications = fetchedNotifications
      .filter((n) => !n.read)
      .sort((a, b) => b.created_at - a.created_at)
      .slice(0, 10);

    const buyerDeals = allDeals
      .filter((d) => d.buyer_id === userId)
      .slice(0, 5);
    const sellerDeals = allDeals
      .filter((d) => d.seller_id === userId)
      .slice(0, 5);

    const allUsers = await this.spacetime.sql<DbUser>('SELECT * FROM user');
    const userMap = new Map(allUsers.map((u) => [u.id, u]));

    const enrichDeal = (deal: DbDeal) => {
      const buyer = userMap.get(deal.buyer_id);
      const seller = userMap.get(deal.seller_id);
      return {
        ...this.toDeal(deal),
        buyer: buyer ? { id: buyer.id, name: buyer.name, email: buyer.email } : null,
        seller: seller ? { id: seller.id, name: seller.name, email: seller.email } : null,
      };
    };

    const completedDeals = allDeals.filter(
      (d) =>
        (d.buyer_id === userId || d.seller_id === userId) &&
        d.status === 'COMPLETED',
    );
    const totalVolume = completedDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

    const activeDeals = allDeals.filter(
      (d) =>
        (d.buyer_id === userId || d.seller_id === userId) &&
        (d.status === 'FUNDED' || d.status === 'DELIVERED'),
    );

    return {
      buyerDeals: buyerDeals.map(enrichDeal),
      sellerDeals: sellerDeals.map(enrichDeal),
      notifications: notifications.map(this.toNotification),
      stats: {
        totalVolume,
        buyerDealsCount: allDeals.filter((d) => d.buyer_id === userId).length,
        sellerDealsCount: allDeals.filter((d) => d.seller_id === userId).length,
        activeDeals: activeDeals.length,
      },
    };
  }

  private toSafeUser(user: DbUser) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: new Date(user.created_at),
    };
  }

  private toDeal(deal: DbDeal) {
    const deliveredAt = unwrap(deal.delivered_at);
    const completedAt = unwrap(deal.completed_at);
    const refundedAt = unwrap(deal.refunded_at);
    return {
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
      stripePaymentIntentId: unwrap(deal.stripe_payment_intent_id),
      deliveryNote: unwrap(deal.delivery_note),
      deliveredAt: deliveredAt ? new Date(deliveredAt) : null,
      completedAt: completedAt ? new Date(completedAt) : null,
      refundedAt: refundedAt ? new Date(refundedAt) : null,
      createdAt: new Date(deal.created_at),
      updatedAt: new Date(deal.updated_at),
    };
  }

  private toNotification(n: DbNotification) {
    return {
      id: n.id,
      userId: n.user_id,
      dealId: unwrap(n.deal_id),
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
      createdAt: new Date(n.created_at),
    };
  }
}
