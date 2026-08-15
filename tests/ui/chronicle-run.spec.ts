import { expect, test } from "@playwright/test";

const progressKey = "iron-signal:game-progress";

function requireBaseURL(baseURL: string | undefined) {
  if (!baseURL) throw new Error("Playwright baseURL is required");
  return baseURL;
}

test.describe("Chronicle Run", () => {
  test("renders an informative ready state without loading the runtime", async ({
    page,
  }) => {
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));

    await page.goto("/game/");

    await expect(
      page.getByRole("heading", { name: "Chronicle Run." }),
    ).toBeVisible();
    await expect(
      page.getByText("The story is the reward. Movement is the game."),
    ).toBeVisible();
    await expect(
      page.getByRole("list", { name: "Chronicle route" }),
    ).toContainText("Present Day");
    await expect(
      page.getByRole("button", { name: "Start Chronicle Run" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Exit to Portfolio" }),
    ).toHaveAttribute("href", "/#home");
    await expect(page.locator("canvas")).toHaveCount(0);
    expect(requests.some((url) => url.includes("/game/assets/"))).toBeFalsy();
    expect(requests.some((url) => url.includes("phaser"))).toBeFalsy();
  });

  test("summarises validated local progress on the ready state", async ({ page }) => {
    await page.addInitScript(
      ({ key }) => {
        window.localStorage.setItem(
          key,
          JSON.stringify({
            version: 1,
            recoveredRecords: [
              "education:first-class-computer-science",
              "project:tymaura",
            ],
            completedChapters: ["origin"],
            tutorialCompleted: true,
            completed: false,
            highScore: 1250,
          }),
        );
      },
      { key: progressKey },
    );

    await page.goto("/game/");

    await expect(page.locator("[data-ready-records]")).toHaveAttribute(
      "data-ready-records",
      "2",
    );
    await expect(page.getByText("2 / 9", { exact: true })).toBeVisible();
    await expect(page.getByText("1,250", { exact: true })).toBeVisible();
    await expect(page.getByText("Complete", { exact: true })).toBeVisible();
  });

  test("keeps a functional portfolio return when JavaScript is disabled", async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL: requireBaseURL(baseURL),
      javaScriptEnabled: false,
    });
    const page = await context.newPage();

    await page.goto("/game/");

    await expect(
      page.getByRole("heading", { name: "Chronicle Run." }),
    ).toBeVisible();
    await expect(
      page.getByText("Nothing starts automatically.", { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Exit to Portfolio" }),
    ).toHaveAttribute("href", "/#home");
    await context.close();
  });

  test("starts once and exposes the Chronicle runtime shell", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.goto("/game/");

    await page.getByRole("button", { name: "Start Chronicle Run" }).click();

    await expect(page.locator("canvas")).toHaveCount(1, { timeout: 15_000 });
    await expect(
      page.getByRole("heading", { name: "Chronicle Run playable story" }),
    ).toBeAttached();
    await expect(page.locator("[data-chronicle-chapter]")).toHaveAttribute(
      "data-chronicle-chapter",
      "origin",
    );
    await expect(
      page.getByRole("list", { name: "Chronicle chapters" }),
    ).toContainText("Present Day");
    await expect
      .poll(() => requests.some((url) => url.includes("industrial-world-atlas")))
      .toBeTruthy();
  });

  test("auto-runs and responds to jump, dash, pause, and restart", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/game/");
    await page.getByRole("button", { name: "Start Chronicle Run" }).click();

    const runtime = page.locator("[data-journey-progress]");
    await expect(runtime).toHaveAttribute("data-game-state", "running");
    await expect
      .poll(async () => Number(await runtime.getAttribute("data-journey-progress")))
      .toBeGreaterThan(1);

    const stage = page.getByRole("application", { name: /Chronicle Run auto-runner/ });
    await stage.focus();
    await page.keyboard.press("Space");
    await expect
      .poll(() => runtime.getAttribute("data-player-state"))
      .toMatch(/jumping|falling/);

    await page.keyboard.down("Shift");
    await expect
      .poll(() => runtime.getAttribute("data-player-state"))
      .toBe("dashing");
    await expect(runtime).toHaveAttribute("data-dash-ready", "false");
    await page.keyboard.up("Shift");

    await page.getByRole("button", { name: "Pause", exact: true }).click();
    await expect(runtime).toHaveAttribute("data-game-state", "paused");
    const pausedProgress = await runtime.getAttribute("data-journey-progress");
    await page.waitForTimeout(700);
    await expect(runtime).toHaveAttribute(
      "data-journey-progress",
      pausedProgress ?? "0",
    );

    await page.getByRole("button", { name: "Start or resume" }).click();
    await expect(runtime).toHaveAttribute("data-game-state", "running");
    await expect
      .poll(async () => Number(await runtime.getAttribute("data-journey-progress")))
      .toBeGreaterThan(Number(pausedProgress));

    await page.getByRole("button", { name: "Restart level" }).click();
    await expect
      .poll(async () => Number(await runtime.getAttribute("data-journey-progress")))
      .toBeLessThanOrEqual(4);
  });
});
