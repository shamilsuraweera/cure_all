import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { parseDatabaseUrl } from "./db-url.js";
import { env } from "./env.js";

const { connectionString, schema } = parseDatabaseUrl(env.DATABASE_URL);

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

const adapter = new PrismaPg(pool, schema ? { schema } : undefined);

export const prisma = new PrismaClient({ adapter });
