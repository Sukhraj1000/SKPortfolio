import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const outputRoot = path.resolve("out");
const rootHtmlPath = path.join(outputRoot, "index.html");
const gameHtmlPath = path.join(outputRoot, "game", "index.html");

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

function localReferences(html) {
  return [...html.matchAll(/(?:href|src)="(\/[^"]+)"/g)]
    .map((match) => match[1].split(/[?#]/)[0])
    .filter(Boolean);
}

function initialScriptReferences(html) {
  return [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+\.js)"[^>]*>/gi)]
    .filter((match) => !/\bnomodule(?:\s|=|>)/i.test(match[0]))
    .map((match) => match[1].split(/[?#]/)[0]);
}

async function initialScriptTransferBytes(html) {
  const references = [...new Set(initialScriptReferences(html))];
  const compressedSizes = await Promise.all(
    references.map(async (reference) => {
      const source = await readFile(outputPathFor(reference));
      return gzipSync(source, { level: 9 }).byteLength;
    }),
  );
  return compressedSizes.reduce((total, size) => total + size, 0);
}

function outputPathFor(reference) {
  if (reference === "/") return rootHtmlPath;
  if (reference === "/game" || reference === "/game/") return gameHtmlPath;
  return path.join(outputRoot, reference.replace(/^\//, ""));
}

async function pathExists(target) {
  return stat(target).then(() => true).catch(() => false);
}

async function assertLocalReferencesExist(html, pageLabel) {
  const references = [...new Set(localReferences(html))];
  for (const reference of references) {
    const target = outputPathFor(reference);
    await stat(target).catch(() => {
      throw new Error(`${pageLabel} references missing output: ${reference}`);
    });
  }
}

const [rootHtml, gameHtml] = await Promise.all([
  readFile(rootHtmlPath, "utf8"),
  readFile(gameHtmlPath, "utf8"),
]);

assert(rootHtml.includes('data-portfolio-theme="orbital-engineering-journey"'), "Portfolio export is missing the Orbital Engineering Journey root.");
for (const sectionId of ["home", "projects", "about", "loadout", "contact"]) {
  assert(rootHtml.includes(`id="${sectionId}"`), `Portfolio export is missing the ${sectionId} chapter.`);
}
assert(rootHtml.includes("Projects with"), "Portfolio export is missing the Projects story heading.");
assert(rootHtml.includes("real gravity."), "Portfolio export is missing the Projects heading accent.");
assert(rootHtml.includes("Engineering under"), "Portfolio export is missing the Experience story heading.");
assert(rootHtml.includes("real constraints."), "Portfolio export is missing the Experience heading accent.");
assert(rootHtml.includes("A working systems"), "Portfolio export is missing the Skills story heading.");
assert(rootHtml.includes("constellation."), "Portfolio export is missing the Skills heading accent.");
assert(rootHtml.includes("Continue the"), "Portfolio export is missing the Contact story heading.");
assert(rootHtml.includes("conversation."), "Portfolio export is missing the Contact heading accent.");
assert(rootHtml.includes("Portfolio route / Dispatch"), "Portfolio export is missing the grounded dispatch scene.");
assert(rootHtml.includes("05 / Arrival bay"), "Portfolio export is missing the Contact arrival scene.");
assert(rootHtml.includes('data-disclosure-kind="mission"'), "Portfolio export is missing project disclosures.");
assert(rootHtml.includes('data-disclosure-kind="timeline"'), "Portfolio export is missing Experience disclosures.");
assert(rootHtml.includes('data-disclosure-kind="toolkit"'), "Portfolio export is missing Skills disclosures.");
assert(gameHtml.includes('id="game-training-title"'), "Game export is missing its training-shell heading.");
assert(gameHtml.includes("Five actions, then run."), "Game export is missing its five-step walkthrough premise.");
for (const action of ["Jump", "Dash", "Fast Drop", "Pause", "Story Log"]) {
  assert(gameHtml.includes(action), `Game training fallback is missing ${action}.`);
}
assert(gameHtml.includes("Exit to Portfolio"), "Game export is missing its direct Portfolio return.");
assert(!gameHtml.includes("<canvas"), "Server-rendered training fallback must not contain a canvas.");
assert(!/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(rootHtml), "Portfolio still depends on remote fonts.");

for (const [label, html] of [["Portfolio", rootHtml], ["Game training fallback", gameHtml]]) {
  assert(!/game\/assets|sk-character-sheet|industrial-world-atlas/i.test(html), `${label} eagerly requests game artwork.`);
  await assertLocalReferencesExist(html, label);
}

for (const requiredOutput of [
  ".htaccess",
  "_headers",
  "robots.txt",
  "404.html",
  "game/assets/sk-character-sheet.png",
  "game/assets/industrial-world-atlas.png",
  "game/assets/inventory.json",
]) {
  assert(
    await pathExists(path.join(outputRoot, requiredOutput)),
    `Static export is missing ${requiredOutput}.`,
  );
}

const initialScriptBudgets = [
  ["Portfolio", rootHtml, 200_000],
  ["Game training fallback", gameHtml, 200_000],
];
const initialScriptTransfers = [];
for (const [label, html, maximumBytes] of initialScriptBudgets) {
  const transferBytes = await initialScriptTransferBytes(html);
  assert(
    transferBytes <= maximumBytes,
    `${label} initial scripts exceed their ${maximumBytes}-byte gzip budget.`,
  );
  initialScriptTransfers.push([label, transferBytes]);
}

const chunkDirectory = path.join(outputRoot, "_next", "static", "chunks");
const chunkFiles = (await walk(chunkDirectory)).filter((file) => file.endsWith(".js"));
const phaserChunks = [];

for (const file of chunkFiles) {
  const source = await readFile(file, "utf8");
  if (/\bphaser\b/i.test(source)) phaserChunks.push(path.basename(file));
}

assert(phaserChunks.length > 0, "Expected a lazy Phaser runtime chunk in the game build.");
for (const chunk of phaserChunks) {
  assert(!rootHtml.includes(chunk), `Portfolio eagerly loads Phaser chunk ${chunk}.`);
  assert(!gameHtml.includes(chunk), `Server-rendered Game fallback eagerly loads Phaser chunk ${chunk}.`);
}

const portfolioScripts = localReferences(rootHtml).filter((reference) =>
  reference.endsWith(".js"),
);
for (const reference of portfolioScripts) {
  const source = await readFile(outputPathFor(reference), "utf8");
  assert(
    !/industrial-world-atlas|sk-character-sheet|Five actions complete/i.test(source),
    `Portfolio script ${reference} contains Chronicle runtime code.`,
  );
}

const assetBudgets = [
  ["sk-icon.png", 64_000],
  ["skaltek-logo-card.webp", 100_000],
  ["cryptoapp.webp", 100_000],
  ["sk-operator-sheet.png", 60_000],
  ["game/assets/sk-character-sheet.png", 64_000],
  ["game/assets/industrial-world-atlas.png", 500_000],
];

for (const [asset, maximumBytes] of assetBudgets) {
  const { size } = await stat(path.join(outputRoot, asset));
  assert(size <= maximumBytes, `${asset} exceeds its ${maximumBytes}-byte release budget.`);
}

console.log("Static release validation passed.");
for (const [label, transferBytes] of initialScriptTransfers) {
  console.log(`${label} initial scripts (gzip): ${(transferBytes / 1000).toFixed(1)} kB`);
}
console.log(`Lazy Phaser chunks: ${phaserChunks.join(", ")}`);
