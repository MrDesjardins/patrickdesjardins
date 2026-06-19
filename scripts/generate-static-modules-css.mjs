#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function walkModuleCssFiles(appDir) {
  const files = [];
  const stack = [appDir];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".module.css")) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

function cssModuleSortKey(root, file) {
  const relative = path.relative(root, file).split(path.sep).join("/");
  let prefix = "30";
  if (relative === "src/app/layout.module.css") {
    prefix = "00";
  } else if (relative.endsWith("/layout.module.css")) {
    prefix = "10";
  } else if (relative === "src/app/website/website.module.css") {
    prefix = "20";
  }
  return `${prefix}:${relative}`;
}

function cssModuleClassName(root, localName, file) {
  const src = path.join(root, "src");
  let relative = path.relative(src, file).split(path.sep).join("/");
  relative = relative.replace(/\.module\.css$/, "");
  const safe = relative.replace(/[^A-Za-z0-9_]/g, "_");
  return `${safe}__${localName}`;
}

function classNames(css) {
  const names = new Set();
  let index = 0;
  while (index + 1 < css.length) {
    if (css[index] === ".") {
      const start = index + 1;
      const first = css[start];
      if (first === "_" || /[A-Za-z]/.test(first)) {
        let end = start + 1;
        while (
          end < css.length &&
          (css[end] === "_" || css[end] === "-" || /[0-9A-Za-z]/.test(css[end]))
        ) {
          end += 1;
        }
        names.add(css.slice(start, end));
        index = end;
        continue;
      }
    }
    index += 1;
  }
  return names;
}

function protectUrls(css) {
  const protectedUrls = [];
  let output = "";
  let rest = css;
  while (true) {
    const start = rest.indexOf("url(");
    if (start === -1) {
      output += rest;
      break;
    }
    const end = rest.indexOf(")", start);
    if (end === -1) {
      output += rest;
      break;
    }
    output += rest.slice(0, start);
    const placeholder = `__STATIC_CSS_URL_${protectedUrls.length}__`;
    protectedUrls.push(rest.slice(start, end + 1));
    output += placeholder;
    rest = rest.slice(end + 1);
  }
  return { output, protectedUrls };
}

function transformCssModule(root, file) {
  const css = fs.readFileSync(file, "utf8");
  const names = classNames(css);
  const { output: protectedCss, protectedUrls } = protectUrls(css);
  let transformed = protectedCss;
  for (const name of names) {
    transformed = transformed.replaceAll(
      `.${name}`,
      `.${cssModuleClassName(root, name, file)}`,
    );
  }
  for (const [index, url] of protectedUrls.entries()) {
    transformed = transformed.replace(`__STATIC_CSS_URL_${index}__`, url);
  }
  const relative = path.relative(root, file).split(path.sep).join("/");
  return `\n/* ${relative} */\n${transformed}\n`;
}

export function generateStaticModuleCss(root = process.cwd()) {
  const appDir = path.join(root, "src/app");
  const files = walkModuleCssFiles(appDir).sort((left, right) =>
    cssModuleSortKey(root, left).localeCompare(cssModuleSortKey(root, right)),
  );
  return files.map((file) => transformCssModule(root, file)).join("");
}
