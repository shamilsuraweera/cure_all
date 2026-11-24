import { execSync } from "child_process";
import { loadTestEnv } from "./vitest.test-env";

export default async () => {
  loadTestEnv();
  execSync("npx prisma generate", { stdio: "inherit" });
  execSync("npx prisma db push --force-reset", {
    stdio: "inherit",
  });
  execSync("npx prisma db seed", { stdio: "inherit" });
};
