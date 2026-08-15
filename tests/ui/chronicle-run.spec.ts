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
    await page.keyboard.down("Space");
    await expect
      .poll(() => runtime.getAttribute("data-player-state"))
      .toMatch(/jumping|falling/);
    await page.keyboard.up("Space");

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

  test("guides a first run through controls and stores tutorial completion", async ({
    page,
  }) => {
    test.setTimeout(40_000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/game/");
    await page.getByRole("button", { name: "Start Chronicle Run" }).click();

    const runtime = page.locator("[data-tutorial-step]");
    const stage = page.getByRole("application", { name: /Chronicle Run auto-runner/ });
    await stage.focus();

    await expect(runtime).toHaveAttribute("data-tutorial-step", "auto-run");
    await expect
      .poll(() => runtime.getAttribute("data-tutorial-step"))
      .toBe("jump");
    await expect(page.locator("[data-tutorial-prompt]")).toContainText(
      "Jump the route marker",
    );

    await page.keyboard.down("Space");
    await page.waitForTimeout(100);
    await page.keyboard.up("Space");
    await expect
      .poll(() => runtime.getAttribute("data-tutorial-step"))
      .toBe("dash");

    await page.keyboard.down("Shift");
    await page.waitForTimeout(100);
    await page.keyboard.up("Shift");
    await expect
      .poll(() => runtime.getAttribute("data-tutorial-step"))
      .toBe("drop");

    await page.keyboard.down("Space");
    await expect
      .poll(() => runtime.getAttribute("data-player-state"))
      .toMatch(/jumping|falling/);
    await page.keyboard.up("Space");
    await page.keyboard.down("s");
    await expect
      .poll(() => runtime.getAttribute("data-tutorial-step"))
      .toBe("route");
    await page.keyboard.up("s");

    for (let attempt = 0; attempt < 16; attempt += 1) {
      if ((await runtime.getAttribute("data-tutorial-step")) === "pickup") break;
      await page.keyboard.down("Space");
      await page.waitForTimeout(90);
      await page.keyboard.up("Space");
      await page.waitForTimeout(240);
    }
    await expect(runtime).toHaveAttribute("data-tutorial-step", "pickup");
    await expect
      .poll(() => runtime.getAttribute("data-tutorial-step"), {
        timeout: 12_000,
      })
      .toBe("pause");

    await page.getByRole("button", { name: "Pause", exact: true }).click();
    await expect(runtime).toHaveAttribute("data-tutorial-step", "story-log");
    await page.getByRole("button", { name: "Start or resume" }).click();
    await page.getByRole("button", { name: "Open Story Log" }).click();
    await expect(runtime).toHaveAttribute("data-tutorial-step", "complete");
    await expect(runtime).toHaveAttribute("data-tutorial-completed", "true");
    await expect
      .poll(() =>
        page.evaluate((key) => {
          const value = JSON.parse(window.localStorage.getItem(key) ?? "null");
          return value?.tutorialCompleted;
        }, progressKey),
      )
      .toBe(true);
  });

  test("lets returning players replay or skip the walkthrough", async ({ page }) => {
    await page.addInitScript(
      ({ key }) => {
        window.localStorage.setItem(
          key,
          JSON.stringify({
            version: 1,
            recoveredRecords: [],
            completedChapters: [],
            tutorialCompleted: true,
            completed: false,
            highScore: 0,
          }),
        );
      },
      { key: progressKey },
    );
    await page.goto("/game/");

    await expect(
      page.getByRole("button", { name: "Replay guided run" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Skip walkthrough" }).click();
    await expect(page.locator("[data-tutorial-step]")).toHaveAttribute(
      "data-tutorial-step",
      "complete",
    );
    await expect(page.locator("[data-tutorial-prompt]")).toHaveCount(0);
  });

  test("keeps the Story Log focus-contained and paused for empty and partial progress", async ({
    page,
  }) => {
    await page.addInitScript(
      ({ key }) => {
        if (window.localStorage.getItem(key)) return;
        window.localStorage.setItem(
          key,
          JSON.stringify({
            version: 1,
            recoveredRecords: [],
            completedChapters: [],
            tutorialCompleted: true,
            completed: false,
            highScore: 4200,
          }),
        );
      },
      { key: progressKey },
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/game/");
    await page.getByRole("button", { name: "Skip walkthrough" }).click();
    const runtime = page.locator("[data-recovered-records]");
    const storyLogButton = page.getByRole("button", { name: "Open Story Log" });
    const dialog = page.getByRole("dialog", { name: "Recovered milestones." });
    await storyLogButton.click();
    await expect(dialog).toContainText("No records recovered yet");
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);

    await page.evaluate(
      ({ key }) => {
        window.localStorage.setItem(
          key,
          JSON.stringify({
            version: 1,
            recoveredRecords: [
              "education:first-class-computer-science",
              "experience:techfront-led-technician",
            ],
            completedChapters: ["origin"],
            tutorialCompleted: true,
            completed: false,
            highScore: 4200,
          }),
        );
      },
      { key: progressKey },
    );
    await page.reload();
    await page.getByRole("button", { name: "Skip walkthrough" }).click();
    await storyLogButton.click();

    await expect(dialog).toBeVisible();
    await expect(runtime).toHaveAttribute("data-game-state", "story");
    await expect(dialog).toContainText("2 of 9 factual records recovered");
    await expect(dialog).toContainText("First-Class Computer Science graduate");
    await expect(dialog).toContainText("Techfront UK");
    await expect(dialog).toContainText("Undiscovered record");
    await expect(dialog.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "2",
    );
    const pausedProgress = await runtime.getAttribute("data-journey-progress");
    await page.waitForTimeout(500);
    await expect(runtime).toHaveAttribute(
      "data-journey-progress",
      pausedProgress ?? "0",
    );

    await page.keyboard.press("Shift+Tab");
    await expect
      .poll(() =>
        page.evaluate(() => {
          const overlay = document.querySelector('[data-story-overlay="story-log"]');
          return Boolean(overlay?.contains(document.activeElement));
        }),
      )
      .toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(runtime).toHaveAttribute("data-game-state", "paused");
    await expect(storyLogButton).toBeFocused();
    await page.getByRole("button", { name: "Start or resume" }).click();
    await expect(runtime).toHaveAttribute("data-game-state", "running");
  });

  test("unlocks a factual record without pausing and deduplicates it on replay", async ({
    page,
  }) => {
    test.setTimeout(65_000);
    await page.addInitScript(
      ({ key }) => {
        window.localStorage.setItem(
          key,
          JSON.stringify({
            version: 1,
            recoveredRecords: [],
            completedChapters: [],
            tutorialCompleted: true,
            completed: false,
            highScore: 0,
          }),
        );
      },
      { key: progressKey },
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/game/");
    await page.getByRole("button", { name: "Skip walkthrough" }).click();
    await page.getByRole("application").focus();

    const runtime = page.locator("[data-recovered-records]");
    const unlockCard = page.locator("[data-unlock-card]");
    for (let attempt = 0; attempt < 45; attempt += 1) {
      if ((await unlockCard.count()) > 0) break;
      await page.keyboard.down("Shift");
      await page.waitForTimeout(70);
      await page.keyboard.up("Shift");
      await page.waitForTimeout(300);
    }

    await expect(unlockCard).toHaveAttribute(
      "data-record-id",
      "education:first-class-computer-science",
    );
    await expect(unlockCard).toContainText(
      "First-Class Computer Science graduate",
    );
    await expect(unlockCard).toContainText(
      "generates, compiles, tests, and analyses Solana smart contracts",
    );
    await expect(
      page.locator('[role="status"]').filter({ hasText: "Education unlocked" }),
    ).toBeAttached();
    await expect(runtime).toHaveAttribute("data-game-state", "running");
    const progressWithCard = Number(
      await runtime.getAttribute("data-journey-progress"),
    );
    await expect
      .poll(async () => Number(await runtime.getAttribute("data-journey-progress")))
      .toBeGreaterThan(progressWithCard);
    await expect(runtime).toHaveAttribute("data-recovered-records", "1");
    await expect
      .poll(() =>
        page.evaluate((key) => {
          const value = JSON.parse(window.localStorage.getItem(key) ?? "null");
          return value?.recoveredRecords;
        }, progressKey),
      )
      .toContain("education:first-class-computer-science");

    await page
      .getByRole("button", {
        name: "Dismiss First-Class Computer Science graduate unlock card",
      })
      .click();
    await expect(unlockCard).toHaveCount(0);

    await page.getByRole("button", { name: "Restart level" }).click();
    await expect
      .poll(async () => Number(await runtime.getAttribute("data-journey-progress")), {
        timeout: 25_000,
      })
      .toBeGreaterThanOrEqual(13);
    await expect(unlockCard).toHaveCount(0);
    await expect(runtime).toHaveAttribute("data-recovered-records", "1");
  });

  test("persists completion and supports Story Log review and replay", async ({
    page,
  }) => {
    test.setTimeout(150_000);
    await page.addInitScript(
      ({ key }) => {
        window.localStorage.setItem(
          key,
          JSON.stringify({
            version: 1,
            recoveredRecords: [],
            completedChapters: [],
            tutorialCompleted: true,
            completed: false,
            highScore: 0,
          }),
        );
      },
      { key: progressKey },
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/game/");
    await page.getByRole("button", { name: "Skip walkthrough" }).click();
    await page.getByRole("application").focus();

    const completion = page.locator('[data-story-overlay="complete"]');
    for (let attempt = 0; attempt < 175; attempt += 1) {
      if ((await completion.count()) > 0) break;
      await page.keyboard.down("Shift");
      await page.waitForTimeout(70);
      await page.keyboard.up("Shift");
      await page.waitForTimeout(600);
    }

    await expect(completion).toBeVisible();
    await expect(completion).toContainText(
      "Run complete. The next chapter is open.",
    );
    await expect(completion).toContainText("9 / 9");
    await expect(completion).toContainText("5 / 5");
    const runtime = page.locator("[data-recovered-records]");
    await expect(runtime).toHaveAttribute("data-game-state", "story");
    await expect(runtime).toHaveAttribute("data-recovered-records", "9");
    const completedScore = Number(await runtime.getAttribute("data-score"));
    expect(completedScore).toBeGreaterThan(0);
    await expect
      .poll(() =>
        page.evaluate((key) => {
          const value = JSON.parse(window.localStorage.getItem(key) ?? "null");
          return {
            completed: value?.completed,
            chapters: value?.completedChapters?.length,
            records: value?.recoveredRecords?.length,
            highScore: value?.highScore,
          };
        }, progressKey),
      )
      .toEqual({
        completed: true,
        chapters: 5,
        records: 9,
        highScore: completedScore,
      });

    await completion.getByRole("button", { name: "Open Story Log" }).click();
    const storyLog = page.locator('[data-story-overlay="story-log"]');
    await expect(storyLog).toContainText("9 of 9 factual records recovered");
    await expect(storyLog.locator('[data-record-state="recovered"]')).toHaveCount(9);
    await expect(storyLog.locator('[data-record-state="locked"]')).toHaveCount(0);
    await page.getByRole("button", { name: "Back to recap" }).click();
    await page.getByRole("button", { name: "Replay run" }).click();
    await expect(completion).toHaveCount(0);
    await expect
      .poll(async () => Number(await runtime.getAttribute("data-journey-progress")))
      .toBeLessThanOrEqual(4);
    await expect(runtime).toHaveAttribute("data-recovered-records", "9");
  });

  test("keeps labelled touch actions large enough on compact screens", async ({
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
    await page.goto("/game/");
    await page.getByRole("button", { name: "Start Chronicle Run" }).click();

    for (const name of ["Jump", "Dash", "Fast drop"]) {
      const control = page.getByRole("button", { name, exact: true });
      await expect(control).toBeVisible();
      const box = await control.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }

    await context.close();
  });

  test("advances chapters and recovers quickly after a route impact", async ({
    page,
  }) => {
    test.setTimeout(55_000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/game/");
    await page.getByRole("button", { name: "Start Chronicle Run" }).click();

    const runtime = page.locator("[data-journey-progress]");
    await expect
      .poll(async () => Number(await runtime.getAttribute("data-checkpoints")), {
        timeout: 35_000,
      })
      .toBeGreaterThanOrEqual(2);
    await expect(runtime).toHaveAttribute(
      "data-chronicle-chapter",
      "live-systems",
    );
    await expect
      .poll(async () => Number(await runtime.getAttribute("data-signal")), {
        timeout: 15_000,
      })
      .toBeLessThan(100);

    const recoveryProgress = Number(
      await runtime.getAttribute("data-journey-progress"),
    );
    await expect
      .poll(async () => Number(await runtime.getAttribute("data-journey-progress")))
      .toBeGreaterThan(recoveryProgress);
    await expect(page.locator("[data-game-notice]")).toContainText(
      /Route impact|checkpoint/i,
    );
  });
});
