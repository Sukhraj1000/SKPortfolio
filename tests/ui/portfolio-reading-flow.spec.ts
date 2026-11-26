import { expect, test, type Locator, type Page } from "@playwright/test";

const captureVisualMatrix = process.env.CAPTURE_UI_MATRIX === "1";

const contentViewports = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
] as const;

const releaseViewports = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
] as const;

async function expectNoPageOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }));

  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
}

async function expectHeaderControlsWithinViewport(page: Page) {
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();

  for (const control of await page.locator("header a, header button").all()) {
    if (!(await control.isVisible())) continue;

    const box = await control.boundingBox();
    expect(box?.x).toBeGreaterThanOrEqual(-1);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual((viewport?.width ?? 0) + 1);
  }
}

async function expectReadableText(
  locator: Locator,
  minimumSize = 16,
  minimumLineHeightRatio = 1.5,
) {
  await expect(locator).toBeVisible();

  const metrics = await locator.evaluate((element) => {
    const styles = window.getComputedStyle(element);
    const fontSize = Number.parseFloat(styles.fontSize);
    const lineHeight = Number.parseFloat(styles.lineHeight);

    return {
      fontSize,
      lineHeightRatio: lineHeight / fontSize,
    };
  });

  expect(metrics.fontSize).toBeGreaterThanOrEqual(minimumSize);
  expect(metrics.lineHeightRatio).toBeGreaterThanOrEqual(minimumLineHeightRatio);
}

function parseHexColour(value: string) {
  const normalised = value.trim().replace("#", "");
  const expanded =
    normalised.length === 3 ? [...normalised].map((part) => `${part}${part}`).join("") : normalised;

  if (!/^[0-9a-f]{6}$/i.test(expanded)) {
    throw new Error(`Expected a six-digit hex colour, received: ${value}`);
  }

  return [0, 2, 4].map((offset) => Number.parseInt(expanded.slice(offset, offset + 2), 16));
}

function relativeLuminance(colour: number[]) {
  const channels = colour.map((channel) => {
    const ratio = channel / 255;
    return ratio <= 0.04045 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground: string, background: string) {
  const first = relativeLuminance(parseHexColour(foreground));
  const second = relativeLuminance(parseHexColour(background));
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);

  return (lighter + 0.05) / (darker + 0.05);
}

async function readThemeTokens(page: Page) {
  return page.evaluate(() => {
    const themeRoot = document.querySelector(".pq-root") ?? document.documentElement;
    const styles = window.getComputedStyle(themeRoot);
    const token = (name: string) => styles.getPropertyValue(name).trim();

    return {
      background: token("--background"),
      foreground: token("--foreground"),
      surface: token("--surface"),
      muted: token("--ink-muted"),
      primary: token("--primary"),
      primaryForeground: token("--primary-foreground"),
      ring: token("--ring"),
    };
  });
}

test.describe("portfolio reading flow", () => {
  for (const viewport of contentViewports) {
    test(`keeps professional context readable at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/");

      await expect(page.getByRole("heading", { name: "Sukhraj Kalon", level: 1 })).toBeVisible();
      await expectReadableText(page.locator("[data-hero-summary]"));
      await expect(
        page.locator("#home").getByText("First-Class Computer Science graduate", {
          exact: true,
        }),
      ).toBeVisible();
      await expectNoPageOverflow(page);

      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
      await expectNoPageOverflow(page);
    });
  }

  test("shows every portfolio section without hidden horizontal navigation", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");

    const menuTrigger = page.getByRole("button", {
      name: "Open portfolio navigation",
    });
    const chapterLabels = ["Profile", "Projects", "Experience", "Skills", "Contact"];

    await expect(menuTrigger).toBeVisible();
    await expectNoPageOverflow(page);

    for (const chapterLabel of chapterLabels) {
      await menuTrigger.click();
      const sectionNavigation = page.getByRole("navigation", {
        name: "Mobile navigation",
      });
      const links = sectionNavigation.getByRole("link");
      await expect(links).toHaveCount(5);

      const link = sectionNavigation.getByRole("link", { name: chapterLabel });
      const href = await link.getAttribute("href");
      const targetId = href?.split("#")[1];
      expect(targetId).toBeTruthy();

      await link.focus();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(new RegExp(`#${targetId}$`));

      const target = page.locator(`#${targetId}`);
      await expect(target).toBeInViewport();

      if (targetId !== "home") {
        await expect
          .poll(async () =>
            target.evaluate((element) => Math.round(element.getBoundingClientRect().top)),
          )
          .toBeGreaterThanOrEqual(64);
      }
    }
  });

  test("keeps project captions and direct links in mobile reading and keyboard order", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#projects");

    const projects = page.locator("#projects");
    const articles = projects.locator("article[data-project-record]");
    await expect(articles).toHaveCount(6);
    await expect(projects.locator("details")).toHaveCount(0);
    const boxes = await articles.evaluateAll((elements) =>
      elements.map((element) => {
        const { top, bottom } = element.getBoundingClientRect();
        return { top, bottom };
      }),
    );
    for (const [index, article] of (await articles.all()).entries()) {
      await expectReadableText(article.locator("p"));
      if (index > 0) expect(boxes[index].top).toBeGreaterThanOrEqual(boxes[index - 1].bottom - 1);
    }

    const links = projects.getByRole("link");
    await expect(links).toHaveCount(8);
    await links.first().focus();
    await expect(links.first()).toBeFocused();
    for (const link of (await links.all()).slice(1)) {
      await page.keyboard.press("Tab");
      await expect(link).toBeFocused();
      await expect(link).toBeInViewport();
    }
    await expectNoPageOverflow(page);
  });

  test("keeps role overviews and all Skills readable in the document flow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#about");

    const about = page.locator("#about");
    await expect(about.locator("details")).toHaveCount(0);
    const experienceRecords = about.locator("[data-experience-record]");
    await expect(experienceRecords).toHaveCount(5);
    for (const record of await experienceRecords.all()) {
      await expect(record.getByRole("heading", { level: 3 })).toBeVisible();
      await expect(record).toContainText(/\b20\d{2}\b/, { useInnerText: true });
    }
    const studio = about.locator('[data-experience-record="skaltek-founder"]').getByRole("link");
    await studio.focus();
    await expect(studio).toBeFocused();

    const skills = page.locator("#loadout");
    await expect(
      skills.getByRole("heading", { level: 2, name: "Skills", exact: true }),
    ).toBeVisible();
    await expect(
      skills.locator(
        "details, summary, button, [role=button], dialog, [role=dialog], [data-level]",
      ),
    ).toHaveCount(0);
    const capabilityRecords = skills.locator("[data-capability-record]");
    await expect(capabilityRecords).toHaveCount(8);
    for (const record of await capabilityRecords.all()) {
      await expect(record.getByRole("heading", { level: 3 })).toBeVisible();
      const list = record.getByRole("list");
      await expect(list).toHaveCount(1);
      await expect(list).toBeVisible();
      const items = record.locator("[data-skill]");
      expect(await items.count()).toBeGreaterThan(0);
      await expect(list.getByRole("listitem")).toHaveCount(await items.count());
      for (const item of await items.all()) await expectReadableText(item);
    }

    // Static labels and decorative art must not add keyboard stops between outreach links.
    const contactLink = page.locator("#contact").getByRole("link").first();
    await studio.focus();
    await page.keyboard.press("Tab");
    await expect(contactLink).toBeFocused();
    await expect(contactLink).toBeInViewport();
    await expectNoPageOverflow(page);
  });

  test("keeps keyboard focus visible and returns it after closing the CV dialog", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await page.keyboard.press("Tab");
    const focusStyle = await page.evaluate(() => {
      const activeElement = document.activeElement;
      if (!(activeElement instanceof HTMLElement)) return null;

      const styles = window.getComputedStyle(activeElement);
      return {
        outlineStyle: styles.outlineStyle,
        outlineWidth: Number.parseFloat(styles.outlineWidth),
      };
    });

    expect(focusStyle?.outlineStyle).toBe("solid");
    expect(focusStyle?.outlineWidth).toBeGreaterThanOrEqual(2);

    const cvTrigger = page.locator("#home").getByRole("link", {
      name: "Request private CV",
    });
    await cvTrigger.focus();
    await page.keyboard.press("Enter");

    const dialog = page.getByRole("dialog", { name: "Request Sukhraj's CV" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Request CV by email" })).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Contact on LinkedIn" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(cvTrigger).toBeFocused();
  });

  test("keeps orbital tokens on portalled dialogs, sheets, and overlays", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const tokenNames = ["--background", "--surface", "--primary", "--border", "--ring"];
    const readTokens = (selector: string) =>
      page.locator(selector).evaluate((element, names) => {
        const styles = window.getComputedStyle(element);
        return Object.fromEntries(
          names.map((name) => [name, styles.getPropertyValue(name).trim()]),
        );
      }, tokenNames);

    const routeTokens = await readTokens(".pq-root");
    expect(await readTokens("body")).toEqual(routeTokens);

    await page.locator("#home").getByRole("link", { name: "Request private CV" }).click();
    await expect(page.getByRole("dialog", { name: "Request Sukhraj's CV" })).toBeVisible();
    expect(await readTokens('[data-slot="dialog-content"]')).toEqual(routeTokens);
    expect(await readTokens('[data-slot="dialog-overlay"]')).toEqual(routeTokens);
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: "Open portfolio navigation" }).click();
    await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
    expect(await readTokens('[data-slot="sheet-content"]')).toEqual(routeTokens);
    expect(await readTokens('[data-slot="sheet-overlay"]')).toEqual(routeTokens);
  });

  test("meets representative contrast requirements in the dark presentation", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.addInitScript(() => window.localStorage.setItem("theme", "light"));
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/dark/);

    const tokens = await readThemeTokens(page);
    const normalTextPairs = [
      [tokens.foreground, tokens.background],
      [tokens.foreground, tokens.surface],
      [tokens.muted, tokens.background],
      [tokens.muted, tokens.surface],
      [tokens.primaryForeground, tokens.primary],
    ];

    for (const [foreground, background] of normalTextPairs) {
      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
    }

    expect(contrastRatio(tokens.ring, tokens.background)).toBeGreaterThanOrEqual(3);
  });

  test("settles immediately when reduced motion is requested", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    await expect(page.locator(".pq-root")).toHaveAttribute("data-motion-mode", "reduced");
    const motion = await page.locator(".pq-root").evaluate((root) => {
      const motionTargets = [...document.querySelectorAll<HTMLElement>("[data-motion]")];

      return {
        activeAnimations: root
          .getAnimations({ subtree: true })
          .filter((animation) => animation.playState === "running").length,
        incompleteTargets: motionTargets.filter(
          (target) => target.dataset.motionState !== "complete",
        ).length,
        motionMode: (root as HTMLElement).dataset.motionMode,
        scrollBehavior: window.getComputedStyle(document.documentElement).scrollBehavior,
      };
    });

    expect(motion.motionMode).toBe("reduced");
    expect(motion.scrollBehavior).toBe("auto");
    expect(motion.incompleteTargets).toBe(0);
    expect(motion.activeAnimations).toBe(0);
    await expect(
      page.locator("#projects article[data-project-record]").first().getByRole("link"),
    ).toHaveCSS("animation-name", "none");
    await expect(page.locator("[data-hero-summary]")).toBeVisible();
  });

  for (const viewport of releaseViewports) {
    test(`renders the dark portfolio at ${viewport.width}x${viewport.height}`, async ({
      page,
    }, testInfo) => {
      await page.addInitScript(() => window.localStorage.setItem("theme", "light"));
      await page.emulateMedia({ colorScheme: "light" });
      await page.setViewportSize(viewport);
      await page.goto("/");

      await expect(page.locator("html")).toHaveClass(/dark/);
      await expect(page.locator("html")).not.toHaveClass(/light/);
      await expect(page.getByRole("heading", { name: "Sukhraj Kalon", level: 1 })).toBeVisible();
      await expect(page.locator("#projects article[data-project-record]")).toHaveCount(6);
      await expect(page.locator("#about [data-experience-record]")).toHaveCount(5);
      await expect(page.locator("#loadout [data-capability-record]")).toHaveCount(8);
      await expectNoPageOverflow(page);
      await expectHeaderControlsWithinViewport(page);

      if (captureVisualMatrix) {
        await page.screenshot({
          path: testInfo.outputPath("portfolio-full-page.png"),
          fullPage: true,
        });
      }
    });
  }
});
