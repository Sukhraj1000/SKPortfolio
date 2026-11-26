import { expect, test, type Locator, type Page } from "@playwright/test";

const releaseViewports = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
] as const;

const repository = (name: string) =>
  new RegExp(`^https://github\\.com/Sukhraj1000/${name}(?:[/?#]|$)`, "i");

const selectedProjects = [
  // Padel may use a public development post or a local, signed-out evidence asset.
  [
    "Padel Match Analysis",
    /^(?:https:\/\/[^/\s]+\/|\/(?!\/))[^?#\s]+/,
    /rall(?:y|ies)|court|positioning/i,
  ],
  ["Sketch Clash", repository("sketch-clash"), /agents?|island|simulation/i],
  ["Tymaura", /^https:\/\/tymaura\.app\/?$/, /guest|seating|check[ -]?in/i],
  ["SignalDesk", repository("signaldesk"), /market|command line|indicators/i],
  ["Spend-Limited AI Agent Wallet", repository("hackathon-toolkit"), /limit|cap|test funds/i],
  ["Fork Fighter", repository("fork-fighter-live-patch-war"), /rules?|referee/i],
] as const;

const universityWork = [
  [
    "project-solana-contract-generator",
    "Solana Smart Contract AI Generator",
    repository("SmartContractGen"),
  ],
  [
    "project-crypto-portfolio",
    "Crypto Portfolio Mobile App",
    repository("CryptoMobileAppPorfolio"),
  ],
] as const;

const experienceRows = [
  {
    id: "northrop-software-engineer",
    organisation: "Northrop Grumman",
    role: /Software Engineer\b(?!\s+Intern)/i,
    dates: /Sep\w* 2025\s*(?:[–—-]|to)\s*present/i,
    months: ["2025-09"],
    contribution: /software|applications?|engineering|systems?/i,
  },
  {
    id: "skaltek-founder",
    organisation: "Skaltek",
    role: /Founder/i,
    dates: /Jan\w* 2026\s*(?:[–—-]|to)\s*present/i,
    months: ["2026-01"],
    contribution: /businesses|software|automation|AI/i,
  },
  {
    id: "endeavour-data",
    organisation: "Endeavour Restaurants Ltd",
    role: /Administration (?:with|and|&) Data Analysis/i,
    dates: /Jul\w* 2025\s*(?:[–—-]|to)\s*Jan\w* 2026/i,
    months: ["2025-07", "2026-01"],
    contribution: /administration|data|report|operations/i,
  },
  {
    id: "northrop-intern",
    organisation: "Northrop Grumman",
    role: /Software Engineer Intern/i,
    dates: /Sep\w* 2023\s*(?:[–—-]|to)\s*Sep\w* 2024/i,
    months: ["2023-09", "2024-09"],
    contribution: /software|applications?|engineering|development/i,
  },
  {
    id: "techfront-led-technician",
    organisation: "Techfront UK Ltd",
    role: /LED Technician/i,
    dates: /Apr\w* 2023\s*(?:[–—-]|to)\s*Jun\w* 2025/i,
    months: ["2023-04", "2025-06"],
    contribution: /LED|display|live|technical/i,
  },
] as const;

const capabilityIds = [
  "languages",
  "application-engineering",
  "ai-automation",
  "backend-data",
  "cloud-delivery",
  "testing-quality",
  "emerging-technology",
  "vision-hardware",
] as const;

// Public CV anchors, deliberately independent of the private CV and implementation data.
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
] as const;

async function expectStaticSkills(page: Page) {
  const skills = page.locator("#loadout");
  await expect(
    skills.getByRole("heading", { level: 2, name: "Skills", exact: true }),
  ).toBeVisible();
  await expect(
    skills.locator("details, summary, button, [role=button], dialog, [role=dialog], [data-level]"),
  ).toHaveCount(0);
  await expect(skills).not.toContainText(/\b(?:primary|supporting)\b|\d+\s*%/i);
  const groups = skills.locator("[data-capability-record]");
  await expect(groups).toHaveCount(capabilityIds.length);
  expect(
    await groups.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("data-capability-record")),
    ),
  ).toEqual(capabilityIds);
  for (const [index, id] of capabilityIds.entries()) {
    const group = groups.nth(index);
    await expect(group).toHaveCSS("opacity", "1");
    await expect(group).toHaveCSS("transform", "none");
    await expect(group.getByRole("heading", { level: 3 })).toBeVisible();
    const list = group.getByRole("list");
    await expect(list).toHaveCount(1);
    await expect(list).toBeVisible();
    await expect(list).toHaveCSS("opacity", "1");
    const items = group.locator("[data-skill]");
    expect(await items.count(), id).toBeGreaterThan(0);
    await expect(list.getByRole("listitem")).toHaveCount(await items.count());
    for (const item of await items.all()) {
      await expect(item).toBeVisible();
      await expect(item).toHaveText(/\S/);
      await expect(item).toHaveCSS("opacity", "1");
      expect(
        await item.evaluate((element) => !!element.closest("[hidden], [aria-hidden=true]")),
      ).toBe(false);
      expect(
        await item.evaluate((element) => element.matches("li") && !!element.closest("ul, ol")),
      ).toBe(true);
    }
    for (const anchor of capabilityAnchors[index]) {
      await expect(list).toContainText(anchor, { useInnerText: true });
    }
    const art = group.locator("svg[data-skill-art]");
    await expect(art).toHaveCount(1);
    await expect(art).toBeVisible();
    await expect(art).toHaveAttribute("aria-hidden", "true");
    await expect(art).toHaveAttribute("focusable", "false");
    await expect(art).not.toHaveAttribute("tabindex");
    await expect(art.locator("a, [tabindex]")).toHaveCount(0);
  }
}

async function expectProjectImage(article: Locator, id: string) {
  const image = article.getByRole("img");
  await expect(article.locator("img")).toHaveCount(1);
  await expect(image).toBeVisible();
  const alt = (await image.getAttribute("alt"))?.trim() ?? "";
  expect(alt.split(/\s+/).length, `${id}: describe the depicted image`).toBeGreaterThanOrEqual(3);
  expect(alt).not.toMatch(/^(?:image|photo|screenshot|illustration|placeholder)(?:\s+of)?$/i);
  await expect(image).toHaveAccessibleName(alt);
  await expect(image).toHaveAttribute("src", /^\/(?!\/)[^?#]+\.(?:webp|svg)$/i);
  for (const dimension of ["width", "height"]) {
    await expect(image).toHaveAttribute(dimension, /^[1-9]\d*$/);
  }
  const retained = {
    "padel-match-analysis": "/images/work/padel.webp",
    "sketch-clash": "/images/work/sketch-clash.webp",
  };
  if (id in retained)
    await expect(image).toHaveAttribute("src", retained[id as keyof typeof retained]);
  await image.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      image.evaluate(async (element: HTMLImageElement) => {
        try {
          await element.decode();
          return element.complete && element.naturalWidth > 0 && element.naturalHeight > 0;
        } catch {
          return false;
        }
      }),
    )
    .toBe(true);
}

async function expectDirectLink(link: Locator, name: RegExp, destination: RegExp) {
  await expect(link).toBeVisible();
  await expect(link).toHaveAccessibleName(name);
  await expect(link).toHaveAttribute("href", destination);
  expect(["", "_self"]).toContain((await link.getAttribute("target"))?.toLowerCase() ?? "");
}

async function expectStaticWork(page: Page) {
  const projects = page.locator("#projects");
  await expect(
    projects.getByRole("heading", { level: 2, name: "Projects", exact: true }),
  ).toBeVisible();
  await expect(projects.locator("details")).toHaveCount(0);
  const articles = projects.locator("article[data-project-record]");
  await expect(articles).toHaveCount(selectedProjects.length);
  await expect(articles.getByRole("heading", { level: 3 })).toHaveText(
    selectedProjects.map(([title]) => title),
  );
  for (const [index, [title, destination, purpose]] of selectedProjects.entries()) {
    const article = articles.nth(index);
    const id = [
      "padel-match-analysis",
      "sketch-clash",
      "tymaura",
      "signaldesk",
      "spend-limited-ai-agent-wallet",
      "fork-fighter",
    ][index];
    await expect(article).toHaveAttribute("data-project-record", id);
    await expectProjectImage(article, id);
    await expect(
      article.getByRole("heading", { level: 3, name: title, exact: true }),
    ).toBeVisible();
    const caption = article.locator("p");
    await expect(caption).toHaveCount(1);
    await expect(caption).toBeVisible();
    await expect(caption).toHaveText(purpose, { useInnerText: true });
    await expect(article.locator("a")).toHaveCount(1);
    await expectDirectLink(article.getByRole("link"), /\S/, destination);
  }

  const university = projects.getByRole("heading", { name: "University work", exact: true });
  await expect(university).toBeVisible();
  const links = projects.getByRole("link");
  await expect(links).toHaveCount(selectedProjects.length + universityWork.length);
  for (const [index, [fragment, title, destination]] of universityWork.entries()) {
    const link = links.nth(selectedProjects.length + index);
    await expect(projects.locator(`#${fragment}`)).toHaveCount(1);
    await expect(link).toContainText(new RegExp(title, "i"), { useInnerText: true });
    await expectDirectLink(link, new RegExp(title, "i"), destination);
  }
}

async function expectStaticExperience(page: Page) {
  const about = page.locator("#about");
  await expect(
    about.getByRole("heading", { level: 2, name: "Experience", exact: true }),
  ).toBeVisible();
  await expect(about.locator("details")).toHaveCount(0);
  const rows = about.locator("[data-experience-record]");
  await expect(rows).toHaveCount(experienceRows.length);
  for (const [
    index,
    { id, organisation, role, dates, months, contribution },
  ] of experienceRows.entries()) {
    const row = rows.nth(index);
    await expect(row).toHaveAttribute("data-experience-record", id);
    const heading = row.getByRole("heading", { level: 3 });
    await expect(heading).toBeVisible();
    const title = await heading.innerText();
    expect(
      role.test(title) || title.toLowerCase().includes(organisation.toLowerCase()),
      `${id}: role or organisation must be the h3`,
    ).toBe(true);
    for (const fact of [new RegExp(organisation, "i"), role, dates]) {
      await expect(row).toContainText(fact, { useInnerText: true });
    }
    const summary = row.locator("p");
    await expect(summary).toHaveCount(1);
    await expect(summary).toBeVisible();
    await expect(summary).toHaveText(contribution, { useInnerText: true });
    await expect(summary).not.toHaveText(
      /evaluations? fail|enter the same figures twice|Java backend|React interface|pitchside|traced display faults|I visit/i,
    );
    const times = row.locator("time");
    await expect(times).toHaveCount(months.length);
    for (const [index, month] of months.entries()) {
      await expect(times.nth(index)).toBeVisible();
      await expect(times.nth(index)).toHaveAttribute("datetime", month);
    }
  }
  const studio = about.locator('[data-experience-record="skaltek-founder"]').getByRole("link");
  await expectDirectLink(studio, /Skaltek/i, /^https:\/\/(?:www\.)?skaltek\.co\.uk(?:\/|$)/i);
}

function requireBaseURL(baseURL: string | undefined) {
  if (!baseURL) throw new Error("Playwright baseURL is required for this test.");
  return baseURL;
}

function boxesOverlap(
  first: { x: number; y: number; width: number; height: number },
  second: { x: number; y: number; width: number; height: number },
) {
  return !(
    first.x + first.width <= second.x ||
    second.x + second.width <= first.x ||
    first.y + first.height <= second.y ||
    second.y + second.height <= first.y
  );
}

async function readPixelQuestTokens(page: Page) {
  return page.locator(".pq-root").evaluate((element) => {
    const styles = window.getComputedStyle(element);
    const token = (name: string) => styles.getPropertyValue(name).trim();

    return {
      background: token("--background"),
      foreground: token("--foreground"),
      primary: token("--primary"),
      cyan: token("--pq-cyan"),
      line: token("--pq-line"),
    };
  });
}

test.describe("Orbital Engineering Journey portfolio", () => {
  test("uses the canonical dark foundation for a first visit", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("html")).toHaveClass(/dark/);
    await expect(page.locator('[data-portfolio-theme="orbital-engineering-journey"]')).toHaveCount(
      1,
    );
    await expect(page.locator(".pq-root")).toHaveCSS("color-scheme", "dark");

    expect(await readPixelQuestTokens(page)).toEqual({
      background: "#04070d",
      foreground: "#f0f4eb",
      primary: "#ddf778",
      cyan: "#67e4f6",
      line: "#29434c",
    });
  });

  test("stays dark when system and legacy preferences request light", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.addInitScript(() => window.localStorage.setItem("theme", "light"));
    await page.goto("/");

    await expect(page.locator("html")).toHaveClass(/dark/);
    await expect(page.locator("html")).not.toHaveClass(/light/);
    await expect(page.locator("html")).not.toHaveAttribute("data-theme");
    await expect(page.locator(".pq-root")).toHaveCSS("color-scheme", "dark");
    await expect(page.getByRole("button", { name: /Switch to .* theme/ })).toHaveCount(0);
    await expect(page.getByText(/IRON\/?\/?SIGNAL/i)).toHaveCount(0);

    expect(await readPixelQuestTokens(page)).toEqual({
      background: "#04070d",
      foreground: "#f0f4eb",
      primary: "#ddf778",
      cyan: "#67e4f6",
      line: "#29434c",
    });

    await page.goto("/game/");
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expect(page.locator("html")).not.toHaveClass(/light/);
    await expect(page.locator("body")).toHaveCSS("color-scheme", "dark");
    await expect(page.getByRole("button", { name: /Switch to .* theme/ })).toHaveCount(0);
  });

  test("serves a neutral portfolio operator sheet", async ({ request }) => {
    const response = await request.get("/sk-operator-sheet.png");
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toBe("image/png");
    expect((await response.body()).byteLength).toBeGreaterThan(1_000);
  });

  test("renders the complete Profile hero without loading the game world", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");

    const hero = page.locator("#home");
    await expect(hero.getByRole("heading", { name: "Sukhraj Kalon", level: 1 })).toBeVisible();
    await expect(hero.getByText("Software Engineer", { exact: true }).last()).toBeVisible();
    await expect(hero).not.toContainText("at Northrop Grumman");
    await expect(hero.getByText("Northrop Grumman", { exact: true })).toHaveCount(0);
    await expect(hero.getByText("West Midlands, UK", { exact: true }).last()).toBeVisible();
    await expect(
      hero.getByText("First-Class Computer Science graduate", { exact: true }),
    ).toBeVisible();
    await expect(
      hero.getByText("Secure software · Cloud · Data · AI systems", { exact: true }),
    ).toBeVisible();
    await expect(hero.getByLabel("Current portfolio objective")).toContainText(
      "keep the engineering evidence clear",
    );
    await expect(hero.getByRole("link", { name: "View selected work" })).toBeVisible();
    await expect(hero.getByRole("link", { name: "Request private CV" })).toBeVisible();
    const openingScene = hero.locator(".pq-hero-scene");
    await expect(openingScene).toHaveAttribute("aria-hidden", "true");
    await expect(openingScene.locator(".pq-scene-window-bar")).toContainText(
      "Portfolio route / Dispatch",
    );
    await expect(openingScene.locator(".pq-scene-terminal")).toContainText("Engineering route");
    await expect(openingScene.locator(".pq-dispatch-stacks > span")).toHaveCount(3);
    await expect(openingScene.locator(".pq-scene-entry")).toContainText("Start / 01");
    await expect(openingScene.locator(".pq-scene-route")).toHaveCount(1);
    await expect(openingScene.locator(".pq-destination-console")).toContainText("Next");
    await expect(openingScene.locator('[class*="orbit"]')).toHaveCount(0);
    await expect(hero.locator(".pq-operator")).toHaveCount(1);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
    expect(requests.some((url) => url.endsWith("/sk-operator-sheet.png"))).toBeTruthy();
    expect(requests.some((url) => url.includes("industrial-world-atlas"))).toBeFalsy();
    expect(requests.some((url) => url.includes("phaser"))).toBeFalsy();
  });

  for (const profileViewport of [
    { width: 320, height: 568, operatorWidth: 96 },
    { width: 390, height: 844, operatorWidth: 96 },
    { width: 1440, height: 900, operatorWidth: 96 },
  ]) {
    test(`keeps the Profile operator station clean at ${profileViewport.width}px`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize(profileViewport);
      await page.goto("/");

      const operator = page.locator("[data-profile-operator]");
      const operatorSprite = operator.locator(".pq-operator");
      const berth = page.locator("[data-operator-berth]");
      const start = page.locator("[data-profile-start]");
      const route = page.locator("[data-profile-route]");
      const terminal = page.locator('[data-profile-equipment="terminal"]');
      const destination = page.locator('[data-profile-equipment="destination"]');

      await expect(operatorSprite).toHaveCSS("width", `${profileViewport.operatorWidth}px`);
      await expect(operatorSprite).toHaveCSS(
        "height",
        `${(profileViewport.operatorWidth * 4) / 3}px`,
      );
      await expect(operator).toHaveCSS("animation-name", "none");
      expect(await berth.evaluate((element) => getComputedStyle(element, "::after").content)).toBe(
        "none",
      );

      const [operatorBox, berthBox, startBox, routeBox, terminalBox, destinationBox] =
        await Promise.all([
          operator.boundingBox(),
          berth.boundingBox(),
          start.boundingBox(),
          route.boundingBox(),
          terminal.boundingBox(),
          destination.boundingBox(),
        ]);

      expect(operatorBox).not.toBeNull();
      expect(berthBox).not.toBeNull();
      expect(startBox).not.toBeNull();
      expect(routeBox).not.toBeNull();
      expect(terminalBox).not.toBeNull();
      expect(destinationBox).not.toBeNull();
      if (!operatorBox || !berthBox || !startBox || !routeBox || !terminalBox || !destinationBox) {
        return;
      }

      expect(operatorBox.x).toBeGreaterThan(berthBox.x);
      expect(operatorBox.x + operatorBox.width).toBeLessThan(berthBox.x + berthBox.width);
      expect(operatorBox.y + operatorBox.height).toBeLessThanOrEqual(berthBox.y + berthBox.height);
      expect(operatorBox.x - (startBox.x + startBox.width)).toBeGreaterThanOrEqual(8);
      expect(routeBox.x - (operatorBox.x + operatorBox.width)).toBeGreaterThanOrEqual(8);
      expect(boxesOverlap(operatorBox, startBox)).toBe(false);
      expect(boxesOverlap(operatorBox, routeBox)).toBe(false);
      expect(boxesOverlap(operatorBox, terminalBox)).toBe(false);
      expect(boxesOverlap(operatorBox, destinationBox)).toBe(false);
    });
  }

  test("shows six selected projects and two always-visible university sources", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/#projects");
    await expectStaticWork(page);
  });

  test("shows five dated role overviews with Skaltek as an experience", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#about");
    await expectStaticExperience(page);
    const about = page.locator("#about");
    await expect(about.locator('[data-experience-record="endeavour-data"]')).toContainText(
      /part[ -]time/i,
      { useInnerText: true },
    );
    const currentRole = about.locator('[data-experience-record="northrop-software-engineer"]');
    await expect(currentRole).not.toContainText(/\bRAG\b/i);
    await expect(currentRole).not.toContainText(/Model Context Protocol|\bMCP\b/i);
    await expect(currentRole).not.toContainText(/Loop (?:&|and) Graph Engineering/i);

    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 320, height: 568 },
  ]) {
    test(`renders all eight skill groups as complete lists at ${viewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto("/#loadout");
      await expectStaticSkills(page);
      await page.locator("html").evaluate((element) => {
        element.style.fontSize = "200%";
      });
      await expectStaticSkills(page);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        ),
      ).toBeLessThanOrEqual(1);
    });
  }

  // A single viewport can start neighbouring diagrams together. Give each its own page so we
  // actually observe its first visit rather than expecting an already-finished diagram to replay.
  for (const id of capabilityIds) {
    test(`animates ${id} artwork once in view while its skill text stays still`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.setViewportSize({ width: 320, height: 568 });
      await page.goto("/");
      await expect(page.locator(".pq-root")).toHaveAttribute("data-motion-mode", "enhanced");
      const group = page.locator(`#loadout [data-capability-record="${id}"]`);
      const art = group.locator("svg[data-skill-art]");
      await expect(art).not.toBeInViewport();
      await expect(group).toHaveAttribute("data-motion-state", "idle");
      expect(await art.evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(
        0,
      );
      await art.scrollIntoViewIfNeeded();
      await expect(art).toBeInViewport();
      // Capture the effects in the poll so a short animation cannot disappear between reads.
      let effects: { artOnly: boolean; iterations: number; duration: number }[] = [];
      await expect
        .poll(async () => {
          effects = await group.evaluate((element) =>
            element.getAnimations({ subtree: true }).map((animation) => {
              const effect = animation.effect as KeyframeEffect;
              const target = effect.target;
              const timing = effect.getComputedTiming();
              return {
                artOnly:
                  target instanceof Element &&
                  (!!target.closest("svg[data-skill-art]") ||
                    (!!target.querySelector("svg[data-skill-art]") &&
                      !target.querySelector("h3, [data-skill]"))),
                iterations: Number(timing.iterations),
                duration: Number(timing.activeDuration),
              };
            }),
          );
          return effects.filter((effect) => effect.duration > 0).length;
        })
        .toBeGreaterThan(0);
      expect(effects.length).toBeGreaterThan(0);
      for (const effect of effects) {
        expect(effect.artOnly).toBe(true);
        expect(Number.isFinite(effect.iterations)).toBe(true);
        expect(effect.iterations).toBeGreaterThan(0);
        expect(effect.iterations).toBeLessThanOrEqual(1);
        expect(Number.isFinite(effect.duration)).toBe(true);
      }
      await expect(group).toHaveCSS("opacity", "1");
      await expect(group).toHaveCSS("transform", "none");
      await expect(group.getByRole("heading", { level: 3 })).toHaveCSS("opacity", "1");
      for (const item of await group.locator("[data-skill]").all()) {
        await expect(item).toBeVisible();
        await expect(item).toHaveCSS("opacity", "1");
        await expect(item).toHaveCSS("transform", "none");
      }
      await expect
        .poll(() =>
          group.evaluate(
            (element) =>
              element
                .getAnimations({ subtree: true })
                .filter(
                  (animation) =>
                    animation.playState !== "finished" && animation.playState !== "idle",
                ).length,
          ),
        )
        .toBe(0);
      await expect(group).toHaveAttribute("data-motion-state", "complete");
      await page.locator("#home").scrollIntoViewIfNeeded();
      await art.scrollIntoViewIfNeeded();
      // Give an intersection callback two rendering frames to run before checking for a replay.
      await art.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          ),
      );
      expect(
        await group.evaluate(
          (element) =>
            element
              .getAnimations({ subtree: true })
              .filter((animation) => animation.playState === "running").length,
        ),
      ).toBe(0);
    });
  }

  test("finishes with an accessible contact scene and complete outreach paths", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#contact");

    const contact = page.locator("#contact");
    await expect(
      contact.getByRole("heading", { name: "Continue the conversation." }),
    ).toBeVisible();
    await expect(contact.locator(".pq-ending-scene")).toHaveAttribute("aria-hidden", "true");
    await expect(contact.locator(".pq-ending-door")).toHaveCount(1);
    await expect(page.locator("#home .pq-ending-door")).toHaveCount(0);
    await expect(contact.locator(".pq-operator")).toHaveCount(1);

    const emailLink = contact.getByRole("link", { name: "Request by email" });
    await expect(emailLink).toHaveAttribute("href", /^mailto:/);

    const cvTrigger = contact.getByRole("link", { name: "Request private CV" });
    await cvTrigger.click();
    await expect(page.getByRole("dialog", { name: "Request Sukhraj's CV" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(cvTrigger).toBeFocused();

    const socialNavigation = contact.getByRole("list", {
      name: "Professional and social profiles",
    });
    await expect(socialNavigation.getByRole("link")).toHaveCount(3);
    for (const link of await socialNavigation.getByRole("link").all()) {
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
    }

    const footerNavigation = page.getByRole("navigation", { name: "Footer navigation" });
    await expect(footerNavigation.getByRole("link")).toHaveCount(5);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("settles entry motion without moving focus while purposeful operator idles remain", async ({
    page,
  }) => {
    await page.goto("/");

    const heroCopy = page.locator('[data-motion="hero-copy"]');
    const startLink = page.getByRole("link", { name: "View selected work" });
    await startLink.focus();
    expect(
      await heroCopy.evaluate((element) =>
        element.getAnimations().every((animation) => {
          const effect = animation.effect as KeyframeEffect | null;
          return effect
            ? effect.getKeyframes().every((frame) => !frame.transform || frame.transform === "none")
            : true;
        }),
      ),
    ).toBeTruthy();

    await expect.poll(() => heroCopy.getAttribute("data-motion-state")).toBe("complete");
    await expect(startLink).toBeFocused();

    const projectHeading = page.locator('#projects [data-motion="section"]');
    await projectHeading.scrollIntoViewIfNeeded();
    await expect.poll(() => projectHeading.getAttribute("data-motion-state")).toBe("complete");
    await page.locator("#home").scrollIntoViewIfNeeded();
    await projectHeading.scrollIntoViewIfNeeded();
    await expect(projectHeading).toHaveAttribute("data-motion-state", "complete");

    await page.waitForTimeout(1_600);
    expect(
      await page.evaluate(
        () =>
          document
            .getAnimations()
            .filter((animation) => animation.playState === "running")
            .filter((animation) => {
              const timing = animation.effect?.getComputedTiming();
              return timing?.iterations !== Number.POSITIVE_INFINITY;
            }).length,
      ),
    ).toBe(0);
  });

  test("shows final content when JavaScript is disabled", async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      baseURL: requireBaseURL(baseURL),
      viewport: { width: 320, height: 568 },
    });
    const page = await context.newPage();
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Sukhraj Kalon", level: 1 })).toBeVisible();
    await expect(page.locator(".pq-scene-window-bar")).toContainText("Portfolio route / Dispatch");
    await expect(page.locator(".pq-scene-terminal")).toContainText("Engineering route");
    await expect(page.locator(".pq-scene-route")).toHaveCount(1);
    await expect(page.locator("[data-operator-berth]")).toHaveCount(1);
    await expect(page.locator("[data-profile-operator] .pq-operator")).toHaveCSS("width", "96px");
    await expect(page.locator("#home, #contact").locator('[class*="orbit"]')).toHaveCount(0);
    await expect(page.getByText(/IRON\/?\/?SIGNAL/i)).toHaveCount(0);
    await expectStaticWork(page);
    await expectStaticExperience(page);
    await expect(
      page.locator("#contact").getByRole("link", { name: "Request by email" }),
    ).toHaveAttribute("href", /^mailto:SukhrajKalon@gmail\.com/);
    await expect(
      page.locator("#home").getByRole("link", { name: "Request private CV" }),
    ).toHaveAttribute("href", /^mailto:SukhrajKalon@gmail\.com/);
    await expect(page.locator("[data-motion-state]")).toHaveCount(0);
    const firstProject = page.locator("#projects article[data-project-record]").first();
    await expect(firstProject).toHaveCSS("opacity", "1");
    await expect(firstProject).toHaveCSS("transform", "none");

    await expectStaticSkills(page);
    for (const art of await page.locator("#loadout svg[data-skill-art]").all()) {
      await expect(art).toHaveCSS("opacity", "1");
      await expect(art).toHaveCSS("transform", "none");
      expect(
        await art.evaluate(
          (element) =>
            element
              .getAnimations({ subtree: true })
              .filter((animation) => animation.playState === "running").length,
        ),
      ).toBe(0);
    }
    await context.close();
  });

  test("settles motion at load and when reduced motion changes live", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator(".pq-root")).toHaveAttribute("data-motion-mode", "reduced");
    await expect(page.locator('[data-motion]:not([data-motion-state="complete"])')).toHaveCount(0);
    await expect(page.locator(".pq-hero-operator")).toHaveCSS("animation-name", "none");

    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(page.locator(".pq-root")).toHaveAttribute("data-motion-mode", "enhanced");
    await page.locator("#projects").scrollIntoViewIfNeeded();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator(".pq-root")).toHaveAttribute("data-motion-mode", "reduced");
    await expect(page.locator('[data-motion]:not([data-motion-state="complete"])')).toHaveCount(0);
    await page
      .getByRole("navigation", { name: "Portfolio sections" })
      .getByRole("link", { name: "Projects" })
      .click();
    await expect(page.locator("[data-rail-index]")).toHaveAttribute("data-rail-index", "1");
    await expect(page.locator("[data-rail-index]")).toHaveCSS("transition-duration", "0s");
    await expect(page.locator("[data-rail-index]")).toHaveAttribute("data-rail-phase", "settled");
    await expect(page.locator(".pq-rail-operator-cue")).toHaveCSS("animation-name", "none");
    await expect(page.locator("[data-rail-operator]")).toHaveCSS("animation-name", "none");

    const reducedPoses = [
      ["Profile", "01", "0px 0px"],
      ["Projects", "02", "0px -128px"],
      ["Experience", "03", "-48px 0px"],
      ["Skills", "04", "-48px -128px"],
      ["Contact", "05", "-144px -192px"],
    ] as const;
    const rail = page.getByRole("navigation", { name: "Portfolio sections" });
    for (const [label, chapter, position] of reducedPoses) {
      await rail.getByRole("link", { name: label }).click();
      await expect(page.locator("[data-rail-index]")).toHaveAttribute("data-rail-chapter", chapter);
      await expect(page.locator("[data-rail-operator]")).toHaveCSS("background-position", position);
    }
  });

  for (const viewport of releaseViewports) {
    test(`contains the dark journey at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.addInitScript(() => window.localStorage.setItem("theme", "light"));
      await page.emulateMedia({ colorScheme: "light" });
      await page.setViewportSize(viewport);
      await page.goto("/");

      await expect(page.locator("html")).toHaveClass(/dark/);
      await expect(page.locator("html")).not.toHaveClass(/light/);
      await expect(page.locator("#projects article[data-project-record]")).toHaveCount(
        selectedProjects.length,
      );
      await expect(page.locator("#about [data-experience-record]")).toHaveCount(
        experienceRows.length,
      );
      await expect(page.locator("#loadout [data-capability-record]")).toHaveCount(8);
      await expect(page.locator("#contact")).toContainText("Continue the conversation.");

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);

      const viewportWidth = viewport.width;
      for (const control of await page.locator("header a, header button").all()) {
        if (!(await control.isVisible())) continue;
        const box = await control.boundingBox();
        expect(box?.x).toBeGreaterThanOrEqual(-1);
        expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(viewportWidth + 1);
        expect(box?.height).toBeGreaterThanOrEqual(44);
      }

      for (const [copySelector, sceneSelector] of [
        [".pq-hero-copy", ".pq-hero-scene"],
        [".pq-ending-copy", ".pq-ending-scene"],
      ] as const) {
        const copy = await page.locator(copySelector).boundingBox();
        const scene = await page.locator(sceneSelector).boundingBox();
        expect(copy && scene ? boxesOverlap(copy, scene) : false).toBeFalsy();
      }
    });
  }

  test("keeps every direct chapter anchor below the fixed header", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const chapter of ["projects", "about", "loadout", "contact"]) {
      await page.goto(`/#${chapter}`);
      const target = page.locator(`#${chapter}`);
      await expect
        .poll(() => target.evaluate((element) => Math.round(element.getBoundingClientRect().top)))
        .toBeGreaterThanOrEqual(70);
      await expect
        .poll(() => target.evaluate((element) => Math.round(element.getBoundingClientRect().top)))
        .toBeLessThanOrEqual(90);
    }
  });

  test("lands legacy project and experience fragments on the corresponding work", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    const projects = page.locator("#projects");
    const about = page.locator("#about");
    const targets = [
      ["project-tymaura", projects.getByRole("heading", { name: "Tymaura", level: 3 })],
      [
        "project-skaltek",
        about
          .locator('[data-experience-record="skaltek-founder"]')
          .getByRole("heading", { level: 3 }),
      ],
      ...universityWork.map(([id, name]) => [id, projects.getByRole("link", { name })] as const),
      ...experienceRows
        .filter(({ id }) => id !== "skaltek-founder")
        .map(
          ({ id }) =>
            [
              `field-log-${id}`,
              about.locator(`[data-experience-record="${id}"]`).getByRole("heading", { level: 3 }),
            ] as const,
        ),
    ] as const;
    for (const [fragment, content] of targets) {
      await page.goto(`/#${fragment}`);
      await expect(page.locator(`[id="${fragment}"]`)).toHaveCount(1);
      await expect(content).toBeInViewport();
    }
  });

  test("keeps the complete journey readable at 200 percent text", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });

    for (const headingId of [
      "projects-title",
      "field-log-title",
      "loadout-title",
      "contact-title",
    ]) {
      await expect(page.locator(`#${headingId}`)).toBeVisible();
    }
    await expect(page.locator(".pq-scene-terminal")).toContainText("Engineering route");
    await expect(page.locator(".pq-scene-entry")).toContainText("Start / 01");

    const articles = page.locator("#projects article[data-project-record]");
    const rows = page.locator("#about [data-experience-record]");
    await expect(articles).toHaveCount(selectedProjects.length);
    await expect(rows).toHaveCount(experienceRows.length);
    // Check the actual text fragments: an overflow-clipped ancestor can hide text
    // even when the document's overall scroll width still fits the viewport.
    await expectStaticSkills(page);
    const clipped = await articles
      .or(rows)
      .or(page.locator("#loadout [data-capability-record]"))
      .evaluateAll((records) => {
        const viewportWidth = document.documentElement.clientWidth;
        return records.flatMap((record) =>
          [...record.querySelectorAll("h3, p, a, time, [data-skill]")]
            .filter((element) => {
              const text = document.createRange();
              text.selectNodeContents(element);
              return [...text.getClientRects()].some(
                (box) => box.width && (box.left < -1 || box.right > viewportWidth + 1),
              );
            })
            .map((element) => element.textContent?.trim()),
        );
      });
    expect(clipped).toEqual([]);

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(1);
  });

  test("keeps decorative scenes out of the semantic and focus order", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(4);
    await expect(page.locator("section[aria-labelledby]")).toHaveCount(5);
    await expect(
      page.locator('[aria-hidden="true"] :is(a,button,input,select,textarea,[tabindex])'),
    ).toHaveCount(0);
    await expect(page.locator(".pq-operator:not([aria-hidden='true'])")).toHaveCount(0);
    for (const image of await page.locator("main img").all()) {
      expect((await image.getAttribute("alt"))?.trim().length).toBeGreaterThan(0);
    }
  });

  test("does not apply fine-pointer hover motion in a touch context", async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL: requireBaseURL(baseURL),
      hasTouch: true,
      isMobile: true,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto("/#projects");
    expect(
      await page.evaluate(() => window.matchMedia("(hover: hover) and (pointer: fine)").matches),
    ).toBeFalsy();
    const articles = page.locator("#projects article[data-project-record]");
    await expect(articles).toHaveCount(selectedProjects.length);
    const first = articles.first();
    await first.hover();
    await expect(first).toHaveCSS("transform", "none");
    await expect(first.getByRole("link")).toHaveCSS("transform", "none");
    for (const image of await articles.locator("img").all()) {
      await expect(image).toHaveCSS("transition-duration", "0s");
    }
    await context.close();
  });

  test("keeps the header and travelling rail operator on one active chapter", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const rail = page.getByRole("navigation", { name: "Portfolio sections" });
    const operator = rail.locator("[data-rail-index]");
    const expectOperatorAligned = async (label: string) => {
      await expect
        .poll(async () => {
          const [operatorBox, chapterBox] = await Promise.all([
            operator.boundingBox(),
            rail.getByRole("link", { name: label }).boundingBox(),
          ]);
          if (!operatorBox || !chapterBox) return Number.POSITIVE_INFINITY;
          const operatorCentre = operatorBox.y + operatorBox.height / 2;
          const chapterCentre = chapterBox.y + chapterBox.height / 2;
          return Math.abs(operatorCentre - chapterCentre);
        })
        .toBeLessThanOrEqual(2);
    };

    await expect(page.locator("[data-chapter-status]")).toContainText("Profile");
    await expect(rail.getByRole("link", { name: "Profile" })).toHaveAttribute(
      "aria-current",
      "location",
    );
    await expect(operator).toHaveAttribute("data-rail-index", "0");
    await expect(operator).toHaveAttribute("data-rail-phase", "settled");
    await expectOperatorAligned("Profile");
    const [spriteBox, profileLabelBox] = await Promise.all([
      operator.locator("[data-rail-operator]").boundingBox(),
      rail.getByRole("link", { name: "Profile" }).locator("strong").boundingBox(),
    ]);
    expect(spriteBox?.width).toBeGreaterThanOrEqual(47);
    expect(spriteBox?.height).toBeGreaterThanOrEqual(63);
    expect(
      spriteBox && profileLabelBox ? boxesOverlap(spriteBox, profileLabelBox) : true,
    ).toBeFalsy();

    await rail.getByRole("link", { name: "Projects" }).click();
    await expect(page.locator("[data-chapter-status]")).toContainText("Projects");
    await expect(rail.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "aria-current",
      "location",
    );
    await expect(operator).toHaveAttribute("data-rail-index", "1");
    await expect(operator).toHaveAttribute("data-rail-direction", "down");
    await expect(operator).toHaveAttribute("data-rail-phase", "travelling");
    await expectOperatorAligned("Projects");
    await expect(operator).toHaveAttribute("data-rail-phase", "settled", {
      timeout: 1_000,
    });
    await expect(
      page.getByRole("progressbar", { name: "Portfolio journey progress" }),
    ).toHaveAttribute("aria-valuenow", "40");

    await rail.getByRole("link", { name: "Profile" }).click();
    await expect(page.locator("[data-chapter-status]")).toContainText("Profile");
    await expect(operator).toHaveAttribute("data-rail-index", "0");
    await expect(operator).toHaveAttribute("data-rail-direction", "up");
    await expectOperatorAligned("Profile");

    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await rail.getByRole("link", { name: "Projects" }).click();
    await expect(operator).toHaveAttribute("data-rail-index", "1");
    await expect(operator).toHaveAttribute("data-rail-direction", "down");
    await expectOperatorAligned("Projects");
  });

  test("supports direct chapter anchors below the sticky header", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#about");

    const experience = page.locator("#about");
    await expect(experience).toBeInViewport();
    await expect
      .poll(() => experience.evaluate((element) => element.getBoundingClientRect().top))
      .toBeGreaterThanOrEqual(64);

    await page.getByRole("button", { name: "Open portfolio navigation" }).click();
    const mobileNavigation = page.getByRole("navigation", { name: "Mobile navigation" });
    await expect(mobileNavigation.getByRole("link")).toHaveCount(5);
    await mobileNavigation.getByRole("link", { name: "Skills" }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#loadout$/);
  });

  test("fails open when chapter observation is unavailable", async ({ page }) => {
    await page.addInitScript(() => {
      delete (window as unknown as { IntersectionObserver?: typeof IntersectionObserver })
        .IntersectionObserver;
    });
    await page.goto("/");

    await expect(page.locator("[data-chapter-status]")).toContainText("Profile");
    await expect(page.locator("main section")).toHaveCount(5);
    await expect(page.getByRole("link", { name: "Enter Game mode" })).toBeVisible();
  });

  test("acknowledges cold Game activation immediately without preloading its runtime", async ({
    page,
  }) => {
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const gameLink = page.getByRole("link", { name: "Enter Game mode" });
    await gameLink.evaluate((element) => {
      element.addEventListener("click", (event) => event.preventDefault(), {
        capture: true,
      });
    });
    await gameLink.click();

    const launchStatus = page.getByRole("status");
    await expect(launchStatus).toBeVisible({ timeout: 500 });
    await expect(launchStatus).toContainText("Opening Chronicle Run");
    await expect(launchStatus).toContainText("Game runtime remains isolated");
    await expect(gameLink).toHaveAttribute("aria-busy", "true");
    await expect(launchStatus.locator(".pq-game-launch-operator")).toHaveCSS(
      "animation-name",
      "none",
    );
    await expect(launchStatus.locator(".pq-game-launch-progress i")).toHaveCSS(
      "animation-name",
      "none",
    );

    await gameLink.evaluate((element) => (element as HTMLAnchorElement).click());
    await expect(page.locator('[data-game-launch-state="opening"]')).toHaveCount(1);
    await expect(page).toHaveURL(/\/$/);
    expect(requests.some((url) => url.includes("/game/assets/"))).toBeFalsy();
    expect(requests.some((url) => url.includes("industrial-world-atlas"))).toBeFalsy();
    expect(requests.some((url) => url.includes("phaser"))).toBeFalsy();
  });

  test("keeps Phaser and world assets behind explicit Game mode activation", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.goto("/");
    await page.locator("#contact").scrollIntoViewIfNeeded();
    expect(requests.some((url) => url.includes("/game/assets/"))).toBeFalsy();
    expect(requests.some((url) => url.includes("industrial-world-atlas"))).toBeFalsy();

    await page.getByRole("link", { name: "Enter Game mode" }).click();
    await expect(page).toHaveURL(/\/game\/$/);
    await expect(page.locator("canvas")).toHaveCount(1, { timeout: 15_000 });
    await expect(page.locator("[data-tutorial-prompt]")).toContainText("1 / 5");
    await expect
      .poll(() => requests.some((url) => url.includes("industrial-world-atlas")))
      .toBeTruthy();
  });

  test("keeps the game route on its existing isolated header path", async ({ page }) => {
    await page.goto("/game/");

    await expect(page.locator("[data-portfolio-header]")).toHaveCount(0);
    await expect(page.getByText("Game route // isolated runtime")).toBeVisible();
    await expect(page.locator("[data-tutorial-prompt]")).toContainText("1 / 5");
    await expect(page.getByRole("group", { name: "Portfolio experience mode" })).toBeVisible();
  });
});
