import { expect, test } from "@playwright/test";

function requireBaseURL(baseURL: string | undefined) {
  if (!baseURL) throw new Error("Playwright baseURL is required.");
  return baseURL;
}

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
}

test.describe("production export compatibility", () => {
  test("keeps navigation, contact, and portalled tokens coherent", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Sukhraj Kalon", level: 1 })).toBeVisible();
    const emailLink = page.locator("#contact").getByRole("link", { name: "Request by email" });
    await expect(emailLink).toHaveAttribute("href", /^mailto:SukhrajKalon@gmail\.com/);

    const routeTokens = await page.locator(".pq-root").evaluate((element) => {
      const styles = window.getComputedStyle(element);
      return ["--background", "--surface", "--primary", "--border", "--ring"].map((name) =>
        styles.getPropertyValue(name).trim(),
      );
    });
    const bodyTokens = await page.locator("body").evaluate((element) => {
      const styles = window.getComputedStyle(element);
      return ["--background", "--surface", "--primary", "--border", "--ring"].map((name) =>
        styles.getPropertyValue(name).trim(),
      );
    });
    expect(bodyTokens).toEqual(routeTokens);

    const cvLink = page.locator("#home").getByRole("link", { name: "Request private CV" });
    await expect(cvLink).toHaveAttribute("href", /^mailto:SukhrajKalon@gmail\.com/);
    await cvLink.click();
    const dialog = page.getByRole("dialog", { name: "Request Sukhraj's CV" });
    await expect(dialog).toBeVisible();
    const dialogTokens = await dialog.evaluate((element) => {
      const styles = window.getComputedStyle(element);
      return ["--background", "--surface", "--primary", "--border", "--ring"].map((name) =>
        styles.getPropertyValue(name).trim(),
      );
    });
    expect(dialogTokens).toEqual(routeTokens);
    await page.keyboard.press("Escape");
    await expect(cvLink).toBeFocused();

    await page.getByRole("button", { name: "Open portfolio navigation" }).click();
    await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
    await page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", {
        name: "Skills",
      })
      .click();
    await expect(page).toHaveURL(/#loadout$/);
    await expectNoHorizontalOverflow(page);
  });

  test("keeps native disclosures uniquely named and keyboard operable", async ({ page }) => {
    await page.goto("/#projects");

    const projectSummaries = page.locator("[data-project-record] summary");
    await expect(projectSummaries).toHaveCount(4);
    const names = await projectSummaries.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("aria-label")),
    );
    expect(new Set(names).size).toBe(4);

    const tymauraSummary = page.getByLabel("Toggle Tymaura engineering details");
    await tymauraSummary.focus();
    await page.keyboard.press("Enter");
    await expect(tymauraSummary.locator("xpath=..")).toHaveAttribute("open", "");

    const experienceSummary = page
      .locator('[data-experience-record="northrop-software-engineer"]')
      .locator("summary");
    await expect(experienceSummary).toHaveAttribute(
      "aria-label",
      /Software Engineer at Northrop Grumman/,
    );
    const skillSummary = page.locator('[data-capability-record="ai-automation"] summary');
    await expect(skillSummary).toHaveAttribute("aria-label", /AI & Automation/);
  });

  test("honors live reduced-motion changes in both directions", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const root = page.locator(".pq-root");
    await expect(root).toHaveAttribute("data-motion-mode", "reduced");

    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(root).toHaveAttribute("data-motion-mode", "enhanced");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(root).toHaveAttribute("data-motion-mode", "reduced");
    await page
      .getByRole("navigation", { name: "Portfolio sections" })
      .getByRole("link", { name: "Projects" })
      .click();
    await expect(page.locator("[data-rail-operator]")).toHaveCSS(
      "background-position",
      "0px -128px",
    );
  });

  test("reflows at 320 pixels and 200 percent text", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");
    await page.locator("html").evaluate((element) => {
      element.style.fontSize = "200%";
    });
    await expect(page.getByRole("heading", { name: "Sukhraj Kalon", level: 1 })).toBeVisible();
    await expect(
      page.locator("#contact").getByRole("link", { name: "Request by email" }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("preserves static contact and disclosures without JavaScript", async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL: requireBaseURL(baseURL),
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto("/");

    await expect(
      page.locator("#contact").getByRole("link", { name: "Request by email" }),
    ).toHaveAttribute("href", /^mailto:SukhrajKalon@gmail\.com/);
    await expect(
      page.locator("#home").getByRole("link", { name: "Request private CV" }),
    ).toHaveAttribute("href", /^mailto:SukhrajKalon@gmail\.com/);

    const details = page.locator("[data-project-record]").first().locator("details");
    const summary = details.locator("summary");
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(details).toHaveAttribute("open", "");
    await expectNoHorizontalOverflow(page);
    await context.close();
  });

  test("publishes canonical static discovery metadata", async ({ page, request }) => {
    await page.goto("/");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://sukhrajkalon.info/",
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      "https://sukhrajkalon.info/sukhraj-kalon-social-card.png",
    );
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute(
      "content",
      "1200",
    );
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute(
      "content",
      "630",
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
    await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute(
      "content",
      "Sukhraj Kalon software engineer and product builder portfolio card",
    );

    const socialCard = await request.get("/sukhraj-kalon-social-card.png");
    expect(socialCard.ok()).toBeTruthy();
    expect(socialCard.headers()["content-type"]).toBe("image/png");
    expect((await socialCard.body()).byteLength).toBeGreaterThan(500_000);

    const graph = await page
      .locator("#portfolio-structured-data")
      .evaluate((element) => JSON.parse(element.textContent ?? "null"));
    expect(graph["@context"]).toBe("https://schema.org");
    expect(graph["@graph"].some((entry: { name?: string }) => entry.name === "Sukhraj Kalon")).toBe(
      true,
    );
    expect(
      graph["@graph"].filter((entry: { "@type"?: string }) => entry["@type"] === "CreativeWork"),
    ).toHaveLength(4);

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    expect(await sitemap.text()).toContain("https://sukhrajkalon.info/game/");
    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBeTruthy();
    expect(await robots.text()).toContain("Sitemap: https://sukhrajkalon.info/sitemap.xml");
  });

  test("keeps the static Game fallback navigable and runtime-free", async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL: requireBaseURL(baseURL),
      javaScriptEnabled: false,
      viewport: { width: 320, height: 568 },
    });
    const page = await context.newPage();
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.goto("/game/");

    await expect(page.getByRole("heading", { name: "Five actions, then run." })).toBeVisible();
    await expect(page.getByRole("link", { name: "Exit to Portfolio" })).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
    expect(requests.some((url) => url.includes("industrial-world-atlas"))).toBeFalsy();
    expect(requests.some((url) => url.includes("sk-character-sheet"))).toBeFalsy();
    await expectNoHorizontalOverflow(page);
    await context.close();
  });
});
