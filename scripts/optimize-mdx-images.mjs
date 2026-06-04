#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const DEFAULT_CONTENT_ROOTS = ["src/_posts", "src/_philosophy"];
const DEFAULT_MAX_BYTES = 1_000_000;
const DEFAULT_MAX_WIDTH = 1000;
const DEFAULT_MIN_WIDTH = 650;
const DEFAULT_QUALITY = 95;
const DEFAULT_COMPRESSION_LEVEL = 6;

function parseArgs(argv) {
  const options = {
    roots: [],
    dryRun: false,
    keepOriginals: false,
    maxBytes: DEFAULT_MAX_BYTES,
    maxWidth: DEFAULT_MAX_WIDTH,
    minWidth: DEFAULT_MIN_WIDTH,
    quality: DEFAULT_QUALITY,
    compressionLevel: DEFAULT_COMPRESSION_LEVEL,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--keep-originals") {
      options.keepOriginals = true;
    } else if (arg === "--max-bytes") {
      options.maxBytes = Number(readValue(argv, ++i, arg));
    } else if (arg === "--max-width") {
      options.maxWidth = Number(readValue(argv, ++i, arg));
    } else if (arg === "--min-width") {
      options.minWidth = Number(readValue(argv, ++i, arg));
    } else if (arg === "--quality") {
      options.quality = Number(readValue(argv, ++i, arg));
    } else if (arg === "--compression-level") {
      options.compressionLevel = Number(readValue(argv, ++i, arg));
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else if (arg.startsWith("--")) {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      options.roots.push(arg);
    }
  }

  if (options.roots.length === 0) {
    options.roots = DEFAULT_CONTENT_ROOTS;
  }
  for (const [name, value] of Object.entries({
    maxBytes: options.maxBytes,
    maxWidth: options.maxWidth,
    minWidth: options.minWidth,
    quality: options.quality,
    compressionLevel: options.compressionLevel,
  })) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`${name} must be a positive number`);
    }
  }
  if (options.maxWidth < options.minWidth) {
    throw new Error("--max-width must be greater than or equal to --min-width");
  }
  return options;
}

function readValue(argv, index, flag) {
  if (index >= argv.length || argv[index].startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }
  return argv[index];
}

function printHelp() {
  console.log(`Usage: node scripts/optimize-mdx-images.mjs [options] [content-root ...]

Scans MD/MDX files for root-relative public image references, converts oversized
PNG/JPEG images to WebP, updates references, and removes replaced originals when
they are no longer referenced.

Defaults:
  content roots: src/_posts src/_philosophy
  max bytes:     ${DEFAULT_MAX_BYTES}
  max width:     ${DEFAULT_MAX_WIDTH}px
  min width:     ${DEFAULT_MIN_WIDTH}px
  WebP quality:  ${DEFAULT_QUALITY}

Options:
  --dry-run               Report planned changes without writing files
  --keep-originals        Keep original oversized images after updating refs
  --max-bytes <bytes>     Convert images larger than this
  --max-width <px>        Resize wider images down to this width
  --min-width <px>        Never resize an image below this width
  --quality <1-100>       WebP quality passed to ffmpeg
  --compression-level <n> WebP compression level passed to ffmpeg
`);
}

function commandExists(command) {
  const result = spawnSync("command", ["-v", command], {
    shell: true,
    stdio: "ignore",
  });
  return result.status === 0;
}

function walkFiles(root, predicate) {
  const files = [];
  if (!fs.existsSync(root)) {
    return files;
  }
  const stats = fs.statSync(root);
  if (stats.isFile()) {
    return predicate(root) ? [root] : [];
  }
  const entries = fs.readdirSync(root, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath, predicate));
    } else if (predicate(fullPath)) {
      files.push(fullPath);
    }
  }
  return files;
}

function extractImageRefs(content) {
  const refs = new Set();
  const markdownImagePattern = /!\[[^\]]*]\((\/[^)\s"'<>]+\.(?:png|jpe?g))\)/gi;
  const srcPattern = /\bsrc=(?:"|{")((?:\/[^"'}\s<>]+)\.(?:png|jpe?g))(?:"|"}\})/gi;

  for (const pattern of [markdownImagePattern, srcPattern]) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      refs.add(match[1]);
    }
  }
  return refs;
}

function getImageDimensions(filePath) {
  const result = spawnSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height",
      "-of",
      "csv=p=0:s=x",
      filePath,
    ],
    { encoding: "utf8" },
  );
  if (result.status !== 0) {
    throw new Error(`ffprobe failed for ${filePath}: ${result.stderr.trim()}`);
  }
  const [width, height] = result.stdout.trim().split("x").map(Number);
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    throw new Error(`Could not read dimensions for ${filePath}`);
  }
  return { width, height };
}

function convertToWebp(sourcePath, outputPath, targetWidth, options) {
  const args = [
    "-y",
    "-v",
    "error",
    "-i",
    sourcePath,
    "-vf",
    `scale=${targetWidth}:-2`,
    "-c:v",
    "libwebp",
    "-quality",
    String(options.quality),
    "-compression_level",
    String(options.compressionLevel),
    outputPath,
  ];
  const result = spawnSync("ffmpeg", args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`ffmpeg failed for ${sourcePath}: ${result.stderr.trim()}`);
  }
}

function replaceAll(content, replacements) {
  let updated = content;
  for (const [from, to] of replacements) {
    updated = updated.split(from).join(to);
  }
  return updated;
}

function publicPathToFilePath(publicPath) {
  return path.join("public", publicPath.slice(1));
}

function toPublicPath(filePath) {
  return `/${path.relative("public", filePath).split(path.sep).join("/")}`;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!commandExists("ffmpeg") || !commandExists("ffprobe")) {
    throw new Error("This script requires ffmpeg and ffprobe on PATH");
  }

  const contentFiles = options.roots.flatMap((root) =>
    walkFiles(root, (filePath) => /\.mdx?$/.test(filePath)),
  );
  const refsByFile = new Map();
  const allRefs = new Map();
  for (const filePath of contentFiles) {
    const content = fs.readFileSync(filePath, "utf8");
    const refs = extractImageRefs(content);
    refsByFile.set(filePath, refs);
    for (const ref of refs) {
      if (!allRefs.has(ref)) {
        allRefs.set(ref, new Set());
      }
      allRefs.get(ref).add(filePath);
    }
  }

  const replacements = new Map();
  const conversions = [];
  const warnings = [];

  for (const ref of [...allRefs.keys()].sort()) {
    const sourcePath = publicPathToFilePath(ref);
    if (!fs.existsSync(sourcePath)) {
      warnings.push(`Missing referenced image: ${sourcePath}`);
      continue;
    }
    const size = fs.statSync(sourcePath).size;
    if (size <= options.maxBytes) {
      continue;
    }
    const extension = path.extname(sourcePath).toLowerCase();
    if (![".png", ".jpg", ".jpeg"].includes(extension)) {
      continue;
    }

    const dimensions = getImageDimensions(sourcePath);
    const targetWidth =
      dimensions.width > options.maxWidth
        ? Math.max(options.minWidth, options.maxWidth)
        : dimensions.width;
    const outputPath = sourcePath.replace(/\.(png|jpe?g)$/i, ".webp");
    const outputRef = toPublicPath(outputPath);
    replacements.set(ref, outputRef);
    conversions.push({
      ref,
      outputRef,
      sourcePath,
      outputPath,
      size,
      dimensions,
      targetWidth,
    });
  }

  if (conversions.length === 0) {
    console.log("No oversized referenced images found.");
    for (const warning of warnings) {
      console.warn(`Warning: ${warning}`);
    }
    return;
  }

  for (const conversion of conversions) {
    const planned = `${conversion.ref} (${conversion.size} bytes, ${conversion.dimensions.width}x${conversion.dimensions.height}) -> ${conversion.outputRef} (${conversion.targetWidth}px wide)`;
    if (options.dryRun) {
      console.log(`[dry-run] ${planned}`);
      continue;
    }
    convertToWebp(
      conversion.sourcePath,
      conversion.outputPath,
      conversion.targetWidth,
      options,
    );
    const outputSize = fs.statSync(conversion.outputPath).size;
    const outputDimensions = getImageDimensions(conversion.outputPath);
    console.log(
      `${planned}; output ${outputSize} bytes, ${outputDimensions.width}x${outputDimensions.height}`,
    );
    if (outputSize > options.maxBytes) {
      warnings.push(
        `Converted image still exceeds ${options.maxBytes} bytes: ${conversion.outputPath}`,
      );
    }
    if (outputDimensions.width < options.minWidth) {
      warnings.push(
        `Converted image is below ${options.minWidth}px wide because the source was ${conversion.dimensions.width}px wide: ${conversion.outputPath}`,
      );
    }
  }

  if (!options.dryRun) {
    for (const [filePath, refs] of refsByFile) {
      const fileReplacements = [...refs]
        .filter((ref) => replacements.has(ref))
        .map((ref) => [ref, replacements.get(ref)]);
      if (fileReplacements.length === 0) {
        continue;
      }
      const original = fs.readFileSync(filePath, "utf8");
      const updated = replaceAll(original, fileReplacements);
      if (updated !== original) {
        fs.writeFileSync(filePath, updated);
        console.log(`Updated references in ${filePath}`);
      }
    }
  }

  if (!options.keepOriginals && !options.dryRun) {
    const updatedContent = contentFiles
      .map((filePath) => fs.readFileSync(filePath, "utf8"))
      .join("\n");
    for (const conversion of conversions) {
      if (!updatedContent.includes(conversion.ref)) {
        fs.unlinkSync(conversion.sourcePath);
        console.log(`Removed ${conversion.sourcePath}`);
      } else {
        warnings.push(
          `Kept ${conversion.sourcePath} because it is still referenced`,
        );
      }
    }
  }

  for (const warning of warnings) {
    console.warn(`Warning: ${warning}`);
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
