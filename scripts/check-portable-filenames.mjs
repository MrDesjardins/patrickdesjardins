#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const DEFAULT_ROOTS = ["public", "src", "scripts", "tools", ".github"];
const INVALID_NAME_PATTERN = /["*:<>?|\r\n]/;
const SKIPPED_DIRECTORIES = new Set([
  ".git",
  ".next",
  "node_modules",
  "out",
  ".venv",
  "__pycache__",
]);

function walk(root, invalidPaths) {
  if (!fs.existsSync(root)) {
    return;
  }

  const stats = fs.statSync(root);
  const name = path.basename(root);
  if (INVALID_NAME_PATTERN.test(name)) {
    invalidPaths.push(root);
  }

  if (!stats.isDirectory()) {
    return;
  }

  if (SKIPPED_DIRECTORIES.has(name)) {
    return;
  }

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    walk(path.join(root, entry.name), invalidPaths);
  }
}

function main() {
  const roots = process.argv.slice(2);
  const scanRoots = roots.length > 0 ? roots : DEFAULT_ROOTS;
  const invalidPaths = [];

  for (const root of scanRoots) {
    walk(root, invalidPaths);
  }

  if (invalidPaths.length > 0) {
    console.error("Portable filename check failed.");
    console.error(
      'Filenames may not contain Windows-incompatible characters: " * : < > ? |',
    );
    for (const invalidPath of invalidPaths.sort()) {
      console.error(`- ${invalidPath}`);
    }
    process.exit(1);
  }

  console.log("Portable filename check passed.");
}

main();
