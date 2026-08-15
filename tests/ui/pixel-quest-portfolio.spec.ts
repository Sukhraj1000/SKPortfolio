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

test.describe("Pixel Quest portfolio", () => {
  test("uses the canonical dark foundation for a first visit", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("html")).toHaveClass(/dark/);
    await expect(page.locator('[data-portfolio-theme="pixel-quest"]')).toHaveCount(1);
    await expect(page.locator(".pq-root")).toHaveCSS("color-scheme", "dark");

    expect(await readPixelQuestTokens(page)).toEqual({
      background: "#0b1118",
      foreground: "#eef2e7",
      primary: "#d8ef72",
      cyan: "#69d6e5",
      line: "#3d565c",
    });
  });

  test("keeps a persistent complementary light foundation", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Switch to day theme" }).click();
    await expect(page.locator("html")).toHaveClass(/light/);
    await expect(page.locator(".pq-root")).toHaveCSS("color-scheme", "light");

    expect(await readPixelQuestTokens(page)).toEqual({
      background: "#eef2e7",
      foreground: "#101923",
      primary: "#3f682b",
      cyan: "#166978",
      line: "#879a94",
    });

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/light/);
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
    await expect(
      hero.getByRole("heading", {
        name: "I build systems that hold up in the real world.",
      }),
    ).toBeVisible();
    await expect(hero.getByText("Sukhraj Kalon · Software Engineer at")).toBeVisible();
    await expect(hero.getByText("Northrop Grumman", { exact: true })).toHaveCount(2);
    await expect(hero.getByText("First-Class Computer Science graduate", { exact: true })).toBeVisible();
    await expect(hero.getByText("Full-stack · Cloud · Data · AI", { exact: true })).toBeVisible();
    await expect(hero.getByLabel("Current portfolio objective")).toContainText(
      "Make the reasoning, ownership, and outcome easy to see",
    );
    await expect(hero.getByRole("link", { name: "Start the story" })).toBeVisible();
    await expect(hero.getByRole("button", { name: "Request private CV" })).toBeVisible();
    await expect(hero.locator(".pq-hero-scene")).toHaveAttribute("aria-hidden", "true");
    await expect(hero.locator(".pq-operator")).toHaveCount(1);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
    expect(requests.some((url) => url.endsWith("/sk-operator-sheet.png"))).toBeTruthy();
    expect(requests.some((url) => url.includes("industrial-world-atlas"))).toBeFalsy();
    expect(requests.some((url) => url.includes("phaser"))).toBeFalsy();
  });

  test("presents two featured project quests and two supporting builds", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/#projects");

    const featured = page.locator('[data-project-tier="featured"]');
    const supporting = page.locator('[data-project-tier="supporting"]');
    await expect(featured).toHaveCount(2);
    await expect(supporting).toHaveCount(2);

    const tymaura = page.locator('[data-project-record="tymaura"]');
    await expect(tymaura.getByRole("heading", { name: "Tymaura" })).toBeVisible();
    await expect(tymaura.getByText("Problem", { exact: true })).toBeVisible();
    await expect(tymaura.getByText("My role", { exact: true })).toBeVisible();
    await expect(tymaura.getByText("Outcome", { exact: true })).toBeVisible();
    await expect(tymaura.getByRole("link", { name: "Visit Tymaura" })).toHaveAttribute(
      "href",
      "https://tymaura.app",
    );

    const skaltek = page.locator('[data-project-record="skaltek"]');
    await expect(skaltek.getByRole("heading", { name: "Skaltek" })).toBeVisible();
    await expect(skaltek.getByRole("link", { name: "Visit Skaltek" })).toHaveAttribute(
      "href",
      "https://skaltek.co.uk",
    );

    await expect(
      page.locator('[data-project-record="solana-contract-generator"]'),
    ).toContainText("82%");
    await expect(page.locator('[data-project-record="crypto-portfolio"]')).toContainText(
      "80%",
    );

    for (const record of await page.locator("[data-project-record]").all()) {
      await expect(record.locator(".pq-tech-list li").first()).toBeVisible();
    }

    for (const image of await featured.locator("img").all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((element) => {
        const media = element as HTMLImageElement;
        return media.complete && media.naturalWidth > 0;
      })).toBeTruthy();
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
    await expect(records.first()).toContainText("Northrop Grumman");
    await expect(records.first()).toContainText("Sep 2025 — Present");

    for (const record of await records.all()) {
      const details = record.locator("details");
      if (!(await details.evaluate((element) => (element as HTMLDetailsElement).open))) {
        await details.locator("summary").click();
      }
      await expect(details.locator(".pq-level-details-panel > ul").first().locator("li").first()).toBeVisible();
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
    await expect(cards.locator("[data-level]")).toHaveCount(35);
    await expect(inventory).toContainText("without implying a percentage");

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

  test("finishes with an accessible contact scene and complete outreach paths", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#contact");

    const contact = page.locator("#contact");
    await expect(
      contact.getByRole("heading", { name: "The story is still being written." }),
    ).toBeVisible();
    await expect(contact.locator(".pq-ending-scene")).toHaveAttribute("aria-hidden", "true");
    await expect(contact.locator(".pq-ending-door")).toHaveCount(1);
    await expect(contact.locator(".pq-operator")).toHaveCount(1);

    const emailLink = contact.getByRole("link", { name: "Request by email" });
    await expect(emailLink).toHaveAttribute("href", /^mailto:/);

    const cvTrigger = contact.getByRole("button", { name: "Request private CV" });
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

  test("runs story motion once and settles without moving focused actions", async ({ page }) => {
    await page.goto("/");

    const heroCopy = page.locator('[data-motion="hero-copy"]');
    const startLink = page.getByRole("link", { name: "Start the story" });
    await startLink.focus();
    expect(
      await heroCopy.evaluate((element) =>
        element.getAnimations().every((animation) => {
          const effect = animation.effect as KeyframeEffect | null;
          return effect
            ? effect
                .getKeyframes()
                .every((frame) => !frame.transform || frame.transform === "none")
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
      await page.evaluate(() =>
        document
          .getAnimations()
          .filter((animation) => animation.playState === "running").length,
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

    await expect(
      page.getByRole("heading", {
        name: "I build systems that hold up in the real world.",
      }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tymaura" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Software Engineer", exact: true }).last()).toBeVisible();
    await expect(page.locator("[data-motion-state]")).toHaveCount(0);
    const finalState = await page.locator('[data-motion="record"]').first().evaluate((element) => {
      const styles = window.getComputedStyle(element);
      return { opacity: styles.opacity, transform: styles.transform };
    });
    expect(finalState.opacity).toBe("1");
    expect(finalState.transform).toBe("none");
    await context.close();
  });

  test("settles motion at load and when reduced motion changes live", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator(".pq-root")).toHaveAttribute("data-motion-mode", "reduced");
    await expect(page.locator('[data-motion]:not([data-motion-state="complete"])')).toHaveCount(0);
    await expect(page.locator(".pq-hero-operator")).toHaveCSS("animation-name", "none");

    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.reload();
    await expect(page.locator(".pq-root")).toHaveAttribute("data-motion-mode", "enhanced");
    await page.locator("#projects").scrollIntoViewIfNeeded();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator(".pq-root")).toHaveAttribute("data-motion-mode", "reduced");
    await expect(page.locator('[data-motion]:not([data-motion-state="complete"])')).toHaveCount(0);
  });

  for (const theme of ["dark", "light"] as const) {
    for (const viewport of releaseViewports) {
      test(`contains the ${theme} journey at ${viewport.width}x${viewport.height}`, async ({
        page,
      }) => {
        await page.addInitScript((nextTheme) => {
          window.localStorage.setItem("theme", nextTheme);
        }, theme);
        await page.setViewportSize(viewport);
        await page.goto("/");

        await expect(page.locator("html")).toHaveClass(new RegExp(theme));
        await expect(page.locator("[data-project-record]")).toHaveCount(4);
        await expect(page.locator("[data-experience-record]")).toHaveCount(4);
        await expect(page.locator("[data-capability-record]")).toHaveCount(5);
        await expect(page.locator("#contact")).toContainText(
          "The story is still being written.",
        );

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(1);

        const viewportWidth = viewport.width;
        for (const control of await page.locator("header a, header button").all()) {
          if (!(await control.isVisible())) continue;
          const box = await control.boundingBox();
          expect(box?.x).toBeGreaterThanOrEqual(-1);
          expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(
            viewportWidth + 1,
          );
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

    await expect(page.getByRole("heading", { name: "Proof lives in what shipped." })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Every environment added a new constraint." }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Choose tools for the constraint." })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "The story is still being written." }),
    ).toBeVisible();
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
    await expect(page.locator('section[aria-labelledby]')).toHaveCount(5);
    await expect(page.locator('[aria-hidden="true"] :is(a,button,input,select,textarea,[tabindex])')).toHaveCount(0);
    await expect(page.locator(".pq-operator:not([aria-hidden='true'])")).toHaveCount(0);
    for (const image of await page.locator("main img").all()) {
      expect((await image.getAttribute("alt"))?.trim().length).toBeGreaterThan(0);
    }
  });

  test("does not apply fine-pointer hover motion in a touch context", async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL: requireBaseURL(baseURL),
      hasTouch: true,
      isMobile: true,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto("/#projects");
    expect(
      await page.evaluate(
        () => window.matchMedia("(hover: hover) and (pointer: fine)").matches,
      ),
    ).toBeFalsy();
    await expect(page.locator(".pq-project-visual img").first()).toHaveCSS(
      "transition-duration",
      "0s",
    );
    await context.close();
  });

  test("keeps the header and desktop rail on one active chapter", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(page.locator("[data-chapter-status]")).toContainText("Profile");
    await expect(
      page.getByRole("navigation", { name: "Portfolio sections" }).getByRole("link", {
        name: "Profile",
      }),
    ).toHaveAttribute("aria-current", "location");

    await page.locator("#projects").scrollIntoViewIfNeeded();
    await expect(page.locator("[data-chapter-status]")).toContainText("Projects");
    await expect(
      page.getByRole("navigation", { name: "Portfolio sections" }).getByRole("link", {
        name: "Projects",
      }),
    ).toHaveAttribute("aria-current", "location");
    await expect(page.getByRole("progressbar", { name: "Portfolio journey progress" })).toHaveAttribute(
      "aria-valuenow",
      "40",
    );
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

  test("keeps Phaser and world assets behind the unchanged game Start action", async ({ page }) => {
    const rootRequests: string[] = [];
    page.on("request", (request) => rootRequests.push(request.url()));
    await page.goto("/");
    await page.locator("#contact").scrollIntoViewIfNeeded();
    expect(rootRequests.some((url) => url.includes("/game/assets/"))).toBeFalsy();
    expect(rootRequests.some((url) => url.includes("industrial-world-atlas"))).toBeFalsy();

    const gameRequests: string[] = [];
    page.on("request", (request) => gameRequests.push(request.url()));
    await page.goto("/game/");
    await expect(page.locator("canvas")).toHaveCount(0);
    expect(gameRequests.some((url) => url.includes("industrial-world-atlas"))).toBeFalsy();

    await page.getByRole("button", { name: "Start deployment" }).click();
    await expect(page.locator("canvas")).toHaveCount(1, { timeout: 15_000 });
    await expect
      .poll(() => gameRequests.some((url) => url.includes("industrial-world-atlas")))
      .toBeTruthy();
  });

  test("keeps the game route on its existing isolated header path", async ({ page }) => {
    await page.goto("/game/");

    await expect(page.locator("[data-portfolio-header]")).toHaveCount(0);
    await expect(page.getByText("Game route // isolated runtime")).toBeVisible();
    await expect(page.getByRole("button", { name: "Start deployment" })).toBeVisible();
    await expect(page.getByRole("group", { name: "Portfolio experience mode" })).toBeVisible();
  });
});
