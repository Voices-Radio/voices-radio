import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  esbuild: {
    // JSX in .test.tsx files is transformed by esbuild directly (no
    // @vitejs/plugin-react — it conflicts with the version sanity/next-sanity
    // pin as a peer dependency).
    jsx: "automatic",
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    css: false,
    clearMocks: true,
    exclude: ["node_modules", ".next", "bolt", "tests/e2e", "tests/staging"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: ["lib/voices/membership/**", "app/**/actions.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
