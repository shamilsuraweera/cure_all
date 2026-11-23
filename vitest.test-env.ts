import { config } from "dotenv";
import path from "path";

import { withSchema } from "./src/config/db-url.js";

/**
 * Tests share the single `cure_all` database with development but run in
 * their own `test` schema, so resetting it can never touch dev data.
 * Credentials come from .env; .env.test only holds test-specific settings.
 */
export const loadTestEnv = () => {
  config({ path: path.resolve(process.cwd(), ".env.test") });
  config({ path: path.resolve(process.cwd(), ".env") });
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set in .env to run tests");
  }
  process.env.DATABASE_URL = withSchema(process.env.DATABASE_URL, "test");
};
