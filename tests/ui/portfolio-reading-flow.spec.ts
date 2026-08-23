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

  test("keeps featured project evidence visible and supporting notes keyboard operable", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#projects");

    const projectRecords = page.locator("[data-project-record]");
    const featuredProjects = page.locator('[data-project-tier="featured"]');
    const supportingProjects = page.locator('[data-project-tier="supporting"]');
    await expect(projectRecords).toHaveCount(4);
    await expect(featuredProjects).toHaveCount(2);
    await expect(supportingProjects).toHaveCount(2);
    const projectDisclosureNames = await projectRecords
      .locator("summary")
      .evaluateAll((elements) => elements.map((element) => element.getAttribute("aria-label")));
    expect(new Set(projectDisclosureNames).size).toBe(4);
    expect(projectDisclosureNames).toEqual([
      "Toggle Tymaura engineering details",
      "Toggle Skaltek engineering details",
      "Toggle Solana Smart Contract AI Generator engineering details",
      "Toggle Crypto Portfolio Mobile App engineering details",
    ]);
    await expect(featuredProjects.locator(".pq-project-node")).toHaveCount(8);
    for (const node of await featuredProjects.locator(".pq-project-node").all()) {
      await expect(node).toHaveAttribute("aria-hidden", "true");
    }

    for (const record of await projectRecords.all()) {
      await expect(record.getByRole("heading", { level: 3 })).toBeVisible();
      await expect(record.locator("[data-project-kind]")).toBeVisible();
      await expect(record.locator("[data-project-status]")).toBeVisible();
      await expect(record.locator("[data-project-outcome]")).toBeVisible();
    }

    for (const record of await featuredProjects.all()) {
      await expect(record.locator("[data-project-overview]")).toBeVisible();
      await expect(record.locator("[data-project-media]")).toBeVisible();
      await expect(record.locator(".pq-story-beats > div")).toHaveCount(3);
    }

    const firstSupporting = supportingProjects.first();
    const notes = firstSupporting.locator("details");
    const notesSummary = notes.locator("summary");
    await notesSummary.focus();
    await page.keyboard.press("Enter");
    await expect(notes).toHaveAttribute("open", "");
    await expect(notesSummary).toBeFocused();

    const firstFeatured = featuredProjects.first();
    const overview = firstFeatured.locator("[data-project-overview]");
    const media = firstFeatured.locator("[data-project-media]");
    const [overviewBox, mediaBox] = await Promise.all([
      overview.boundingBox(),
      media.boundingBox(),
    ]);
    expect(mediaBox?.y).toBeLessThan(overviewBox?.y ?? Number.POSITIVE_INFINITY);
  });

  test("keeps experience and skills readable with native disclosure controls", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#about");

    const experienceRecords = page.locator("[data-experience-record]");
    await expect(experienceRecords).toHaveCount(4);
    const experienceDisclosureNames = await experienceRecords
      .locator("summary")
      .evaluateAll((elements) => elements.map((element) => element.getAttribute("aria-label")));
    expect(new Set(experienceDisclosureNames).size).toBe(4);

    for (const record of await experienceRecords.all()) {
      await expect(record.getByRole("heading", { level: 3 })).toBeVisible();
      await expect(record.locator("time")).toBeVisible();
      const summary = record.locator("summary");
      await expect(summary).toHaveAttribute("data-disclosure-action", "true");
      expect(await summary.evaluate((element) => element.clientHeight)).toBeGreaterThanOrEqual(44);
    }

    const secondExperience = experienceRecords.nth(1);
    const secondExperienceDetails = secondExperience.locator("details");
    const secondExperienceSummary = secondExperience.locator("summary");
    await secondExperienceSummary.focus();
    await page.keyboard.press("Enter");
    await expect(secondExperienceDetails).toHaveAttribute("open", "");
    await expect(
      secondExperienceSummary.getByText("Hide responsibilities and stack"),
    ).toBeVisible();
    await expect(secondExperienceSummary).toBeFocused();

    const capabilityRecords = page.locator("[data-capability-record]");
    await expect(capabilityRecords).toHaveCount(5);
    const capabilityDisclosureNames = await capabilityRecords
      .locator("summary")
      .evaluateAll((elements) => elements.map((element) => element.getAttribute("aria-label")));
    expect(new Set(capabilityDisclosureNames).size).toBe(5);

    for (const record of await capabilityRecords.all()) {
      await expect(record.getByRole("heading", { level: 3 })).toBeVisible();
      await expect(record.getByText(/primary$/)).toBeVisible();
      await expect(record.getByText(/supporting$/)).toBeVisible();
      const summary = record.locator("summary");
      await expect(summary).toHaveAttribute("data-disclosure-action", "true");
      expect(await summary.evaluate((element) => element.clientHeight)).toBeGreaterThanOrEqual(44);
    }

    const firstCapability = capabilityRecords.first();
    const firstCapabilityDetails = firstCapability.locator("details");
    const firstCapabilitySummary = firstCapability.locator("summary");
    await firstCapabilitySummary.click();
    await expect(firstCapabilityDetails).toHaveAttribute("open", "");
    await expect(firstCapabilitySummary.getByText("Close inventory")).toBeVisible();
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

    const motion = await page.evaluate(() => {
      const scan = document.querySelector(".signal-scan");
      const root = window.getComputedStyle(document.documentElement);
      const scanStyles = scan ? window.getComputedStyle(scan) : null;

      return {
        scrollBehavior: root.scrollBehavior,
        scanDuration: scanStyles?.animationDuration ?? "0s",
        scanIterations: scanStyles?.animationIterationCount ?? "1",
      };
    });

    expect(motion.scrollBehavior).toBe("auto");
    expect(Number.parseFloat(motion.scanDuration)).toBeLessThanOrEqual(0.01);
    expect(motion.scanIterations).toBe("1");
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
      await expect(page.locator("[data-project-record]")).toHaveCount(4);
      await expect(page.locator("[data-experience-record]")).toHaveCount(4);
      await expect(page.locator("[data-capability-record]")).toHaveCount(5);
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
