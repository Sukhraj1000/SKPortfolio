import { deepStrictEqual } from "node:assert";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
import htmlParser from "next/dist/compiled/node-html-parser/index.js";

const outputRoot = path.resolve("out");
const rootHtmlPath = path.join(outputRoot, "index.html");
const gameHtmlPath = path.join(outputRoot, "game", "index.html");
const netlifyHeadersPath = path.join(outputRoot, "_headers");
const apacheHeadersPath = path.join(outputRoot, ".htaccess");

function assert(condition, message) {
  if (!condition) throw new Error(message);
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
  return stat(target)
    .then(() => true)
    .catch(() => false);
}

async function pngDimensions(target) {
  const source = await readFile(target);
  const pngSignature = "89504e470d0a1a0a";
  assert(
    source.subarray(0, 8).toString("hex") === pngSignature,
    `${path.basename(target)} is not a valid PNG file.`,
  );
  return {
    width: source.readUInt32BE(16),
    height: source.readUInt32BE(20),
  };
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

const [rootHtml, gameHtml, netlifyHeaders, apacheHeaders] = await Promise.all([
  readFile(rootHtmlPath, "utf8"),
  readFile(gameHtmlPath, "utf8"),
  readFile(netlifyHeadersPath, "utf8"),
  readFile(apacheHeadersPath, "utf8"),
]);

for (const [label, policy] of [
  ["Netlify", netlifyHeaders],
  ["Apache", apacheHeaders],
]) {
  assert(
    policy.includes("img-src 'self' blob: data:"),
    `${label} CSP must allow Phaser-generated blob image URLs.`,
  );
}

assert(
  rootHtml.includes('data-portfolio-theme="orbital-engineering-journey"'),
  "Portfolio export is missing the Orbital Engineering Journey root.",
);
assert(
  rootHtml.includes('<link rel="canonical" href="https://sukhrajkalon.info/"'),
  "Portfolio export is missing its production canonical URL.",
);
assert(
  rootHtml.includes('id="portfolio-structured-data"') &&
    rootHtml.includes('"@context":"https://schema.org"'),
  "Portfolio export is missing recruiter-facing structured data.",
);
assert(
  rootHtml.includes('content="https://sukhrajkalon.info/sukhraj-kalon-social-card.png"') &&
    rootHtml.includes('property="og:image:width" content="1200"') &&
    rootHtml.includes('property="og:image:height" content="630"') &&
    rootHtml.includes('name="twitter:card" content="summary_large_image"') &&
    rootHtml.includes('name="twitter:image:alt"'),
  "Portfolio social metadata references a missing or non-canonical image.",
);
for (const [sectionId, chapter] of [
  ["home", "01"],
  ["projects", "02"],
  ["about", "03"],
  ["loadout", "04"],
  ["contact", "05"],
]) {
  assert(
    rootHtml.includes(`id="${sectionId}"`) && rootHtml.includes(`data-chapter="${chapter}"`),
    `Portfolio export is missing the ${sectionId} chapter.`,
  );
}
// Inspect the exported elements, not matching strings in Next's embedded hydration payload.
const document = htmlParser.parse(rootHtml);
const exportedIds = document.querySelectorAll("[id]").map((element) => element.getAttribute("id"));
assert(
  new Set(exportedIds).size === exportedIds.length,
  "Portfolio anchors must not have duplicate IDs.",
);
const projects = document.querySelector("#projects");
const about = document.querySelector("#about");
assert(projects && about, "Portfolio export is missing its Projects or Experience section.");
const mainProjects = projects.querySelectorAll("article[data-project-record]");
const retainedProjectImages = {
  "padel-match-analysis": "/images/work/padel.webp",
  "sketch-clash": "/images/work/sketch-clash.webp",
};
deepStrictEqual(
  mainProjects.map((article) => article.getAttribute("data-project-record")),
  [
    "padel-match-analysis",
    "sketch-clash",
    "tymaura",
    "signaldesk",
    "spend-limited-ai-agent-wallet",
    "fork-fighter",
  ],
  "#projects must export the six main project articles in reading order.",
);
assert(
  document.querySelectorAll("[data-project-record]").length === mainProjects.length,
  "Only the six main project articles may carry data-project-record.",
);
for (const [section, title] of [
  [projects, "Projects"],
  [about, "Experience"],
]) {
  assert(section.querySelector("h2")?.textContent.trim() === title, `Missing ${title} h2.`);
  assert(!section.querySelector("details"), `${title} must not hide content behind disclosures.`);
}
function directDestination(anchor, label) {
  const href = anchor?.getAttribute("href")?.trim();
  assert(
    href && /^(?:https:\/\/|\/(?![/?#]|$))/.test(href),
    `${label} needs a direct public destination, not a toggle or fragment.`,
  );
  assert(
    ["", "_self"].includes(anchor.getAttribute("target")?.toLowerCase() ?? ""),
    `${label} must not force a new tab.`,
  );
  return new URL(href, "https://sukhrajkalon.info/").href;
}

const visibleWorks = mainProjects.map((project) => {
  const label = project.getAttribute("data-project-record");
  const captions = project.querySelectorAll("p");
  const links = project.querySelectorAll("a");
  const name = project.querySelector("h3")?.textContent.trim();
  assert(name, `${label} needs an exported title.`);
  assert(captions.length === 1 && captions[0].textContent.trim(), `${label} needs one caption.`);
  assert(links.length === 1, `${label} needs one direct link.`);
  const images = project.querySelectorAll("img");
  assert(images.length === 1, `${label} needs one accessible local project image.`);
  const image = images[0];
  assert(
    /^\/(?!\/)[^?#]+\.(?:webp|svg)$/i.test(image.getAttribute("src") ?? ""),
    `${label} needs a local WebP or SVG image.`,
  );
  assert(
    (image.getAttribute("alt") ?? "").trim().split(/\s+/).length >= 3 &&
      image.getAttribute("aria-hidden") !== "true" &&
      !["none", "presentation"].includes(image.getAttribute("role")),
    `${label} needs descriptive, accessible image alt text.`,
  );
  for (const dimension of ["width", "height"]) {
    assert(
      /^[1-9]\d*$/.test(image.getAttribute(dimension) ?? ""),
      `${label} needs an explicit positive image ${dimension}.`,
    );
  }
  if (retainedProjectImages[label]) {
    assert(
      image.getAttribute("src") === retainedProjectImages[label],
      `${label} must retain its current imagery.`,
    );
  }
  return { name, url: directDestination(links[0], label) };
});
const universityLinks = projects
  .querySelectorAll("a")
  .filter((link) => !link.closest("article[data-project-record]"));
assert(universityLinks.length === 2, "University work must export two source links.");
const projectElements = projects.querySelectorAll("*");
const universityHeading = projectElements.find(
  (element) => /^H[1-6]$/.test(element.tagName) && element.textContent.trim() === "University work",
);
const headingPosition = projectElements.indexOf(universityHeading);
assert(
  headingPosition > projectElements.indexOf(mainProjects.at(-1)) &&
    universityLinks.every((link) => projectElements.indexOf(link) > headingPosition),
  "The two academic sources must follow the University work heading after the selected projects.",
);
for (const [index, [id, name]] of [
  ["project-solana-contract-generator", "Solana Smart Contract AI Generator"],
  ["project-crypto-portfolio", "Crypto Portfolio Mobile App"],
].entries()) {
  assert(projects.querySelector(`#${id}`), `University work is missing the #${id} fragment.`);
  const link = universityLinks[index];
  assert(link.textContent.includes(name), `University work must link the title ${name}.`);
  visibleWorks.push({ name, url: directDestination(link, name) });
}
const metadata = JSON.parse(document.querySelector("#portfolio-structured-data").rawText);
const byName = (a, b) => a.name.localeCompare(b.name);
deepStrictEqual(
  metadata["@graph"]
    .filter((entry) => entry["@type"] === "CreativeWork")
    .map(({ name, url }) => ({ name, url: new URL(url).href }))
    .sort(byName),
  visibleWorks.sort(byName),
  "Project metadata must describe exactly the six selected works and two university sources, not the game roster.",
);
const experienceRows = about.querySelectorAll("[data-experience-record]");
const experienceFacts = [
  {
    months: ["2025-09"],
    end: /present/i,
    overview: /software|applications?|engineering|systems?/i,
  },
  { months: ["2026-01"], end: /present/i, overview: /businesses|software|automation|AI/i },
  { months: ["2025-07", "2026-01"], overview: /administration|data|report|operations/i },
  { months: ["2023-09", "2024-09"], overview: /software|applications?|engineering|development/i },
  { months: ["2023-04", "2025-06"], overview: /LED|display|live|technical/i },
];
deepStrictEqual(
  experienceRows.map((row) => row.getAttribute("data-experience-record")),
  [
    "northrop-software-engineer",
    "skaltek-founder",
    "endeavour-data",
    "northrop-intern",
    "techfront-led-technician",
  ],
  "#about must export the five experience rows in reading order.",
);
for (const [index, row] of experienceRows.entries()) {
  const id = row.getAttribute("data-experience-record");
  assert(
    row.querySelector("h3")?.textContent.trim() && row.querySelector("p")?.textContent.trim(),
    `${id} must export its title and role overview.`,
  );
  assert(
    row.querySelector("time[datetime]")?.textContent.trim(),
    `${id} must export a readable date.`,
  );
  const facts = experienceFacts[index];
  deepStrictEqual(
    row.querySelectorAll("time").map((time) => time.getAttribute("datetime")),
    facts.months,
    `${id} must retain its period.`,
  );
  if (facts.end) assert(facts.end.test(row.textContent), `${id} must remain current.`);
  const summaries = row.querySelectorAll("p");
  assert(
    summaries.length === 1 && facts.overview.test(summaries[0].textContent),
    `${id} needs one role overview.`,
  );
  assert(
    !/evaluations? fail|enter the same figures twice|Java backend|React interface|pitchside|traced display faults|I visit/i.test(
      summaries[0].textContent,
    ),
    `${id} must summarise the role rather than an implementation anecdote.`,
  );
  if (id === "endeavour-data")
    assert(/part[ -]time/i.test(row.textContent), "Endeavour must retain its part-time status.");
  if (id === "northrop-software-engineer")
    assert(
      !/\bRAG\b|Model Context Protocol|\bMCP\b|Loop (?:&|and) Graph Engineering|Agent Evaluations?/i.test(
        row.textContent,
      ),
      "Do not attribute personal-only AI skills to Northrop Grumman.",
    );
}
directDestination(about.querySelector('[data-experience-record="skaltek-founder"] a'), "Skaltek");
assert(
  rootHtml.includes("Portfolio route / Dispatch"),
  "Portfolio export is missing the grounded dispatch scene.",
);
assert(
  rootHtml.includes("data-operator-berth"),
  "Portfolio export is missing the clean Profile operator berth.",
);
assert(
  rootHtml.includes("05 / Arrival bay"),
  "Portfolio export is missing the Contact arrival scene.",
);
const skills = document.querySelector("#loadout");
assert(skills?.querySelector("h2")?.textContent.trim() === "Skills", "Missing Skills h2.");
assert(
  skills.querySelectorAll(
    "details, summary, button, [role=button], dialog, [role=dialog], [data-level]",
  ).length === 0,
  "Skills must export complete lists without disclosures, dialogs or proficiency levels.",
);
assert(
  !/\b(?:primary|supporting)\b|\d+\s*%/i.test(skills.textContent),
  "Skills must not invent proficiency ratings.",
);
const capabilityRecords = skills.querySelectorAll("[data-capability-record]");
const capabilityAnchors = [
  [/\bPython\b/i, /C\+\+/i, /\bR\b/i, /\bRust\b/i],
  [/FastAPI/i, /Koa\.?js/i, /Phaser\s*3/i],
  [
    /Gemini\s*API/i,
    /multi[ -]agent orchestration/i,
    /agent memory/i,
    /evaluat/i,
    /Daytona.*sandbox/i,
  ],
  [/PostgreSQL/i, /NumPy/i, /SciPy/i, /MongoDB Atlas\W*Vector Search/i, /Change Streams/i],
  [/\bAWS\b/i, /GitHub Actions/i, /CI\s*\/\s*CD/i],
  [/Playwright/i, /accessibility checks/i],
  [/Daml/i, /Canton/i],
  [/OpenCV/i, /YOLOv8.*object detection/i, /Pi Camera/i],
];
deepStrictEqual(
  capabilityRecords.map((group) => group.getAttribute("data-capability-record")),
  [
    "languages",
    "application-engineering",
    "ai-automation",
    "backend-data",
    "cloud-delivery",
    "testing-quality",
    "emerging-technology",
    "vision-hardware",
  ],
  "Skills must export the eight CV groups in reading order.",
);
for (const [index, group] of capabilityRecords.entries()) {
  const id = group.getAttribute("data-capability-record");
  assert(group.querySelector("h3")?.textContent.trim(), `${id} needs a group h3.`);
  const items = group.querySelectorAll("[data-skill]");
  assert(items.length > 0, `${id} needs skill items in the exported HTML.`);
  for (const anchor of capabilityAnchors[index]) {
    assert(
      anchor.test(items.map((item) => item.textContent).join(" ")),
      `${id} is missing the public CV skill ${anchor}.`,
    );
  }
  for (const item of items) {
    assert(
      item.tagName === "LI" && item.closest("ul, ol") && item.textContent.trim(),
      `${id} needs a semantic list of readable skill items.`,
    );
    assert(!item.closest("[hidden], [aria-hidden=true]"), `${id} must not hide its skills.`);
  }
  const art = group.querySelectorAll("svg[data-skill-art]");
  assert(
    art.length === 1 && art[0].getAttribute("aria-hidden") === "true",
    `${id} needs one decorative skill SVG.`,
  );
  assert(
    art[0].getAttribute("tabindex") == null && art[0].getAttribute("focusable") === "false",
    `${id} artwork must be nonfocusable.`,
  );
  assert(!art[0].querySelector("a, [tabindex]"), `${id} artwork must not contain focus stops.`);
}
const renderedSkills = capabilityRecords.flatMap((group) =>
  group.querySelectorAll("[data-skill]").map((item) => item.textContent.trim()),
);
const person = metadata["@graph"].find((entry) => entry["@type"] === "Person");
assert(Array.isArray(person?.knowsAbout), "Person metadata must publish knowsAbout skill texts.");
deepStrictEqual(
  [...new Set(person.knowsAbout)].sort(),
  [...new Set(renderedSkills)].sort(),
  "Person.knowsAbout must agree with the public skill item texts.",
);
assert(
  gameHtml.includes('data-game-header="true"'),
  "Game export is missing the orbital Game navigation.",
);
assert(
  gameHtml.includes('data-game-theme="orbital-engineering-journey"'),
  "Game export is missing the orbital token scope.",
);
assert(
  gameHtml.includes('id="game-training-title"'),
  "Game export is missing its training-shell heading.",
);
assert(
  gameHtml.includes("Five actions, then run."),
  "Game export is missing its five-step walkthrough premise.",
);
for (const action of ["Jump", "Dash", "Fast Drop", "Pause", "Story Log"]) {
  assert(gameHtml.includes(action), `Game training fallback is missing ${action}.`);
}
assert(
  gameHtml.includes("Exit to Portfolio"),
  "Game export is missing its direct Portfolio return.",
);
assert(
  !gameHtml.includes("<canvas"),
  "Server-rendered training fallback must not contain a canvas.",
);
assert(
  !/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(rootHtml),
  "Portfolio still depends on remote fonts.",
);

for (const [label, html] of [
  ["Portfolio", rootHtml],
  ["Game training fallback", gameHtml],
]) {
  assert(
    !/game\/assets|sk-character-sheet|industrial-world-atlas/i.test(html),
    `${label} eagerly requests game artwork.`,
  );
  await assertLocalReferencesExist(html, label);
}

for (const requiredOutput of [
  ".htaccess",
  "_headers",
  "robots.txt",
  "sitemap.xml",
  "404.html",
  "sukhraj-kalon-social-card.png",
  "game/assets/sk-character-sheet.png",
  "game/assets/industrial-world-atlas.png",
  "game/assets/inventory.json",
]) {
  assert(
    await pathExists(path.join(outputRoot, requiredOutput)),
    `Static export is missing ${requiredOutput}.`,
  );
}

const socialCardDimensions = await pngDimensions(
  path.join(outputRoot, "sukhraj-kalon-social-card.png"),
);
assert(
  socialCardDimensions.width === 1200 && socialCardDimensions.height === 630,
  "Portfolio social card must be exactly 1200x630 pixels.",
);

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

const portfolioScripts = localReferences(rootHtml).filter((reference) => reference.endsWith(".js"));
for (const reference of portfolioScripts) {
  const source = await readFile(outputPathFor(reference), "utf8");
  assert(
    !/industrial-world-atlas|sk-character-sheet/i.test(source),
    `Portfolio script ${reference} contains a direct Chronicle artwork reference.`,
  );
}

const assetBudgets = [
  ["sk-icon.png", 64_000],
  ["sukhraj-kalon-social-card.png", 1_000_000],
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
console.log("Browser network tests enforce lazy Phaser and Chronicle asset isolation.");
