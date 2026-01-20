import "dotenv/config";
import crypto from "crypto";
import { z } from "zod";

import { PrismaClient } from "../src/generated/prisma/index.js";

const envSchema = z.object({
  ROOT_ADMIN_EMAIL: z.string().email(),
  ROOT_ADMIN_PASSWORD: z.string().min(8),
});

const env = envSchema.parse(process.env);

const prisma = new PrismaClient();

const hashPassword = (password: string) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 310000, 32, "sha256")
    .toString("hex");

  return `pbkdf2$310000$${salt}$${hash}`;
};

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
      passwordHash: hashPassword(env.ROOT_ADMIN_PASSWORD),
      globalRole: "ROOT_ADMIN",
    },
  });
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
