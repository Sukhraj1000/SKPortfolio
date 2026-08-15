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
});
