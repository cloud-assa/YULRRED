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
      timeout: 8000,
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
        obj[col] = this.unwrapValue(row[idx]);
      });
      return obj as T;
    });
  }

  /**
   * Unwrap BSATN typed values. SpacetimeDB may return either plain JSON
   * primitives or typed wrappers like {String:"v"}, {I64:123}, {some:"v"}, {none:[]}.
   */
  private unwrapValue(value: unknown): unknown {
    if (value === null || value === undefined) return null;
    if (typeof value !== 'object') return value; // plain scalar — return as-is
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);
    if (keys.length !== 1) return value; // not a typed wrapper

    const key = keys[0];
    const inner = obj[key];

    // Option<T>: {some: v} or {none: []}
    if (key === 'some') return this.unwrapValue(inner); // recursive — handles {some: {I64: 123}}
    if (key === 'none') return null;

    // BSATN scalar wrappers: {String:"v"}, {Bool:true}, {I64:123}, {F64:1.5}, etc.
    const bsatnScalars = ['String','Bool','I8','I16','I32','I64','U8','U16','U32','U64','F32','F64'];
    if (bsatnScalars.includes(key)) return inner;

    return value; // unknown shape — return raw
  }

  /**
   * Execute a SQL query. Returns an array of typed objects.
   */
  async sql<T>(query: string): Promise<T[]> {
    try {
      const encodedDb = this.dbName;
      const response = await this.client.post<StdbSqlResponse>(
        `/v1/database/${encodedDb}/sql`,
        query,
        { headers: { 'Content-Type': 'text/plain' } },
      );

      const raw = response.data as any;
      // SpacetimeDB v1 returns an array directly: [{schema, rows}]
      // Some proxy/versions may wrap it: {results: [{schema, rows}]}
      const results: StdbResultRow[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.results)
        ? raw.results
        : [];

      if (results.length === 0) return [];
      const first = results[0];
      if (!first || !first.schema || !first.rows) return [];

      return this.parseRows<T>(first);
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
