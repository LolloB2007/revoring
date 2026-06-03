/**
 * Public store facade. Picks the backend at module load time:
 *  - If KV_REST_API_URL (or UPSTASH_REDIS_REST_URL) is set → Upstash Redis
 *  - Otherwise → JSON files under `data/` (local dev / self-hosted Node)
 *
 * Every call site in the app imports `store` from here and never knows which
 * backend it's hitting.
 *
 * Safety net: when running on Vercel (VERCEL=1) without KV configured, we
 * surface a loud error instead of silently falling back to the file store
 * (which would 500 on every write because Vercel's filesystem is read-only).
 */
import { randomUUID, randomBytes } from "node:crypto";
import { fileStore } from "./store/file";
import { kvStore } from "./store/kv";
import type { StoreApi, Predicate } from "./store/types";

const hasKv = !!(
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
);
const isVercel = !!process.env.VERCEL;

if (isVercel && !hasKv) {
  // Don't crash the build — just warn loudly. Reads will return empty / writes
  // will throw with a clearer message than EROFS deep in the file store.
  console.error(
    "[store] Running on Vercel without KV. Provision Upstash for Redis under " +
      "Vercel Storage and connect the project. The file-store fallback will " +
      "fail on every write (Vercel filesystem is read-only).",
  );
}

export const store: StoreApi = hasKv ? kvStore : fileStore;
export const STORE_BACKEND: "kv" | "file" = hasKv ? "kv" : "file";

export type { Predicate, StoreApi };

export function newId(): string {
  return randomUUID();
}

export function newToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}
