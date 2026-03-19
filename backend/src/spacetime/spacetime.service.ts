import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

interface StdbSchemaElement {
  name: { some: string } | string;
  algebraic_type: unknown;
}

interface StdbSchema {
  elements: StdbSchemaElement[];
}

interface StdbResultRow {
  schema: StdbSchema;
  rows: unknown[][];
}

type StdbSqlResponse = StdbResultRow[];

@Injectable()
export class SpacetimeService {
  private readonly logger = new Logger(SpacetimeService.name);
  private readonly client: AxiosInstance;
  private readonly dbName: string;

  constructor(private config: ConfigService) {
    const baseUrl = this.config.get<string>('SPACETIMEDB_URL', 'https://maincloud.spacetimedb.com');
    const token = this.config.get<string>('SPACETIMEDB_TOKEN', '');
    this.dbName = this.config.get<string>('SPACETIMEDB_DB', 'cloud-assa/securedeal');

    this.client = axios.create({
      baseURL: baseUrl,
      headers: { 'Authorization': `Bearer ${token}` },
      timeout: 15000,
    });
  }

  /**
   * Convert SpacetimeDB SQL response rows (arrays) into objects using schema column names.
   */
  private parseRows<T>(result: StdbResultRow): T[] {
    const columns = result.schema.elements.map((el) => {
      if (typeof el.name === 'object' && el.name !== null && 'some' in el.name) {
        return (el.name as { some: string }).some;
      }
      return String(el.name);
    });

    return result.rows.map((row) => {
      const obj: Record<string, unknown> = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx] ?? null;
      });
      return obj as T;
    });
  }

  /**
   * Execute a SQL query. Returns an array of typed objects.
   */
  async sql<T>(query: string): Promise<T[]> {
    try {
      const encodedDb = this.dbName; // DB hex ID - no encoding needed
      const response = await this.client.post<StdbSqlResponse>(
        `/v1/database/${encodedDb}/sql`,
        query,
        { headers: { 'Content-Type': 'text/plain' } },
      );

      const results = response.data; // SpacetimeDB returns array directly: [{schema, rows}]
      if (!results || results.length === 0) return [];

      return this.parseRows<T>(results[0]);
    } catch (err: unknown) {
      const error = err as { response?: { data?: unknown; status?: number }; message?: string };
      this.logger.error(`SpacetimeDB SQL error: ${error?.message}`, error?.response?.data);
      throw err;
    }
  }

  /**
   * Execute a SQL query and return the first row, or null.
   */
  async sqlOne<T>(query: string): Promise<T | null> {
    const rows = await this.sql<T>(query);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Call a SpacetimeDB reducer.
   */
  async call(reducer: string, args: unknown[]): Promise<void> {
    try {
      const encodedDb = this.dbName; // DB hex ID - no encoding needed
      await this.client.post(
        `/v1/database/${encodedDb}/call/${reducer}`,
        args,
      );
    } catch (err: unknown) {
      const error = err as { response?: { data?: unknown; status?: number }; message?: string };
      this.logger.error(`SpacetimeDB reducer '${reducer}' error: ${error?.message}`, error?.response?.data);
      throw err;
    }
  }
}
