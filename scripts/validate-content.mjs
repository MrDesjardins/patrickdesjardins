#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const COLLECTIONS = [
  { name: "blog", root: "src/_posts", requireCategories: true },
  { name: "philosophy", root: "src/_philosophy", requireCategories: false },
];
const POST_EXTENSIONS = new Set([".md", ".mdx"]);
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function walkFiles(root) {
  if (!fs.existsSync(root)) {
    return [];
  }
  const entries = fs.readdirSync(root, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      return walkFiles(fullPath);
    }
    return [fullPath];
  });
}

function parseFrontmatter(content) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(content);
  if (match === null) {
    return null;
  }

  const lines = match[1].split(/\r?\n/);
  const frontmatter = {};
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const scalar = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (scalar === null) {
      continue;
    }
    const [, key, rawValue] = scalar;
    if (rawValue === "") {
      const values = [];
      while (i + 1 < lines.length && /^\s*-\s+/.test(lines[i + 1])) {
        i += 1;
        values.push(lines[i].replace(/^\s*-\s+/, "").trim().replace(/^["']|["']$/g, ""));
      }
      frontmatter[key] = values;
    } else {
      frontmatter[key] = rawValue.trim().replace(/^["']|["']$/g, "");
    }
  }
  return frontmatter;
}

function extractLocalImageRefs(content) {
  const refs = new Set();
  const markdownImagePattern = /!\[[^\]]*]\((\/[^)\s"'<>]+)\)/g;
  const srcPattern = /\bsrc=(?:"|{")((?:\/[^"'}\s<>]+))(?:"|"}\})/g;
  for (const pattern of [markdownImagePattern, srcPattern]) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      refs.add(match[1]);
    }
  }
  return [...refs];
}

function validatePost(filePath, collection, slugOwners) {
  const errors = [];
  const warnings = [];
  const content = fs.readFileSync(filePath, "utf8");
  const frontmatter = parseFrontmatter(content);
  const extension = path.extname(filePath);
  const slug = path.basename(filePath, extension);
  const yearFolder = path.basename(path.dirname(filePath));

  if (frontmatter === null) {
    errors.push("missing YAML frontmatter");
  } else {
    if (typeof frontmatter.title !== "string" || frontmatter.title.length === 0) {
      errors.push("missing required frontmatter title");
    }
    if (typeof frontmatter.date !== "string" || !ISO_DATE_PATTERN.test(frontmatter.date)) {
      errors.push("date must use YYYY-MM-DD format");
    } else if (frontmatter.date.slice(0, 4) !== yearFolder) {
      warnings.push(
        `date year ${frontmatter.date.slice(0, 4)} does not match folder ${yearFolder}`,
      );
    } else if (Number.isNaN(Date.parse(`${frontmatter.date}T00:00:00Z`))) {
      errors.push(`date is not valid: ${frontmatter.date}`);
    }
    if (
      collection.requireCategories &&
      (!Array.isArray(frontmatter.categories) ||
        frontmatter.categories.length === 0)
    ) {
      errors.push("missing required frontmatter categories");
    }
  }

  const slugKey = `${collection.name}:${slug}`;
  const owner = slugOwners.get(slugKey);
  if (owner !== undefined) {
    errors.push(`duplicate slug also used by ${owner}`);
  } else {
    slugOwners.set(slugKey, filePath);
  }

  for (const ref of extractLocalImageRefs(content)) {
    if (!/\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(ref)) {
      continue;
    }
    const publicPath = path.join("public", ref.slice(1));
    if (!fs.existsSync(publicPath)) {
      warnings.push(`missing local image ${ref}`);
    }
  }

  return { errors, warnings };
}

function main() {
  const errors = [];
  const warnings = [];
  const slugOwners = new Map();

  for (const collection of COLLECTIONS) {
    for (const filePath of walkFiles(collection.root)) {
      const relative = path.relative(collection.root, filePath);
      const parts = relative.split(path.sep);
      const extension = path.extname(filePath);
      if (parts.length < 2 || !/^\d{4}$/.test(parts[0])) {
        continue;
      }
      if (!POST_EXTENSIONS.has(extension)) {
        if (
          !path.basename(filePath).startsWith("_") &&
          path.basename(filePath) !== "todo.txt"
        ) {
          errors.push(`${filePath}: unsupported post extension ${extension}`);
        }
        continue;
      }

      const result = validatePost(filePath, collection, slugOwners);
      for (const error of result.errors) {
        errors.push(`${filePath}: ${error}`);
      }
      for (const warning of result.warnings) {
        warnings.push(`${filePath}: ${warning}`);
      }
    }
  }

  for (const warning of warnings) {
    console.warn(`Warning: ${warning}`);
  }

  if (errors.length > 0) {
    console.error(`Content validation failed with ${errors.length} error(s):`);
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("Content validation passed.");
}

main();
