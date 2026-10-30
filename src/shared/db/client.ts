import "server-only";

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import { getEnv } from "@/src/shared/config/env";

import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  neonPool?: Pool;
};

function createPool(): Pool {
  return new Pool({
    connectionString: getEnv().DATABASE_URL,
  });
}

const pool = globalForDb.neonPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.neonPool = pool;
}

export const db = drizzle(pool, { schema });

export async function closeDb(): Promise<void> {
  await pool.end();
}
