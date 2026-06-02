import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@/db/schema";
import { env } from "./env";

/**
 * Drizzle instance backed by Neon HTTP. We always create a real client (even
 * with a placeholder URL at build time) so libraries that introspect the
 * driver (e.g. @auth/drizzle-adapter) work. Actual network calls never happen
 * with the placeholder.
 */
const BUILD_PLACEHOLDER = "postgres://build:build@build.neon.tech/build?sslmode=require";
const url = env.DATABASE_URL ?? BUILD_PLACEHOLDER;

declare global {
  // eslint-disable-next-line no-var
  var __revoringDb: ReturnType<typeof drizzle> | undefined;
}

const client = neon(url);
export const db = globalThis.__revoringDb ?? drizzle(client, { schema });
if (env.NODE_ENV !== "production") globalThis.__revoringDb = db;

export { schema };
