import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { assertTestDatabase } from "./test-db.mjs";

const require = createRequire(import.meta.url);
const kind = process.argv[2];
if (!["integration", "e2e"].includes(kind))
  throw new Error("Expected integration or e2e");
// CI injects DATABASE_URL; locally only .env.test is loaded, never .env.
if (existsSync(".env.test")) process.loadEnvFile(".env.test");
assertTestDatabase(process.env.DATABASE_URL);
process.env.NODE_ENV = "test";
function run(entry, args) {
  const result = spawnSync(
    process.execPath,
    [require.resolve(entry), ...args],
    { stdio: "inherit", env: process.env },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
run("prisma/build/index.js", ["migrate", "deploy"]);
if (kind === "integration")
  run("vitest/vitest.mjs", ["run", "--config", "vitest.integration.config.ts"]);
else run("@playwright/test/cli", ["test"]);
