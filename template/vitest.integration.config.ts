import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    include: ["src/**/*.integration.test.ts"],
    environment: "node",
    fileParallelism: false,
    maxWorkers: 1,
    setupFiles: ["./scripts/integration-setup.ts"],
  },
});
