import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

@Injectable()
export class SupabaseService implements OnModuleDestroy {
  private readonly logger = new Logger(SupabaseService.name);
  private readonly pool: Pool;

  constructor(private config: ConfigService) {
    this.pool = new Pool({
      connectionString: this.config.get<string>('DATABASE_URL'),
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: { rejectUnauthorized: false },
    });
  }

  /** Parameterized SELECT — returns array of typed row objects. */
  async query<T>(text: string, params?: unknown[]): Promise<T[]> {
    try {
      const result = await this.pool.query(text, params);
      return result.rows as T[];
    } catch (err: unknown) {
      const error = err as { message?: string };
      this.logger.error(`SQL query error: ${error?.message}`, text);
      throw err;
    }
  }

  /** Parameterized SELECT — returns first row or null. */
  async queryOne<T>(text: string, params?: unknown[]): Promise<T | null> {
    const rows = await this.query<T>(text, params);
    return rows[0] ?? null;
  }

  /** Parameterized INSERT/UPDATE/DELETE — no return value. */
  async execute(text: string, params?: unknown[]): Promise<void> {
    try {
      await this.pool.query(text, params);
    } catch (err: unknown) {
      const error = err as { message?: string };
      this.logger.error(`SQL execute error: ${error?.message}`, text);
      throw err;
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
