import "server-only";

import { Pool } from "@neondatabase/serverless";
import { drizzle, type NeonDatabase } from "drizzle-orm/neon-serverless";

import { getEnv } from "@/src/shared/config/env";

import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  neonPool?: Pool;
  drizzleDb?: NeonDatabase<typeof schema>;
};

function getPool(): Pool {
  if (!globalForDb.neonPool) {
    globalForDb.neonPool = new Pool({
      connectionString: getEnv().DATABASE_URL,
    });
  }
  return globalForDb.neonPool;
}

/**
 * Lazily-initialised Drizzle client. The database connection is created on
 * first access rather than at module-evaluation time so that `next build` can
 * import server modules to collect page metadata without requiring runtime
 * environment variables.
 */
export function getDb(): NeonDatabase<typeof schema> {
  if (!globalForDb.drizzleDb) {
    globalForDb.drizzleDb = drizzle(getPool(), { schema });
  }
  return globalForDb.drizzleDb;
}

/** @deprecated Use `getDb()` instead – kept temporarily for migration convenience. */
export const db = new Proxy({} as NeonDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

export async function closeDb(): Promise<void> {
  if (globalForDb.neonPool) {
    await globalForDb.neonPool.end();
    globalForDb.neonPool = undefined;
    globalForDb.drizzleDb = undefined;
  }
}
