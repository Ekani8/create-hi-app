import { defineConfig, devices } from "@playwright/test";
import { assertTestDatabase } from "./scripts/test-db.mjs";
assertTestDatabase(process.env.DATABASE_URL);
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: "http://127.0.0.1:3100", trace: "on-first-retry" },
  webServer: {
    command: "npm run dev -- --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    env: { NODE_ENV: "development" },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
