#!/usr/bin/env node
import http from "node:http";
import { createServer as createViteServer } from "vite";

const port = Number(process.env.PORT ?? 3000);

process.env.NODE_ENV = "development";

function requestPath(requestUrl) {
  const url = new URL(requestUrl ?? "/", "http://127.0.0.1");
  const pathname = decodeURIComponent(url.pathname);
  return pathname.endsWith(".html") && pathname !== "/index.html"
    ? pathname.slice(0, -".html".length)
    : pathname === "/index.html"
      ? "/"
      : pathname;
}

function shouldReload(filePath) {
  return (
    filePath.includes("/src/app/") ||
    filePath.includes("/src/_posts/") ||
    filePath.includes("/src/lib/") ||
    filePath.includes("/src/site/") ||
    filePath.includes("/src/constants/")
  );
}

const vite = await createViteServer({
  appType: "custom",
  logLevel: "info",
  server: {
    hmr: { server: undefined },
    middlewareMode: true,
  },
});

vite.watcher.on("change", (filePath) => {
  if (shouldReload(filePath)) {
    vite.ws.send({ type: "full-reload" });
  }
});

const devAssets = {
  css: [],
  js: ["/@vite/client", "/src/site/client.tsx"],
};

const server = http.createServer((request, response) => {
  vite.middlewares(request, response, async () => {
    try {
      const renderer = await vite.ssrLoadModule("/src/site/render.tsx");
      const pathname = requestPath(request.url);

      if (pathname === "/sitemap.xml") {
        response.setHeader("Content-Type", "application/xml; charset=utf-8");
        response.end(await renderer.renderSitemap());
        return;
      }

      if (pathname === "/robots.txt") {
        response.setHeader("Content-Type", "text/plain; charset=utf-8");
        response.end(renderer.renderRobots());
        return;
      }

      const routes = await renderer.buildRoutes(devAssets);
      const route =
        routes.find((candidate) => candidate.path === pathname) ??
        routes.find((candidate) => candidate.path === "/404");
      const html =
        route === undefined
          ? "Not found"
          : await vite.transformIndexHtml(pathname, await route.render());

      response.statusCode = route?.path === "/404" ? 404 : 200;
      response.setHeader("Content-Type", "text/html; charset=utf-8");
      response.end(html);
    } catch (error) {
      vite.ssrFixStacktrace(error);
      response.statusCode = 500;
      response.setHeader("Content-Type", "text/plain; charset=utf-8");
      response.end(error instanceof Error ? error.stack : String(error));
    }
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Serving development site at http://127.0.0.1:${port}`);
});

function close() {
  server.close(() => {
    void vite.close().then(() => process.exit(0));
  });
}

process.on("SIGINT", close);
process.on("SIGTERM", close);
