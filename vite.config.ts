import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectDir = path.dirname(fileURLToPath(import.meta.url));

const env = {
  "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "development"),
  "process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID": JSON.stringify(
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "",
  ),
  "process.env.NEXT_PUBLIC_BUILD_COMMIT": JSON.stringify(
    process.env.NEXT_PUBLIC_BUILD_COMMIT ?? "local",
  ),
  "process.env.NEXT_PUBLIC_BUILD_TIME": JSON.stringify(
    process.env.NEXT_PUBLIC_BUILD_TIME ?? "local",
  ),
};

function cssModuleClassName(localName: string, filename: string): string {
  const relativePath = path
    .relative(path.resolve(projectDir, "src"), filename)
    .replace(/\.module\.css$/, "")
    .replace(/[^A-Za-z0-9_]/g, "_");
  return `${relativePath}__${localName}`;
}

export default defineConfig({
  plugins: [react()],
  publicDir: "public",
  resolve: {
    alias: [
      {
        find: "next/image",
        replacement: path.resolve(projectDir, "./src/site/next-image.tsx"),
      },
      {
        find: "next/link",
        replacement: path.resolve(projectDir, "./src/site/next-link.tsx"),
      },
      {
        find: "next/dynamic",
        replacement: path.resolve(projectDir, "./src/site/next-dynamic.tsx"),
      },
      {
        find: "next/web-vitals",
        replacement: path.resolve(
          projectDir,
          "./src/site/next-web-vitals.ts",
        ),
      },
      { find: "next", replacement: path.resolve(projectDir, "./src/site/next.ts") },
      { find: "@", replacement: path.resolve(projectDir, "./src") },
      { find: "sharp", replacement: path.resolve(projectDir, "./noop-sharp/index.js") },
      {
        find: "onnxruntime-node",
        replacement: path.resolve(projectDir, "./noop-onnxruntime-node/index.js"),
      },
    ],
  },
  define: env,
  css: {
    modules: {
      generateScopedName: cssModuleClassName,
    },
  },
  build: {
    outDir: "out",
    emptyOutDir: false,
    chunkSizeWarningLimit: 900,
    manifest: true,
    rollupOptions: {
      onwarn: (warning, warn) => {
        if (
          warning.code === "EVAL" &&
          typeof warning.id === "string" &&
          warning.id.includes("onnxruntime-web")
        ) {
          return;
        }
        warn(warning);
      },
      input: {
        client: path.resolve(projectDir, "src/site/client.tsx"),
      },
    },
  },
});
