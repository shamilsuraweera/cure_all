import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  ACCESS_TOKEN_TTL: z.string().min(1).default("15m"),
  REFRESH_TOKEN_TTL: z.string().min(1).default("7d"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:5173,http://localhost:3000"),
});

export const env = envSchema
  .superRefine((cfg, ctx) => {
    if (cfg.NODE_ENV !== "production") return;
    for (const key of ["JWT_SECRET", "JWT_REFRESH_SECRET"] as const) {
      if (cfg[key].length < 32) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: `${key} must be at least 32 characters in production`,
        });
      }
    }
    if (cfg.JWT_SECRET === cfg.JWT_REFRESH_SECRET) {
      ctx.addIssue({
        code: "custom",
        path: ["JWT_REFRESH_SECRET"],
        message: "JWT_REFRESH_SECRET must differ from JWT_SECRET",
      });
    }
  })
  .parse(process.env);
