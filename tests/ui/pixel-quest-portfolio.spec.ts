import { expect, test, type Page } from "@playwright/test";

const releaseViewports = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
] as const;

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
    { width: 390, height: 844, operatorWidth: 48 },
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

  test("presents two featured project quests and two supporting builds", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/#projects");

    const featured = page.locator('[data-project-tier="featured"]');
    const supporting = page.locator('[data-project-tier="supporting"]');
    await expect(featured).toHaveCount(2);
    await expect(supporting).toHaveCount(2);

    const tymaura = page.locator('[data-project-record="tymaura"]');
    await expect(tymaura.getByRole("heading", { name: "Tymaura" })).toBeVisible();
    await expect(tymaura.locator(".pq-project-snapshot")).toContainText("Full product");
    await expect(tymaura.locator("[data-project-outcome]")).toBeVisible();
    await expect(tymaura.getByRole("link", { name: "Visit Tymaura" })).toHaveAttribute(
      "href",
      "https://tymaura.app",
    );
    const tymauraDetails = tymaura.locator(".pq-project-details");
    const tymauraSummary = tymauraDetails.locator("summary");
    await expect(tymauraSummary).toContainText("Engineering details");
    await tymauraSummary.focus();
    await page.keyboard.press("Enter");
    await expect(tymauraDetails).toHaveAttribute("open", "");
    await expect(tymauraDetails.getByText("Problem", { exact: true })).toBeVisible();
    await expect(tymauraDetails.getByText("My contribution", { exact: true })).toBeVisible();
    await expect(tymauraDetails.getByText("Outcome", { exact: true })).toBeVisible();
    await expect(tymauraSummary).toBeFocused();

    const skaltek = page.locator('[data-project-record="skaltek"]');
    await expect(skaltek.getByRole("heading", { name: "Skaltek" })).toBeVisible();
    await expect(skaltek.getByRole("link", { name: "Visit Skaltek" })).toHaveAttribute(
      "href",
      "https://skaltek.co.uk",
    );

    await expect(page.locator('[data-project-record="solana-contract-generator"]')).toContainText(
      "82%",
    );
    await expect(page.locator('[data-project-record="crypto-portfolio"]')).toContainText("80%");

    for (const record of await page.locator("[data-project-record]").all()) {
      const details = record.locator("details");
      if (!(await details.evaluate((element) => (element as HTMLDetailsElement).open))) {
        await details.locator("summary").click();
      }
      await expect(details.locator(".pq-tech-list li").first()).toBeVisible();
    }

    for (const record of await featured.all()) {
      await expect(record.locator(".pq-project-node")).toHaveCount(4);
      await expect(record.locator(".pq-project-media-frame")).toHaveCount(1);
      const image = record.locator("img");
      const stage = record.locator("[data-project-media-stage]");
      const hud = record.locator(".pq-visual-hud");
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          image.evaluate((element) => {
            const media = element as HTMLImageElement;
            return media.complete && media.naturalWidth > 0;
          }),
        )
        .toBeTruthy();
      await expect(image).toHaveCSS("object-fit", "contain");

      const [imageBox, stageBox, hudBox] = await Promise.all([
        image.boundingBox(),
        stage.boundingBox(),
        hud.boundingBox(),
      ]);
      expect(imageBox && stageBox ? boxesOverlap(imageBox, stageBox) : false).toBeTruthy();
      expect(imageBox?.x).toBeGreaterThanOrEqual(stageBox?.x ?? 0);
      expect((imageBox?.x ?? 0) + (imageBox?.width ?? 0)).toBeLessThanOrEqual(
        (stageBox?.x ?? 0) + (stageBox?.width ?? 0) + 1,
      );
      expect(imageBox?.y).toBeGreaterThanOrEqual(hudBox?.y ?? 0);
      expect(boxesOverlap(imageBox!, hudBox!)).toBeFalsy();
    }

    const firstMedia = await featured.first().locator("[data-project-media]").boundingBox();
    const firstStory = await featured.first().locator("[data-project-overview]").boundingBox();
    const secondMedia = await featured.nth(1).locator("[data-project-media]").boundingBox();
    const secondStory = await featured.nth(1).locator("[data-project-overview]").boundingBox();
    expect(firstMedia?.x).toBeLessThan(firstStory?.x ?? Number.POSITIVE_INFINITY);
    expect(secondMedia?.x).toBeGreaterThan(secondStory?.x ?? Number.NEGATIVE_INFINITY);
  });

  test("orders the complete professional experience as a level path", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#about");

    const records = page.locator("[data-experience-record]");
    await expect(records).toHaveCount(4);
    await expect(records.locator(".pq-level-node")).toHaveText(["04", "03", "02", "01"]);
    await expect(records.getByRole("heading", { level: 3 })).toHaveText([
      "Software Engineer",
      "Administration & Data Analysis",
      "Software Engineer Intern",
      "LED Technician",
    ]);
    const currentRole = records.first();
    await expect(currentRole).toContainText("Northrop Grumman");
    await expect(currentRole).toContainText("Sep 2025 — Present");
    await expect(currentRole).toContainText("Jinja");
    await expect(currentRole).toContainText("agentic and AI-assisted development");
    await expect(currentRole).toContainText("multi-agent systems");
    await expect(currentRole).not.toContainText(/\bRAG\b/i);
    await expect(currentRole).not.toContainText(/Model Context Protocol|\bMCP\b/i);
    await expect(currentRole).not.toContainText(/Loop (?:&|and) Graph Engineering/i);
    await expect(currentRole).not.toContainText(/Agent Evaluations?/i);

    for (const record of await records.all()) {
      const details = record.locator("details");
      if (!(await details.evaluate((element) => (element as HTMLDetailsElement).open))) {
        await details.locator("summary").click();
      }
      await expect(
        details.locator(".pq-level-details-panel > ul").first().locator("li").first(),
      ).toBeVisible();
      await expect(details.locator(".pq-tech-list li").first()).toBeVisible();
    }

    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("preserves every capability in the responsive inventory", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/#loadout");

    const inventory = page.locator("#loadout");
    const cards = inventory.locator("[data-capability-record]");
    await expect(cards).toHaveCount(5);
    await expect(cards.getByRole("heading", { level: 3 })).toHaveText([
      "Application Engineering",
      "Backend & Data",
      "Cloud & Delivery",
      "AI & Automation",
      "Blockchain & Systems",
    ]);
    await expect(cards.locator("[data-level]")).toHaveCount(40);
    await expect(inventory).toContainText("without implying a percentage");
    await expect(inventory).toContainText("Agentic Development");
    await expect(inventory).toContainText("Multi-Agent Systems");
    await expect(inventory).toContainText("Model Context Protocol (MCP)");
    await expect(inventory).toContainText("Loop & Graph Engineering");
    await expect(inventory).toContainText("Agent Evaluations");

    for (const card of await cards.all()) {
      const details = card.locator("details");
      await details.locator("summary").click();
      await expect(details).toHaveAttribute("open", "");
      await expect(details.locator('[data-level="primary"]').first()).toBeVisible();
    }

    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

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
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Sukhraj Kalon", level: 1 })).toBeVisible();
    await expect(page.locator(".pq-scene-window-bar")).toContainText("Portfolio route / Dispatch");
    await expect(page.locator(".pq-scene-terminal")).toContainText("Engineering route");
    await expect(page.locator(".pq-scene-route")).toHaveCount(1);
    await expect(page.locator("[data-operator-berth]")).toHaveCount(1);
    await expect(page.locator("[data-profile-operator] .pq-operator")).toHaveCSS("width", "48px");
    await expect(page.locator("#home, #contact").locator('[class*="orbit"]')).toHaveCount(0);
    await expect(page.getByText(/IRON\/?\/?SIGNAL/i)).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Tymaura" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Software Engineer", exact: true }).last(),
    ).toBeVisible();
    await expect(
      page.locator("#contact").getByRole("link", { name: "Request by email" }),
    ).toHaveAttribute("href", /^mailto:SukhrajKalon@gmail\.com/);
    await expect(
      page.locator("#home").getByRole("link", { name: "Request private CV" }),
    ).toHaveAttribute("href", /^mailto:SukhrajKalon@gmail\.com/);
    await expect(page.locator("[data-motion-state]")).toHaveCount(0);
    const finalState = await page
      .locator('[data-motion="record"]')
      .first()
      .evaluate((element) => {
        const styles = window.getComputedStyle(element);
        return { opacity: styles.opacity, transform: styles.transform };
      });
    expect(finalState.opacity).toBe("1");
    expect(finalState.transform).toBe("none");

    const projectDetails = page.locator(".pq-project-details").first();
    await projectDetails.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(projectDetails).toHaveAttribute("open", "");
    await expect(projectDetails.getByText("My contribution", { exact: true })).toBeVisible();
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
      await expect(page.locator("[data-project-record]")).toHaveCount(4);
      await expect(page.locator("[data-experience-record]")).toHaveCount(4);
      await expect(page.locator("[data-capability-record]")).toHaveCount(5);
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

  test("keeps the complete journey readable at 200 percent text", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });

    await expect(page.getByRole("heading", { name: "Projects with real gravity." })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Engineering under real constraints." }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "A working systems constellation." }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Continue the conversation." })).toBeVisible();
    await expect(page.locator(".pq-scene-terminal")).toContainText("Engineering route");
    await expect(page.locator(".pq-scene-entry")).toContainText("Start / 01");

    for (const record of await page.locator('[data-project-tier="featured"]').all()) {
      const [mediaBox, stageBox, imageBox, hudBox] = await Promise.all([
        record.locator("[data-project-media]").boundingBox(),
        record.locator("[data-project-media-stage]").boundingBox(),
        record.locator("img").boundingBox(),
        record.locator(".pq-visual-hud").boundingBox(),
      ]);
      expect(mediaBox).not.toBeNull();
      expect(stageBox).not.toBeNull();
      expect(imageBox).not.toBeNull();
      expect(hudBox).not.toBeNull();
      expect(imageBox?.x).toBeGreaterThanOrEqual(mediaBox?.x ?? 0);
      expect((imageBox?.x ?? 0) + (imageBox?.width ?? 0)).toBeLessThanOrEqual(
        (mediaBox?.x ?? 0) + (mediaBox?.width ?? 0) + 1,
      );
      expect(boxesOverlap(imageBox!, hudBox!)).toBeFalsy();
    }

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
    await expect(page.locator(".pq-project-visual img").first()).toHaveCSS(
      "transition-duration",
      "0s",
    );
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
