#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const result = spawnSync(
  "cargo",
  [
    "run",
    "--quiet",
    "--manifest-path",
    "tools/sitegen/Cargo.toml",
    "--",
    ...process.argv.slice(2),
  ],
  {
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV ?? "production",
    },
    stdio: "inherit",
  },
);

if (result.error !== undefined) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
