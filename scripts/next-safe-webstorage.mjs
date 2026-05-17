#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

const supportsNoWebStorage = spawnSync(
  process.execPath,
  ["--no-experimental-webstorage", "-e", ""],
  { stdio: "ignore" }
).status === 0;

const nodeArgs = supportsNoWebStorage ? ["--no-experimental-webstorage"] : [];

const result = spawnSync(
  process.execPath,
  [...nodeArgs, nextBin, ...process.argv.slice(2)],
  { stdio: "inherit", env: process.env }
);

if (result.signal) {
  process.kill(process.pid, result.signal);
} else {
  process.exit(result.status ?? 1);
}
