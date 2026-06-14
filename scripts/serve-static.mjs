#!/usr/bin/env node
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? "out");
const port = Number(process.env.PORT ?? process.argv[3] ?? 3000);

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
  [".xml", "application/xml; charset=utf-8"],
]);

function resolveRequestPath(requestUrl) {
  const url = new URL(requestUrl ?? "/", "http://127.0.0.1");
  const pathname = decodeURIComponent(url.pathname);
  const candidates = [
    pathname,
    `${pathname}.html`,
    path.join(pathname, "index.html"),
  ];

  for (const candidate of candidates) {
    const filePath = path.resolve(root, `.${candidate}`);
    if (!filePath.startsWith(root) || !fs.existsSync(filePath)) {
      continue;
    }
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      return filePath;
    }
  }

  return path.join(root, "404.html");
}

const server = http.createServer((request, response) => {
  const filePath = resolveRequestPath(request.url);
  const extension = path.extname(filePath);
  response.setHeader(
    "Content-Type",
    contentTypes.get(extension) ?? "application/octet-stream",
  );
  response.statusCode = path.basename(filePath) === "404.html" ? 404 : 200;
  fs.createReadStream(filePath).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Serving ${root} at http://127.0.0.1:${port}`);
});
