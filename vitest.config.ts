import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "node:url";

const projectDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    exclude: ["tests/**", "node_modules/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(projectDir, "./src"),
    },
  },
});
