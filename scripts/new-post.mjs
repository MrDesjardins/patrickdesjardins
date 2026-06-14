#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const options = {
    kind: "blog",
    extension: "mdx",
    date: new Date().toISOString().slice(0, 10),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--title") {
      options.title = readValue(argv, ++i, arg);
    } else if (arg === "--date") {
      options.date = readValue(argv, ++i, arg);
    } else if (arg === "--kind") {
      options.kind = readValue(argv, ++i, arg);
    } else if (arg === "--extension") {
      options.extension = readValue(argv, ++i, arg).replace(/^\./, "");
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else if (options.title === undefined) {
      options.title = arg;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (options.title === undefined || options.title.trim() === "") {
    throw new Error("A title is required.");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(options.date)) {
    throw new Error("--date must use YYYY-MM-DD format.");
  }
  if (!["blog", "philosophy"].includes(options.kind)) {
    throw new Error('--kind must be "blog" or "philosophy".');
  }
  if (!["md", "mdx"].includes(options.extension)) {
    throw new Error('--extension must be "md" or "mdx".');
  }

  return options;
}

function readValue(argv, index, flag) {
  if (index >= argv.length || argv[index].startsWith("--")) {
    throw new Error(`${flag} requires a value.`);
  }
  return argv[index];
}

function printHelp() {
  console.log(`Usage: node scripts/new-post.mjs --title "Post title" [options]

Options:
  --date YYYY-MM-DD        Publish date, defaults to today
  --kind blog|philosophy   Content collection, defaults to blog
  --extension md|mdx       File extension, defaults to mdx
`);
}

function slugify(title) {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const root = options.kind === "blog" ? "src/_posts" : "src/_philosophy";
  const year = options.date.slice(0, 4);
  const dir = path.join(root, year);
  const slug = slugify(options.title);
  if (slug.length === 0) {
    throw new Error("Title must contain at least one letter or number.");
  }

  const filePath = path.join(dir, `${slug}.${options.extension}`);
  if (fs.existsSync(filePath)) {
    throw new Error(`Post already exists: ${filePath}`);
  }

  fs.mkdirSync(dir, { recursive: true });
  const categories =
    options.kind === "blog"
      ? "categories:\n  - Uncategorized\n"
      : "categories:\n";
  const content = `---\ntitle: "${options.title.replace(/"/g, '\\"')}"\ndate: "${options.date}"\n${categories}---\n\n`;
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Created ${filePath}`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
