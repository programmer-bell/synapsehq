import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const serverOnlyShim = fileURLToPath(
  new URL("./src/test/server-only.ts", import.meta.url),
);

export default defineConfig({
  resolve: {
    alias: {
      "@": rootDir,
      "server-only": serverOnlyShim,
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: ["./src/test/setup.ts"],
    testTimeout: 30_000,
    fileParallelism: false,
  },
});
