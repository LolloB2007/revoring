#!/usr/bin/env node
/**
 * One-shot seed: copy committed `data/*.json` content tables into Upstash KV.
 *
 * Usage (locally, pointing at the PROD KV):
 *   pull env from Vercel:
 *     vercel env pull .env.production.local
 *   then:
 *     node --env-file=.env.production.local scripts/seed-kv.mjs
 *
 * Or pass vars inline:
 *   KV_REST_API_URL=… KV_REST_API_TOKEN=… node scripts/seed-kv.mjs
 *
 * Safe to re-run: it overwrites the listed content tables only, never touches
 * users/orders/contacts/audit/etc.
 */
import { Redis } from "@upstash/redis";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const DATA = resolve(ROOT, "data");

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
if (!url || !token) {
  console.error("Missing KV_REST_API_URL / KV_REST_API_TOKEN env vars.");
  process.exit(1);
}
const redis = new Redis({ url, token });

const PREFIX = "revoring:";

// Only content tables. PII / runtime tables are owned by the app, never seeded.
const CONTENT_TABLES = [
  { file: "categories.json",  table: "categories",  keyField: "id" },
  { file: "products.json",    table: "products",    keyField: "id" },
  { file: "variants.json",    table: "variants",    keyField: "id" },
  { file: "blog_posts.json",  table: "blog_posts",  keyField: "id" },
  { file: "pages.json",       table: "pages",       keyField: "key" },
  { file: "ui_translations.json", table: "ui_translations", keyField: "key" },
];

function pickKey(row, table, field) {
  if (table === "favorites") return `${row.userId}:${row.productId}`;
  return String(row[field]);
}

for (const { file, table, keyField } of CONTENT_TABLES) {
  const path = resolve(DATA, file);
  if (!existsSync(path)) {
    console.log(`[skip] ${file} (not present)`);
    continue;
  }
  const raw = await readFile(path, "utf8");
  const rows = raw.trim() ? JSON.parse(raw) : [];
  if (!Array.isArray(rows)) {
    console.error(`[err]  ${file} is not a JSON array, skipping`);
    continue;
  }
  if (rows.length === 0) {
    console.log(`[skip] ${file} (empty)`);
    continue;
  }
  const key = PREFIX + table;
  await redis.del(key);
  const fields = {};
  for (const row of rows) fields[pickKey(row, table, keyField)] = JSON.stringify(row);
  await redis.hset(key, fields);
  console.log(`[ok]   ${file} → ${key}  (${rows.length} rows)`);
}

console.log("\nSeed complete.");
