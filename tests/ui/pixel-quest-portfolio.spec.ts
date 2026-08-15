import { expect, test, type Page } from "@playwright/test";

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
    await expect(page.getByRole("progressbar", { name: "Portfolio chapters completed" })).toHaveAttribute(
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

  test("keeps the game route on its existing isolated header path", async ({ page }) => {
    await page.goto("/game/");

    await expect(page.locator("[data-portfolio-header]")).toHaveCount(0);
    await expect(page.getByText("Game route // isolated runtime")).toBeVisible();
    await expect(page.getByRole("button", { name: "Start deployment" })).toBeVisible();
    await expect(page.getByRole("group", { name: "Portfolio experience mode" })).toBeVisible();
  });
});
