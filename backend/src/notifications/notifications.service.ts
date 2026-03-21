import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cuid: () => string = require('cuid');

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
export class NotificationsService {
  constructor(private db: SupabaseService) {}

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

  async create(userId: string, dealId: string | null, type: string, title: string, message: string) {
    const id = cuid();
    const now = Date.now();
    // Direct INSERT — no more {some:}/{none:[]} wrapping for nullable dealId
    await this.db.execute(
      `INSERT INTO notification (id, user_id, deal_id, type, title, message, read, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, FALSE, $7)`,
      [id, userId, dealId, type, title, message, now],
    );
    return { id, userId, dealId, type, title, message, read: false, createdAt: new Date() };
  }

  async findForUser(userId: string) {
    try {
      const rows = await this.db.query<DbNotification>(
        `SELECT * FROM notification WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
        [userId],
      );
      return rows.map(this.toNotification);
    } catch {
      return [];
    }
  }

  async markRead(id: string, userId: string) {
    const notif = await this.db.queryOne<DbNotification>(
      `SELECT * FROM notification WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );
    if (!notif) return { count: 0 };
    await this.db.execute(`UPDATE notification SET read = TRUE WHERE id = $1`, [id]);
    return { count: 1 };
  }

  // Single UPDATE instead of N+1 queries — major performance improvement
  async markAllRead(userId: string) {
    const result = await this.db.query<{ count: string }>(
      `WITH updated AS (
         UPDATE notification SET read = TRUE WHERE user_id = $1 AND read = FALSE RETURNING id
       ) SELECT COUNT(*) as count FROM updated`,
      [userId],
    );
    return { count: Number(result[0]?.count ?? 0) };
  }

  // Use COUNT(*) instead of fetching all rows and filtering in JS
  async getUnreadCount(userId: string) {
    try {
      const result = await this.db.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM notification WHERE user_id = $1 AND read = FALSE`,
        [userId],
      );
      return { count: Number(result[0]?.count ?? 0) };
    } catch {
      return { count: 0 };
    }
  }
}
