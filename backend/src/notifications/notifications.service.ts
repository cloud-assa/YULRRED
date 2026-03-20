import { Injectable } from '@nestjs/common';
import { SpacetimeService } from '../spacetime/spacetime.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cuid: () => string = require('cuid');

// Recursive — necesario porque SpacetimeDB puede devolver {some: {String: "id"}}
const unwrap = (v: any): any => {
  if (v === null || v === undefined) return null;
  if (typeof v !== 'object') return v;
  if ('none' in v) return null;
  if ('some' in v) return unwrap(v.some);
  const bsatnKeys = ['String','Bool','I8','I16','I32','I64','U8','U16','U32','U64','F32','F64'];
  const keys = Object.keys(v);
  if (keys.length === 1 && bsatnKeys.includes(keys[0])) return v[keys[0]];
  return v;
};

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
