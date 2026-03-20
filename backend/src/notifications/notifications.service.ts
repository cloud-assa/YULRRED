import { Injectable } from '@nestjs/common';
import { SpacetimeService } from '../spacetime/spacetime.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cuid: () => string = require('cuid');

const unwrap = (v: any) =>
  v && typeof v === 'object' && 'some' in v
    ? v.some
    : v === null || (v && typeof v === 'object' && 'none' in v)
    ? null
    : v;

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
export class NotificationsService {
  constructor(private spacetime: SpacetimeService) {}

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

  async create(userId: string, dealId: string | null, type: string, title: string, message: string) {
    const id = cuid();
    // dealId is nullable (string?) — SpacetimeDB expects sum type: {"some": "id"} or {"none": []}
    const dealIdArg = dealId ? { some: dealId } : { none: [] };
    await this.spacetime.call('create_notification', [id, userId, dealIdArg, type, title, message]);
    return { id, userId, dealId, type, title, message, read: false, createdAt: new Date() };
  }

  async findForUser(userId: string) {
    try {
      const allRows = await this.spacetime.sql<DbNotification>(
        `SELECT * FROM notification WHERE user_id = '${userId.replace(/'/g, "''")}'`,
      );
      const rows = allRows
        .sort((a, b) => b.created_at - a.created_at)
        .slice(0, 50);
      return rows.map(this.toNotification);
    } catch {
      return [];
    }
  }

  async markRead(id: string, userId: string) {
    // Verify ownership then mark read
    const notif = await this.spacetime.sqlOne<DbNotification>(
      `SELECT * FROM notification WHERE id = '${id.replace(/'/g, "''")}' AND user_id = '${userId.replace(/'/g, "''")}'`,
    );
    if (!notif) return { count: 0 };
    await this.spacetime.call('mark_notification_read', [id]);
    return { count: 1 };
  }

  async markAllRead(userId: string) {
    const all = await this.spacetime.sql<DbNotification>(
      `SELECT * FROM notification WHERE user_id = '${userId.replace(/'/g, "''")}'`,
    );
    const unread = all.filter((n) => !n.read);
    await Promise.all(unread.map((n) => this.spacetime.call('mark_notification_read', [n.id])));
    return { count: unread.length };
  }

  async getUnreadCount(userId: string) {
    try {
      const all = await this.spacetime.sql<DbNotification>(
        `SELECT * FROM notification WHERE user_id = '${userId.replace(/'/g, "''")}'`,
      );
      return { count: all.filter((n) => !n.read).length };
    } catch {
      return { count: 0 };
    }
  }
}
