/**
 * Upstash Redis-backed store. Used on Vercel via the Vercel Marketplace
 * "Upstash for Redis" integration (formerly Vercel KV) which injects
 * KV_REST_API_URL + KV_REST_API_TOKEN. Locally, you can also point at any
 * Upstash instance via UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.
 *
 * Layout: each "table" is one Redis hash `revoring:<table>` whose fields are
 * row ids (or composite keys for the few tables without an `id` field) and
 * whose values are JSON-encoded rows. This keeps per-row mutations atomic
 * without a whole-table read-modify-write cycle.
 */
import { Redis } from "@upstash/redis";
import type { StoreApi, Predicate } from "./types";

const PREFIX = "revoring:";

function getRedis(): Redis {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      "KV not configured. Set KV_REST_API_URL + KV_REST_API_TOKEN (Vercel Marketplace) or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.",
    );
  }
  return new Redis({ url, token });
}

/**
 * Derive a stable field key for a row. Most tables key by `id`; a couple key
 * by their natural primary (`pages.key`) or a composite (`favorites.userId+productId`,
 * `cart_items.cartId+variantId`).
 */
function keyOf<T>(table: string, row: T): string {
  const r = row as Record<string, unknown>;
  if (table === "pages" && typeof r.key === "string") return r.key;
  if (table === "favorites" && typeof r.userId === "string" && typeof r.productId === "string") {
    return `${r.userId}:${r.productId}`;
  }
  if (table === "ui_translations" && typeof r.key === "string") return r.key;
  if (typeof r.id === "string") return r.id;
  throw new Error(`store/kv: cannot derive key for row in table "${table}"`);
}

function reviveDates(value: unknown): unknown {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
    return value;
  }
  if (Array.isArray(value)) return value.map(reviveDates);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, reviveDates(v)]),
    );
  }
  return value;
}

function decode<T>(raw: unknown): T {
  // @upstash/redis auto-parses JSON strings into objects when it can.
  const obj = typeof raw === "string" ? JSON.parse(raw) : raw;
  return reviveDates(obj) as T;
}

function encode<T>(row: T): string {
  // Stringify so HSET stores a single canonical JSON blob, no auto-coercion.
  return JSON.stringify(row);
}

async function readAll<T>(table: string): Promise<T[]> {
  const redis = getRedis();
  const raw = (await redis.hgetall<Record<string, unknown>>(PREFIX + table)) ?? {};
  return Object.values(raw).map((v) => decode<T>(v));
}

export const kvStore: StoreApi = {
  async all<T>(table: string): Promise<T[]> {
    return readAll<T>(table);
  },

  async findOne<T>(table: string, p: Predicate<T>): Promise<T | undefined> {
    const rows = await readAll<T>(table);
    return rows.find(p);
  },

  async findMany<T>(table: string, p?: Predicate<T>): Promise<T[]> {
    const rows = await readAll<T>(table);
    return p ? rows.filter(p) : rows;
  },

  async insert<T>(table: string, row: T): Promise<T> {
    const redis = getRedis();
    await redis.hset(PREFIX + table, { [keyOf(table, row)]: encode(row) });
    return row;
  },

  async insertMany<T>(table: string, newRows: T[]): Promise<T[]> {
    if (newRows.length === 0) return newRows;
    const redis = getRedis();
    const fields: Record<string, string> = {};
    for (const r of newRows) fields[keyOf(table, r)] = encode(r);
    await redis.hset(PREFIX + table, fields);
    return newRows;
  },

  async updateWhere<T>(
    table: string,
    p: Predicate<T>,
    patch: Partial<T> | ((row: T) => Partial<T>),
  ): Promise<number> {
    const redis = getRedis();
    const rows = await readAll<T>(table);
    const updates: Record<string, string> = {};
    let count = 0;
    for (const row of rows) {
      if (!p(row)) continue;
      const p2 = typeof patch === "function" ? patch(row) : patch;
      const merged = { ...row, ...p2 } as T;
      updates[keyOf(table, merged)] = encode(merged);
      count++;
    }
    if (count) await redis.hset(PREFIX + table, updates);
    return count;
  },

  async upsert<T>(
    table: string,
    p: Predicate<T>,
    factory: () => T,
    patch?: Partial<T> | ((row: T) => Partial<T>),
  ): Promise<T> {
    const redis = getRedis();
    const rows = await readAll<T>(table);
    const existing = rows.find(p);
    let result: T;
    if (existing) {
      const p2 = patch ? (typeof patch === "function" ? patch(existing) : patch) : {};
      result = { ...existing, ...p2 } as T;
    } else {
      result = factory();
    }
    await redis.hset(PREFIX + table, { [keyOf(table, result)]: encode(result) });
    return result;
  },

  async deleteWhere<T>(table: string, p: Predicate<T>): Promise<number> {
    const redis = getRedis();
    const rows = await readAll<T>(table);
    const keysToRemove = rows.filter(p).map((r) => keyOf(table, r));
    if (keysToRemove.length === 0) return 0;
    await redis.hdel(PREFIX + table, ...keysToRemove);
    return keysToRemove.length;
  },

  async replaceAll<T>(table: string, rows: T[]): Promise<void> {
    const redis = getRedis();
    await redis.del(PREFIX + table);
    if (rows.length === 0) return;
    const fields: Record<string, string> = {};
    for (const r of rows) fields[keyOf(table, r)] = encode(r);
    await redis.hset(PREFIX + table, fields);
  },
};
