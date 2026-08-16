import { expect, test } from "@playwright/test";

const progressKey = "iron-signal:game-progress";

function requireBaseURL(baseURL: string | undefined) {
  if (!baseURL) throw new Error("Playwright baseURL is required");
  return baseURL;
}

test.describe("Chronicle Run", () => {
  test("keeps the recruiter-facing portfolio independent of game assets", async ({
    page,
  }) => {
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /I build systems that/i }),
    ).toBeVisible();
    await page.waitForTimeout(800);
    expect(
      requests.some((url) =>
        /game\/assets|sk-character-sheet|industrial-world-atlas/i.test(url),
      ),
    ).toBe(false);
    await expect(page.locator("canvas")).toHaveCount(0);
  });

  test("enters the training shell directly from Portfolio Game mode", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Enter Game mode" }).click();
    await expect(page).toHaveURL(/\/game\/$/);
    await expect(page.locator("canvas")).toHaveCount(1, { timeout: 15_000 });
    await expect(page.locator("[data-tutorial-prompt]")).toContainText(
      "1 / 5",
    );
    await expect(page.locator("[data-run-started]")).toHaveAttribute(
      "data-run-started",
      "false",
    );
  });

  test("transitions directly into the paused five-step training shell", async ({
    page,
  }) => {
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));

    await page.goto("/game/");

    const runtime = page.locator("[data-run-started]");
    await expect(page.locator("canvas")).toHaveCount(1, { timeout: 15_000 });
    await expect(runtime).toHaveAttribute("data-game-state", "training");
    await expect(runtime).toHaveAttribute("data-run-started", "false");
    await expect(runtime).toHaveAttribute("data-tutorial-step", "jump");
    await expect(page.locator("[data-tutorial-prompt]")).toContainText(
      "1 / 5",
    );
    const heldProgress = await runtime.getAttribute("data-journey-progress");
    await page.waitForTimeout(600);
    await expect(runtime).toHaveAttribute(
      "data-journey-progress",
      heldProgress ?? "0",
    );
    await expect(runtime).toHaveAttribute("data-elapsed-ms", "0");
    await expect
      .poll(() => requests.some((url) => url.includes("industrial-world-atlas")))
      .toBeTruthy();
  });

  test("restores validated local progress in the training shell", async ({ page }) => {
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
            bestTimeMs: 125_000,
          }),
        );
      },
      { key: progressKey },
    );

    await page.goto("/game/");

    const runtime = page.locator("[data-recovered-records]");
    await expect(runtime).toHaveAttribute("data-recovered-records", "2");
    await expect(page.getByText("Records 2/9", { exact: true })).toBeVisible();
    await expect(page.getByText("High 1,250", { exact: true })).toBeVisible();
    await expect(page.getByText("Best 2:05.0", { exact: true })).toBeVisible();
    await expect(page.locator("[data-tutorial-prompt]")).toContainText(
      "Replay walkthrough",
    );
    await expect(
      page.getByRole("button", { name: "Skip walkthrough" }),
    ).toBeVisible();
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
      page.getByRole("heading", { name: "Five actions, then run." }),
    ).toBeVisible();
    await expect(
      page.getByText("Loading the paused training stage.", { exact: false }),
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
    const pausedElapsed = await runtime.getAttribute("data-elapsed-ms");
    await page.waitForTimeout(700);
    await expect(runtime).toHaveAttribute(
      "data-journey-progress",
      pausedProgress ?? "0",
    );
    await expect(runtime).toHaveAttribute(
      "data-elapsed-ms",
      pausedElapsed ?? "0",
    );

    await page.getByRole("button", { name: "Start or resume" }).click();
    await expect(runtime).toHaveAttribute("data-game-state", "running");
    await expect
      .poll(async () => Number(await runtime.getAttribute("data-journey-progress")))
      .toBeGreaterThan(Number(pausedProgress));
    await expect
      .poll(async () => Number(await runtime.getAttribute("data-elapsed-ms")))
      .toBeGreaterThan(Number(pausedElapsed));

    await page.getByRole("button", { name: "Restart level" }).click();
    await expect
      .poll(async () => Number(await runtime.getAttribute("data-journey-progress")))
      .toBeLessThanOrEqual(4);
    await expect
      .poll(async () => Number(await runtime.getAttribute("data-elapsed-ms")))
      .toBeLessThanOrEqual(1_500);
  });

  test("advances the five-step walkthrough only on matching inputs", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/game/");

    const runtime = page.locator("[data-tutorial-step]");
    const prompt = page.locator("[data-tutorial-prompt]");
    const stage = page.getByRole("application", {
      name: /Chronicle Run auto-runner/,
    });
    await stage.focus();

    await expect(runtime).toHaveAttribute("data-tutorial-step", "jump");
    await expect(prompt).toHaveAttribute("data-tutorial-position", "1");
    await page.keyboard.press("Shift");
    await expect(runtime).toHaveAttribute("data-tutorial-step", "jump");

    await page.keyboard.press("Space");
    await expect
      .poll(() => runtime.getAttribute("data-tutorial-step"))
      .toBe("dash");
    await expect(prompt).toHaveAttribute("data-tutorial-position", "2");

    await page.keyboard.press("Shift");
    await expect
      .poll(() => runtime.getAttribute("data-tutorial-step"))
      .toBe("drop");
    await expect(prompt).toHaveAttribute("data-tutorial-position", "3");
    await expect
      .poll(() => runtime.getAttribute("data-player-state"))
      .toMatch(/jumping|falling/);

    await page.keyboard.press("s");
    await expect
      .poll(() => runtime.getAttribute("data-tutorial-step"))
      .toBe("pause");
    await expect(prompt).toHaveAttribute("data-tutorial-position", "4");

    await page.getByRole("button", { name: "Pause", exact: true }).click();
    await expect(runtime).toHaveAttribute("data-game-state", "paused");
    await expect(runtime).toHaveAttribute("data-tutorial-step", "pause");
    await page.getByRole("button", { name: "Start or resume" }).click();
    await expect(runtime).toHaveAttribute("data-tutorial-step", "story-log");
    await expect(prompt).toHaveAttribute("data-tutorial-position", "5");

    await page.getByRole("button", { name: "Open Story Log" }).click();
    await expect(runtime).toHaveAttribute("data-tutorial-step", "complete");
    await expect(runtime).toHaveAttribute("data-tutorial-completed", "true");
    await expect(runtime).toHaveAttribute("data-run-started", "false");
    await page.getByRole("button", { name: "Resume run" }).click();
    await expect(runtime).toHaveAttribute("data-run-started", "true");
    await expect(runtime).toHaveAttribute("data-game-state", "running");
    await expect
      .poll(async () => Number(await runtime.getAttribute("data-journey-progress")))
      .toBeGreaterThan(0);
    await expect
      .poll(() =>
        page.evaluate((key) => {
          const value = JSON.parse(window.localStorage.getItem(key) ?? "null");
          return value?.tutorialCompleted;
        }, progressKey),
      )
      .toBe(true);
  });

  test("accepts the displayed touch actions through Fast Drop", async ({
    browser,
  }) => {
    const baseURL = test.info().project.use.baseURL as string;
    const context = await browser.newContext({
      baseURL,
      hasTouch: true,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      const setPointerCapture = Element.prototype.setPointerCapture;
      Element.prototype.setPointerCapture = function (pointerId) {
        if (this instanceof HTMLButtonElement) {
          throw new DOMException("Pointer capture unavailable", "NotFoundError");
        }
        return setPointerCapture.call(this, pointerId);
      };
    });
    await page.goto("/game/");

    const runtime = page.locator("[data-tutorial-step]");
    await expect(runtime).toHaveAttribute("data-tutorial-step", "jump");
    await page.getByRole("button", { name: "Jump", exact: true }).tap();
    await expect(runtime).toHaveAttribute("data-tutorial-step", "dash");
    await page.getByRole("button", { name: "Dash", exact: true }).tap();
    await expect(runtime).toHaveAttribute("data-tutorial-step", "drop");
    await page.getByRole("button", { name: "Fast drop" }).tap();
    await expect(runtime).toHaveAttribute("data-tutorial-step", "pause");

    await context.close();
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

    const runtime = page.locator("[data-tutorial-step]");
    await expect(page.locator("[data-tutorial-prompt]")).toContainText(
      "Replay walkthrough",
    );
    await expect(runtime).toHaveAttribute("data-run-started", "false");
    await page.getByRole("button", { name: "Skip walkthrough" }).click();
    await expect(runtime).toHaveAttribute("data-tutorial-step", "complete");
    await expect(runtime).toHaveAttribute("data-run-started", "true");
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
    const pausedElapsed = await runtime.getAttribute("data-elapsed-ms");
    await page.waitForTimeout(500);
    await expect(runtime).toHaveAttribute(
      "data-journey-progress",
      pausedProgress ?? "0",
    );
    await expect(runtime).toHaveAttribute(
      "data-elapsed-ms",
      pausedElapsed ?? "0",
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

  test("unlocks a factual record again after Restart clears the story run", async ({
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
    await expect(runtime).toHaveAttribute("data-recovered-records", "0");
    await expect(unlockCard).toHaveCount(0);
    await expect
      .poll(() =>
        page.evaluate((key) => {
          const value = JSON.parse(window.localStorage.getItem(key) ?? "null");
          return value?.recoveredRecords;
        }, progressKey),
      )
      .toEqual([]);

    await page.getByRole("application").focus();
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
    await expect(runtime).toHaveAttribute("data-recovered-records", "1");
    await expect(page.getByText(/already stored/i)).toHaveCount(0);
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
    const completedTime = Number(await runtime.getAttribute("data-elapsed-ms"));
    expect(completedScore).toBeGreaterThan(0);
    expect(completedTime).toBeGreaterThan(0);
    await expect(completion).toContainText("New personal best");
    await expect
      .poll(() =>
        page.evaluate((key) => {
          const value = JSON.parse(window.localStorage.getItem(key) ?? "null");
          return {
            completed: value?.completed,
            chapters: value?.completedChapters?.length,
            records: value?.recoveredRecords?.length,
            highScore: value?.highScore,
            bestTimeMs: value?.bestTimeMs,
          };
        }, progressKey),
      )
      .toEqual({
        completed: true,
        chapters: 5,
        records: 9,
        highScore: completedScore,
        bestTimeMs: completedTime,
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
    await expect(runtime).toHaveAttribute("data-recovered-records", "0");
    await expect
      .poll(() =>
        page.evaluate((key) => {
          const value = JSON.parse(window.localStorage.getItem(key) ?? "null");
          return {
            records: value?.recoveredRecords?.length,
            completed: value?.completed,
            highScore: value?.highScore,
            bestTimeMs: value?.bestTimeMs,
          };
        }, progressKey),
      )
      .toEqual({
        records: 0,
        completed: true,
        highScore: completedScore,
        bestTimeMs: completedTime,
      });
  });

  test("updates theme and motion live and supports the documented runtime shortcuts", async ({
    page,
  }) => {
    await page.addInitScript(
      ({ key }) => {
        window.localStorage.setItem(
          key,
          JSON.stringify({
            version: 1,
            recoveredRecords: ["education:first-class-computer-science"],
            completedChapters: [],
            tutorialCompleted: true,
            completed: false,
            highScore: 7300,
          }),
        );
      },
      { key: progressKey },
    );
    await page.emulateMedia({
      colorScheme: "dark",
      reducedMotion: "no-preference",
    });
    await page.goto("/game/");
    await page.getByRole("button", { name: "Skip walkthrough" }).click();
    const runtime = page.locator("[data-reduced-motion]");
    const stage = page.getByRole("application", { name: /Chronicle Run auto-runner/ });
    await stage.focus();
    await expect(runtime).toHaveAttribute("data-recovered-records", "1");
    await expect(runtime).toHaveAttribute("data-reduced-motion", "false");
    await expect(runtime).toHaveAttribute("data-reward-motion", "animated");
    await expect
      .poll(async () => Number(await runtime.getAttribute("data-journey-progress")))
      .toBeGreaterThan(1);

    await page.keyboard.press("m");
    await expect(page.getByRole("button", { name: "Mute sound" })).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("iron-signal:game-sound")))
      .toBe("on");

    const progressBeforeTheme = Number(
      await runtime.getAttribute("data-journey-progress"),
    );
    await page.getByRole("button", { name: "Switch to day theme" }).click();
    await expect(page.locator("html")).toHaveClass(/light/);
    await expect(page.locator("canvas")).toHaveCount(1);
    await expect
      .poll(async () => Number(await runtime.getAttribute("data-journey-progress")))
      .toBeGreaterThanOrEqual(progressBeforeTheme);

    const progressBeforeMotion = Number(
      await runtime.getAttribute("data-journey-progress"),
    );
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await expect(runtime).toHaveAttribute("data-reduced-motion", "true");
    await expect(runtime).toHaveAttribute("data-reward-motion", "settled");
    await expect
      .poll(async () => Number(await runtime.getAttribute("data-journey-progress")))
      .toBeGreaterThanOrEqual(progressBeforeMotion);

    await page.keyboard.press("r");
    await expect
      .poll(async () => Number(await runtime.getAttribute("data-journey-progress")))
      .toBeLessThanOrEqual(4);
    await expect
      .poll(() =>
        page.evaluate((key) => {
          const value = JSON.parse(window.localStorage.getItem(key) ?? "null");
          return {
            records: value?.recoveredRecords?.length,
            highScore: value?.highScore,
          };
        }, progressKey),
      )
      .toEqual({ records: 0, highScore: 7300 });

    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "hidden",
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect(runtime).toHaveAttribute("data-game-state", "paused");
    await page.getByRole("button", { name: "Start or resume" }).click();
    await expect(runtime).toHaveAttribute("data-game-state", "running");

    await stage.focus();
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/\/#home$/);
    await expect(
      page.getByRole("heading", { name: /I build systems that/i }),
    ).toBeVisible();
  });

  test("reflows training, runtime, Story Log, and unlock UI at 320 pixels and 200 percent text", async ({
    browser,
    baseURL,
  }) => {
    test.setTimeout(50_000);
    const context = await browser.newContext({
      viewport: { width: 320, height: 900 },
      hasTouch: true,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
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
    await page.goto(`${requireBaseURL(baseURL)}/game/`);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });

    const noHorizontalPageOverflow = async () =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      );
    await page.locator("canvas").waitFor();
    await expect.poll(noHorizontalPageOverflow).toBe(true);
    const tutorialPrompt = page.locator("[data-tutorial-prompt]");
    await expect(tutorialPrompt).toContainText("Replay walkthrough");
    await expect
      .poll(() =>
        tutorialPrompt.evaluate(
          (element) => element.scrollWidth <= element.clientWidth,
        ),
      )
      .toBe(true);

    await page.getByRole("button", { name: "Skip walkthrough" }).click();
    await expect.poll(noHorizontalPageOverflow).toBe(true);
    const touchButtons = page.locator('[aria-label="Touch game controls"] button');
    await expect(touchButtons).toHaveCount(3);
    for (let index = 0; index < 3; index += 1) {
      const box = await touchButtons.nth(index).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(320);
    }

    await page.getByRole("button", { name: "Open Story Log" }).click();
    const dialog = page.getByRole("dialog", { name: "Recovered milestones." });
    await expect(dialog).toContainText("No records recovered yet");
    await expect.poll(noHorizontalPageOverflow).toBe(true);
    await expect
      .poll(() =>
        dialog.evaluate((element) => element.scrollWidth <= element.clientWidth),
      )
      .toBe(true);
    await page.getByRole("button", { name: "Close Story Log" }).click();
    const runtime = page.locator("[data-recovered-records]");
    await expect(runtime).toHaveAttribute("data-game-state", "paused");
    await page.getByRole("button", { name: "Start or resume" }).click();
    await page.getByRole("application").focus();

    const unlockCard = page.locator("[data-unlock-card]");
    for (let attempt = 0; attempt < 50; attempt += 1) {
      if ((await unlockCard.count()) > 0) break;
      await page.keyboard.down("Shift");
      await page.waitForTimeout(70);
      await page.keyboard.up("Shift");
      await page.waitForTimeout(300);
    }
    await expect(unlockCard).toContainText("First-Class Computer Science graduate");
    await expect.poll(noHorizontalPageOverflow).toBe(true);
    const cardBox = await unlockCard.boundingBox();
    const firstTouchBox = await touchButtons.first().boundingBox();
    expect(cardBox).not.toBeNull();
    expect(firstTouchBox).not.toBeNull();
    expect(cardBox!.y + cardBox!.height).toBeLessThanOrEqual(firstTouchBox!.y);
    await context.close();
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
    await page.locator("canvas").waitFor();

    for (const name of ["Jump", "Dash", "Fast drop"]) {
      const control = page.getByRole("button", { name, exact: true });
      await expect(control).toBeVisible();
      const box = await control.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }

    const runtime = page.locator("[data-tutorial-step]");
    await expect(runtime).toHaveAttribute("data-player-state", "grounded");
    await page.getByRole("button", { name: "Jump", exact: true }).click();
    await expect(runtime).toHaveAttribute("data-tutorial-step", "dash");
    await page.getByRole("button", { name: "Dash", exact: true }).click();
    await expect(runtime).toHaveAttribute("data-tutorial-step", "drop");
    await expect
      .poll(() => runtime.getAttribute("data-player-state"))
      .toMatch(/jumping|falling/);
    await page.getByRole("button", { name: "Fast drop", exact: true }).click();
    await expect(runtime).toHaveAttribute("data-tutorial-step", "pause");

    await context.close();
  });

  test("advances chapters and recovers quickly after a route impact", async ({
    page,
  }) => {
    test.setTimeout(55_000);
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
