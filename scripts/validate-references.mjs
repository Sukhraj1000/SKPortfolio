#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(entryPath) : [entryPath];
    }),
  );
  return files.flat();
}

const sourceFiles = (
  await Promise.all(["src", "tests", "scripts"].map((directory) => walk(directory).catch(() => [])))
).flat();
const textFiles = sourceFiles.filter(
  (file) =>
    file !== "scripts/validate-references.mjs" && /\.(?:css|js|json|mjs|ts|tsx)$/.test(file),
);
const sourceText = (await Promise.all(textFiles.map((file) => readFile(file, "utf8")))).join("\n");

for (const retiredReference of [
  "sk-operator-portrait.png",
  "components/ui/pixel-frame",
  "getObfuscatedEmail",
  "pq-scene-sky",
  "pq-scene-beacon",
  "pq-signal-orbits",
  "pq-pixel-corners",
]) {
  assert(!sourceText.includes(retiredReference), `Retired reference remains: ${retiredReference}`);
}

const phaserSource = await readFile("src/components/game/phaser/createChronicleGame.ts", "utf8");
const hardcodedCanvasColours = [...phaserSource.matchAll(/0x[0-9a-f]{6}/gi)].map((match) =>
  match[0].toLowerCase(),
);
const intentionalTextureMasks = new Set(["0xffffff"]);
assert(
  hardcodedCanvasColours.every((colour) => intentionalTextureMasks.has(colour)),
  `Phaser display colour bypasses the host palette: ${hardcodedCanvasColours
    .filter((colour) => !intentionalTextureMasks.has(colour))
    .join(", ")}`,
);

const publicFiles = (await walk("public")).filter((file) => !file.endsWith(".DS_Store"));
const intentionallyDirectOutputs = new Set([
  ".htaccess", // Hostinger deployment policy copied verbatim into out/.
  "README.md", // Human-readable Chronicle asset provenance.
  "inventory.json", // Release-validated asset inventory, not a runtime fetch.
]);
for (const file of publicFiles) {
  const basename = path.basename(file);
  if (intentionallyDirectOutputs.has(basename)) continue;
  assert(sourceText.includes(basename), `Public asset has no source or test reference: ${file}`);
}

console.log("Dead-reference, public-asset, and Phaser palette validation passed.");
