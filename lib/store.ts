/**
 * Public store facade. Picks the backend at module load time:
 *  - If KV_REST_API_URL (or UPSTASH_REDIS_REST_URL) is set → Upstash Redis
 *  - Otherwise → JSON files under `data/` (local dev / self-hosted Node)
 *
 * Every call site in the app imports `store` from here and never knows which
 * backend it's hitting.
 */
import { randomUUID, randomBytes } from "node:crypto";
import { fileStore } from "./store/file";
import { kvStore } from "./store/kv";
import type { StoreApi, Predicate } from "./store/types";

const hasKv = !!(
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
);

export const store: StoreApi = hasKv ? kvStore : fileStore;
export const STORE_BACKEND: "kv" | "file" = hasKv ? "kv" : "file";

export type { Predicate, StoreApi };

export function newId(): string {
  return randomUUID();
}

export function newToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}
