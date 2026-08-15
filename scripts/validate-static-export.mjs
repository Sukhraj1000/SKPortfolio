import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

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

assert(rootHtml.includes('data-portfolio-theme="pixel-quest"'), "Portfolio export is missing the Pixel Quest root.");
for (const sectionId of ["home", "projects", "about", "loadout", "contact"]) {
  assert(rootHtml.includes(`id="${sectionId}"`), `Portfolio export is missing the ${sectionId} chapter.`);
}
assert(rootHtml.includes("Proof lives in what shipped."), "Portfolio export is missing the Projects story heading.");
assert(rootHtml.includes("Every environment added a new constraint."), "Portfolio export is missing the Experience story heading.");
assert(rootHtml.includes("Choose tools for the constraint."), "Portfolio export is missing the Skills story heading.");
assert(rootHtml.includes("The story is still being written."), "Portfolio export is missing the Contact story heading.");
assert(gameHtml.includes('id="game-ready-title"'), "Game export is missing its ready-state heading.");
assert(!gameHtml.includes("<canvas"), "Game canvas must not boot before Start deployment.");
assert(!/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(rootHtml), "Portfolio still depends on remote fonts.");

for (const [label, html] of [["Portfolio", rootHtml], ["Game ready state", gameHtml]]) {
  assert(!/game\/assets|sk-character-sheet|industrial-world-atlas/i.test(html), `${label} eagerly requests game artwork.`);
  await assertLocalReferencesExist(html, label);
}

for (const requiredOutput of [".htaccess", "robots.txt", "404.html"]) {
  assert(
    await pathExists(path.join(outputRoot, requiredOutput)),
    `Static export is missing ${requiredOutput}.`,
  );
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
  assert(!gameHtml.includes(chunk), `Game ready state eagerly loads Phaser chunk ${chunk}.`);
}

const assetBudgets = [
  ["sk-icon.png", 64_000],
  ["skaltek-logo-card.webp", 100_000],
  ["cryptoapp.webp", 100_000],
  ["sk-operator-sheet.png", 60_000],
];

for (const [asset, maximumBytes] of assetBudgets) {
  const { size } = await stat(path.join(outputRoot, asset));
  assert(size <= maximumBytes, `${asset} exceeds its ${maximumBytes}-byte release budget.`);
}

console.log("Static release validation passed.");
console.log(`Lazy Phaser chunks: ${phaserChunks.join(", ")}`);
