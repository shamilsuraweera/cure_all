import { execSync } from "child_process";
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.test") });

export default async () => {
  execSync("npx prisma generate", { stdio: "inherit" });
  execSync("npx prisma db push --force-reset", {
    stdio: "inherit",
  });
  execSync("npx prisma db seed", { stdio: "inherit" });
};
