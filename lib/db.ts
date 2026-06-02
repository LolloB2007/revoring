import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@/db/schema";
import { env } from "./env";

declare global {
  // eslint-disable-next-line no-var
  var __revoringDb: ReturnType<typeof drizzle> | undefined;
}

function makeDb() {
  if (!env.DATABASE_URL) {
    // Lazily allow build-time imports; reads/writes will throw clearly.
    return new Proxy({} as ReturnType<typeof drizzle>, {
      get() {
        throw new Error(
          "DATABASE_URL is not set. Configure Neon Postgres before running DB queries.",
        );
      },
    });
  }
  const client = neon(env.DATABASE_URL);
  return drizzle(client, { schema });
}

export const db = globalThis.__revoringDb ?? makeDb();
if (env.NODE_ENV !== "production") globalThis.__revoringDb = db;

export { schema };
