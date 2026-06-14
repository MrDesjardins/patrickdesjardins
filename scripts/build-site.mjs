#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { build, createLogger, createServer } from "vite";

const root = process.cwd();
const outDir = path.join(root, "out");
const manifestPath = path.join(outDir, ".site-manifest.json");
const args = new Set(process.argv.slice(2));
const forceFull = args.has("--full");
const checkOnly = args.has("--check");
const schemaVersion = 1;

process.env.NODE_ENV = process.env.NODE_ENV ?? "production";

function slash(value) {
  return value.split(path.sep).join("/");
}

function relative(value) {
  return slash(path.relative(root, value));
}

function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function sha256(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function hashFile(filePath) {
  return sha256(fs.readFileSync(filePath));
}

function cssModuleClassName(localName, filename) {
  const relativePath = slash(path.relative(path.join(root, "src"), filename))
    .replace(/\.module\.css$/, "")
    .replace(/[^A-Za-z0-9_]/g, "_");
  return `${relativePath}__${localName}`;
}

function walkFiles(entry) {
  const absolute = path.resolve(root, entry);
  if (!fs.existsSync(absolute)) {
    return [];
  }

  const stats = fs.statSync(absolute);
  if (stats.isFile()) {
    return [absolute];
  }

  if (!stats.isDirectory()) {
    return [];
  }

  return fs
    .readdirSync(absolute, { withFileTypes: true })
    .flatMap((dirent) => {
      const child = path.join(absolute, dirent.name);
      if (dirent.isDirectory()) {
        return walkFiles(relative(child));
      }
      return dirent.isFile() ? [child] : [];
    })
    .filter((filePath) => !filePath.includes(`${path.sep}.git${path.sep}`));
}

function sourceHashesFor(dependencies) {
  const hashes = {};
  for (const dependency of dependencies) {
    for (const filePath of walkFiles(dependency)) {
      hashes[relative(filePath)] = hashFile(filePath);
    }
  }
  return hashes;
}

function mergeHashes(routes) {
  const all = {};
  for (const route of routes) {
    Object.assign(all, sourceHashesFor(route.dependencies));
  }
  return all;
}

function routeSourceChanged(route, previousSourceHashes) {
  const current = sourceHashesFor(route.dependencies);
  for (const [filePath, hash] of Object.entries(current)) {
    if (previousSourceHashes[filePath] !== hash) {
      return true;
    }
  }
  for (const filePath of Object.keys(previousSourceHashes)) {
    if (
      route.dependencies.some((dependency) =>
        filePath === dependency || filePath.startsWith(`${dependency}/`),
      ) &&
      current[filePath] === undefined
    ) {
      return true;
    }
  }
  return false;
}

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function outputHash(outputPath) {
  const absolute = path.join(outDir, outputPath);
  return fileExists(absolute) ? hashFile(absolute) : undefined;
}

function loadPreviousManifest() {
  if (!fileExists(manifestPath)) {
    return undefined;
  }
  return readJson(manifestPath);
}

function assetsFromViteManifest() {
  const viteManifestPath = path.join(outDir, ".vite", "manifest.json");
  if (!fileExists(viteManifestPath)) {
    return { css: [], js: [] };
  }

  const manifest = readJson(viteManifestPath);
  const clientEntry = manifest["src/site/client.tsx"];
  if (clientEntry === undefined) {
    return { css: [], js: [] };
  }

  return {
    css: [
      ...(clientEntry.css ?? []).map((asset) => `/${asset}`),
      "/assets/static-modules.css",
    ],
    js: [`/${clientEntry.file}`],
  };
}

function assetOutputPaths(assets) {
  return [...assets.css, ...assets.js].map((asset) => asset.replace(/^\//, ""));
}

function assetsChanged(previousManifest, assets) {
  return JSON.stringify(previousManifest?.assets ?? {}) !== JSON.stringify(assets);
}

function moduleClassNames(css) {
  return new Set(
    [...css.matchAll(/\.([_A-Za-z][_A-Za-z0-9-]*)/g)].map((match) => match[1]),
  );
}

function transformCssModule(filePath) {
  const css = fs.readFileSync(filePath, "utf8");
  const classNames = moduleClassNames(css);
  const protectedUrls = [];
  let transformed = css.replace(/url\(([^)]*)\)/g, (match) => {
    const placeholder = `__STATIC_CSS_URL_${protectedUrls.length}__`;
    protectedUrls.push(match);
    return placeholder;
  });
  for (const className of classNames) {
    transformed = transformed.replaceAll(
      `.${className}`,
      `.${cssModuleClassName(className, filePath)}`,
    );
  }
  protectedUrls.forEach((url, index) => {
    transformed = transformed.replaceAll(`__STATIC_CSS_URL_${index}__`, url);
  });
  return `\n/* ${relative(filePath)} */\n${transformed}\n`;
}

function cssModuleSortKey(filePath) {
  const file = relative(filePath);
  if (file === "src/app/layout.module.css") {
    return `00:${file}`;
  }
  if (file.endsWith("/layout.module.css")) {
    return `10:${file}`;
  }
  if (file === "src/app/website/website.module.css") {
    return `20:${file}`;
  }
  return `30:${file}`;
}

function writeStaticModuleCss() {
  const cssFiles = walkFiles("src/app")
    .filter((filePath) => filePath.endsWith(".module.css"))
    .sort((a, b) => cssModuleSortKey(a).localeCompare(cssModuleSortKey(b)));
  const outputPath = path.join(outDir, "assets", "static-modules.css");
  ensureParent(outputPath);
  fs.writeFileSync(
    outputPath,
    cssFiles.map((filePath) => transformCssModule(filePath)).join("\n"),
    "utf8",
  );
}

async function loadRenderer() {
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

function staleReasons(routes, previousManifest, sourceHashes) {
  const reasons = [];
  if (previousManifest === undefined) {
    reasons.push("missing out/.site-manifest.json");
    return reasons;
  }
  if (previousManifest.schemaVersion !== schemaVersion) {
    reasons.push("site manifest schema changed");
  }

  for (const [filePath, hash] of Object.entries(sourceHashes)) {
    if (previousManifest.sourceHashes?.[filePath] !== hash) {
      reasons.push(`source changed: ${filePath}`);
    }
  }

  for (const filePath of Object.keys(previousManifest.sourceHashes ?? {})) {
    if (sourceHashes[filePath] === undefined) {
      reasons.push(`source removed: ${filePath}`);
    }
  }

  const outputPaths = new Set(routes.map((route) => route.outputPath));
  outputPaths.add("sitemap.xml");
  outputPaths.add("robots.txt");
  outputPaths.add("_headers");
  for (const assetPath of assetOutputPaths(previousManifest.assets ?? { css: [], js: [] })) {
    outputPaths.add(assetPath);
  }

  for (const outputPath of outputPaths) {
    const hash = outputHash(outputPath);
    if (hash === undefined) {
      reasons.push(`output missing: ${outputPath}`);
    } else if (previousManifest.outputHashes?.[outputPath] !== hash) {
      reasons.push(`output changed: ${outputPath}`);
    }
  }

  for (const outputPath of Object.keys(previousManifest.outputHashes ?? {})) {
    if (!outputPaths.has(outputPath) && outputPath.endsWith(".html")) {
      reasons.push(`stale output tracked in manifest: ${outputPath}`);
    }
  }

  return reasons;
}

async function main() {
  const previousManifest = loadPreviousManifest();

  if (!checkOnly) {
    if (forceFull) {
      fs.rmSync(outDir, { recursive: true, force: true });
    } else {
      fs.rmSync(path.join(outDir, "assets"), { recursive: true, force: true });
      fs.rmSync(path.join(outDir, ".vite"), { recursive: true, force: true });
    }
    await build({ mode: process.env.NODE_ENV });
    writeStaticModuleCss();
  }

  const assets = assetsFromViteManifest();
  const { renderer, close } = await loadRenderer();
  try {
    const routes = await renderer.buildRoutes(assets);
    const sourceHashes = mergeHashes(routes);
    const didAssetsChange = assetsChanged(previousManifest, assets);

    if (checkOnly) {
      const reasons = staleReasons(routes, previousManifest, sourceHashes);
      if (reasons.length > 0) {
        console.error("Generated site is stale:");
        for (const reason of reasons.slice(0, 50)) {
          console.error(`- ${reason}`);
        }
        if (reasons.length > 50) {
          console.error(`- ...and ${reasons.length - 50} more`);
        }
        process.exit(1);
      }
      console.log("Generated site is fresh.");
      return;
    }

    fs.mkdirSync(outDir, { recursive: true });
    const currentRoutePaths = new Set(routes.map((route) => route.outputPath));
    const previousRoutePaths = new Set(
      Object.keys(previousManifest?.routes ?? {}).map(
        (routePath) => previousManifest.routes[routePath].outputPath,
      ),
    );
    const staleRoutes = [];

    for (const route of routes) {
      const output = path.join(outDir, route.outputPath);
      const shouldRender =
        forceFull ||
        previousManifest === undefined ||
        didAssetsChange ||
        !fileExists(output) ||
        routeSourceChanged(route, previousManifest.sourceHashes ?? {});
      if (shouldRender) {
        staleRoutes.push(route);
      }
    }

    for (const stalePath of previousRoutePaths) {
      if (!currentRoutePaths.has(stalePath)) {
        const absolute = path.join(outDir, stalePath);
        if (fileExists(absolute)) {
          fs.unlinkSync(absolute);
        }
      }
    }

    for (const route of staleRoutes) {
      const output = path.join(outDir, route.outputPath);
      ensureParent(output);
      fs.writeFileSync(output, await route.render(), "utf8");
    }

    fs.writeFileSync(path.join(outDir, "sitemap.xml"), await renderer.renderSitemap(), "utf8");
    fs.writeFileSync(path.join(outDir, "robots.txt"), renderer.renderRobots(), "utf8");
    if (fileExists(path.join(root, "_headers"))) {
      fs.copyFileSync(path.join(root, "_headers"), path.join(outDir, "_headers"));
    }

    const outputHashes = {};
    for (const route of routes) {
      outputHashes[route.outputPath] = outputHash(route.outputPath);
    }
    for (const outputPath of assetOutputPaths(assets)) {
      const hash = outputHash(outputPath);
      if (hash !== undefined) {
        outputHashes[outputPath] = hash;
      }
    }
    for (const outputPath of ["sitemap.xml", "robots.txt", "_headers"]) {
      const hash = outputHash(outputPath);
      if (hash !== undefined) {
        outputHashes[outputPath] = hash;
      }
    }

    const manifest = {
      schemaVersion: schemaVersion,
      generatedAt: new Date().toISOString(),
      assets: assets,
      sourceHashes: sourceHashes,
      outputHashes: outputHashes,
      routes: Object.fromEntries(
        routes.map((route) => [
          route.path,
          {
            outputPath: route.outputPath,
            dependencies: Object.keys(sourceHashesFor(route.dependencies)),
          },
        ]),
      ),
    };
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    console.log(
      `Generated ${staleRoutes.length} stale route(s), ${routes.length} total route(s).`,
    );
  } finally {
    await close();
  }
}

await main();
