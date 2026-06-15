#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createLogger, createServer } from "vite";

process.env.NODE_ENV = process.env.NODE_ENV ?? "production";

async function loadRenderer() {
  const bundledRenderer = path.resolve("out/server/render.js");
  if (fs.existsSync(bundledRenderer)) {
    const renderer = await import(pathToFileURL(bundledRenderer).href);
    return { renderer, close: async () => undefined };
  }

  const logger = createLogger("warn");
  const originalError = logger.error;
  logger.error = (message, options) => {
    if (
      typeof message === "string" &&
      message.includes("WebSocket server error") &&
      message.includes("listen EPERM")
    ) {
      return;
    }
    originalError(message, options);
  };

  const server = await createServer({
    appType: "custom",
    customLogger: logger,
    logLevel: "warn",
    server: { hmr: false, middlewareMode: true },
  });

  try {
    const renderer = await server.ssrLoadModule("/src/site/render.tsx");
    return { renderer, close: async () => await server.close() };
  } catch (error) {
    await server.close();
    throw error;
  }
}

async function main() {
  const command = process.argv[2];
  if (command !== "routes" && command !== "render") {
    throw new Error(`Unknown render-site command: ${command ?? "(missing)"}`);
  }

  const { renderer, close } = await loadRenderer();
  try {
    if (command === "routes") {
      const assets = JSON.parse(process.argv[3] ?? "{}");
      const routes = await renderer.buildRoutes(assets);
      process.stdout.write(
        `${JSON.stringify(
          routes.map((route) => ({
            path: route.path,
            outputPath: route.outputPath,
            dependencies: route.dependencies,
          })),
        )}\n`,
      );
      return;
    }

    const payload = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));
    for (const requested of payload.routes) {
      fs.mkdirSync(path.dirname(requested.outputFile), { recursive: true });
      fs.writeFileSync(
        requested.outputFile,
        await renderer.renderPath(requested.path, payload.assets),
        "utf8",
      );
    }

    fs.writeFileSync(payload.sitemapFile, await renderer.renderSitemap(), "utf8");
    fs.writeFileSync(payload.robotsFile, renderer.renderRobots(), "utf8");
  } finally {
    await close();
  }
}

await main();
