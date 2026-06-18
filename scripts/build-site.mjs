#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const manifestPath = "tools/sitegen/Cargo.toml";
const releaseBinary = path.resolve("tools/sitegen/target/release/sitegen");
const sitegenArgs = process.argv.slice(2);
const env = {
  ...process.env,
  NODE_ENV: process.env.NODE_ENV ?? "production",
};

function run(command, args) {
  return spawnSync(command, args, {
    env,
    stdio: "inherit",
  });
}

const buildResult = run("cargo", [
  "build",
  "--release",
  "--quiet",
  "--manifest-path",
  manifestPath,
]);
if (buildResult.error !== undefined) {
  console.error(buildResult.error.message);
  process.exit(1);
}
if (buildResult.status !== 0) {
  process.exit(buildResult.status ?? 1);
}

const result = run(releaseBinary, sitegenArgs);

if (result.error !== undefined) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
