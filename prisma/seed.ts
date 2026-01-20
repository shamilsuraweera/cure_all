import "dotenv/config";
import { z } from "zod";
import argon2 from "argon2";

import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const envSchema = z.object({
  ROOT_ADMIN_EMAIL: z.string().email(),
  ROOT_ADMIN_PASSWORD: z.string().min(8),
});

const env = envSchema.parse(process.env);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const hashPassword = async (password: string) => argon2.hash(password);

const main = async () => {
  const existing = await prisma.user.findUnique({
    where: { email: env.ROOT_ADMIN_EMAIL },
  });

  if (existing) {
    await prisma.user.update({
      where: { email: env.ROOT_ADMIN_EMAIL },
      data: { globalRole: "ROOT_ADMIN" },
    });
    return;
  }

  await prisma.user.create({
    data: {
      email: env.ROOT_ADMIN_EMAIL,
      passwordHash: await hashPassword(env.ROOT_ADMIN_PASSWORD),
      globalRole: "ROOT_ADMIN",
    },
  });
};

main()
  .then(async () => {
    await pool.end();
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await pool.end();
    await prisma.$disconnect();
    process.exit(1);
  });
