import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { SpacetimeService } from '../spacetime/spacetime.service';
import * as bcrypt from 'bcryptjs';

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
    const esc = userId.replace(/'/g, "''");
    const [fetchedDeals, fetchedNotifications] = await Promise.all([
      this.spacetime.sql<DbDeal>(
        `SELECT * FROM deal WHERE buyer_id = '${esc}' OR seller_id = '${esc}'`,
      ),
      this.spacetime.sql<DbNotification>(
        `SELECT * FROM notification WHERE user_id = '${esc}'`,
      ),
    ]);
    const allDeals = fetchedDeals.sort((a, b) => b.created_at - a.created_at);
    const notifications = fetchedNotifications
      .filter((n) => !n.read)
      .sort((a, b) => b.created_at - a.created_at)
      .slice(0, 10);

    const buyerDeals = allDeals.filter((d) => d.buyer_id === userId).slice(0, 5);
    const sellerDeals = allDeals.filter((d) => d.seller_id === userId).slice(0, 5);

    const involvedIds = [...new Set([
      ...allDeals.map((d) => d.buyer_id),
      ...allDeals.map((d) => d.seller_id),
    ])];
    let userMap = new Map<string, DbUser>();
    if (involvedIds.length > 0) {
      const idConditions = involvedIds.map((id) => `id = '${id.replace(/'/g, "''")}'`).join(' OR ');
      const involvedUsers = await this.spacetime.sql<DbUser>(
        `SELECT * FROM user WHERE ${idConditions}`,
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
    const activeDeals = allDeals.filter(
      (d) => d.status === 'FUNDED' || d.status === 'DELIVERED',
    );

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

  // Elimina un usuario — solo si no tiene deals activos
  async deleteUser(id: string) {
    const user = await this.spacetime.sqlOne<DbUser>(
      `SELECT * FROM user WHERE id = '${id.replace(/'/g, "''")}'`,
    );
    if (!user) throw new NotFoundException('User not found');

    // Verificar deals activos: consulta todas las columnas para filtrar por status client-side
    const deals = await this.spacetime.sql<{ id: string; status: string }>(
      `SELECT id, status FROM deal WHERE buyer_id = '${id.replace(/'/g, "''")}' OR seller_id = '${id.replace(/'/g, "''")}'`,
    );
    const activeStatuses = ['PENDING', 'FUNDED', 'DELIVERED', 'AWAITING_APPROVAL', 'DISPUTED'];
    const activeDeals = deals.filter((d) => activeStatuses.includes(d.status));
    if (activeDeals.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar: el usuario tiene ${activeDeals.length} trato(s) activo(s). Resuélvelos primero.`,
      );
    }

    await this.spacetime.call('delete_user', [id]);
    return { deleted: true, id };
  }

  // Actualiza nombre, email y/o contraseña — solo desde panel de admin
  async updateCredentials(id: string, dto: { name?: string; email?: string; password?: string }) {
    const user = await this.spacetime.sqlOne<DbUser>(
      `SELECT * FROM user WHERE id = '${id.replace(/'/g, "''")}'`,
    );
    if (!user) throw new NotFoundException('User not found');

    // Verificar que el nuevo email no esté en uso por otro usuario
    if (dto.email && dto.email !== user.email) {
      const existing = await this.spacetime.sqlOne<DbUser>(
        `SELECT * FROM user WHERE email = '${dto.email.replace(/'/g, "''")}'`,
      );
      if (existing) throw new ConflictException('El email ya está en uso por otro usuario');
    }

    const newName = dto.name ?? user.name;
    const newEmail = dto.email ?? user.email;
    // Si se provee nueva contraseña, hashearla; sino usar la existente
    const newPassword = dto.password
      ? await bcrypt.hash(dto.password, 10)
      : (unwrap(user.password) as string) ?? user.password;

    await this.spacetime.call('update_user_credentials', [id, newName, newEmail, newPassword]);
    return { id, name: newName, email: newEmail, role: user.role };
  }
}
