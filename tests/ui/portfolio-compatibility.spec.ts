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

async function expectVisibleSkills(page: import("@playwright/test").Page) {
  const skills = page.locator("#loadout");
  await expect(
    skills.getByRole("heading", { level: 2, name: "Skills", exact: true }),
  ).toBeVisible();
  await expect(
    skills.locator("details, summary, button, [role=button], dialog, [role=dialog], [data-level]"),
  ).toHaveCount(0);
  await expect(skills).not.toContainText(/\b(?:primary|supporting)\b|\d+\s*%/i);
  const groups = skills.locator("[data-capability-record]");
  await expect(groups).toHaveCount(8);
  expect(
    await groups.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("data-capability-record")),
    ),
  ).toEqual([
    "languages",
    "application-engineering",
    "ai-automation",
    "backend-data",
    "cloud-delivery",
    "testing-quality",
    "emerging-technology",
    "vision-hardware",
  ]);
  for (const group of await groups.all()) {
    await expect(group.getByRole("heading", { level: 3 })).toBeVisible();
    await expect(group.getByRole("list")).toHaveCount(1);
    await expect(group.getByRole("list")).toBeVisible();
    const items = group.locator("[data-skill]");
    expect(await items.count()).toBeGreaterThan(0);
    await expect(group.getByRole("listitem")).toHaveCount(await items.count());
    for (const item of await items.all()) {
      await expect(item).toBeVisible();
      await expect(item).toHaveText(/\S/);
    }
    const art = group.locator("svg[data-skill-art]");
    await expect(art).toHaveCount(1);
    await expect(art).toBeVisible();
    await expect(art).toHaveAttribute("aria-hidden", "true");
    await expect(art).toHaveAttribute("focusable", "false");
    await expect(art).not.toHaveAttribute("tabindex");
  }
}

async function expectFinishedSkillArt(page: import("@playwright/test").Page) {
  const art = page.locator("#loadout svg[data-skill-art]");
  await expect(art).toHaveCount(8);
  for (const image of await art.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveCSS("opacity", "1");
    await expect(image).toHaveCSS("transform", "none");
    const motion = await image.evaluate((element) => {
      const nodes: Element[] = [element, ...element.querySelectorAll("*")];
      let parent = element.parentElement;
      while (parent && parent.id !== "loadout") {
        nodes.push(parent);
        parent = parent.parentElement;
      }
      return {
        styles: nodes.map((node) => {
          const style = getComputedStyle(node);
          return {
            opacity: Number(style.opacity),
            names: style.animationName.split(",").map((name) => name.trim()),
            durations: style.animationDuration
              .split(",")
              .map(
                (duration) => parseFloat(duration) * (duration.trim().endsWith("ms") ? 0.001 : 1),
              ),
            iterations: style.animationIterationCount.split(",").map((count) => count.trim()),
            transitions: style.transitionDuration
              .split(",")
              .map(
                (duration) => parseFloat(duration) * (duration.trim().endsWith("ms") ? 0.001 : 1),
              ),
          };
        }),
        running: (element.closest("[data-capability-record]") ?? element)
          .getAnimations({ subtree: true })
          .filter((animation) => animation.playState === "running").length,
      };
    });
    expect(motion.running).toBe(0);
    for (const style of motion.styles) {
      expect(style.opacity).toBeGreaterThan(0);
      expect(style.transitions.every((duration) => duration <= 0.001)).toBe(true);
      if (style.names.some((name) => name !== "none")) {
        expect(style.durations.every((duration) => duration <= 0.001)).toBe(true);
        expect(style.iterations).not.toContain("infinite");
      }
    }
  }
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

  test("keeps work links direct and all Skills visible without extra keyboard stops", async ({
    page,
    browserName,
  }) => {
    await page.goto("/#projects");
    const projects = page.locator("#projects");
    const about = page.locator("#about");
    await expect(
      projects.getByRole("heading", { name: "Projects", level: 2, exact: true }),
    ).toBeVisible();
    await expect(
      about.getByRole("heading", { name: "Experience", level: 2, exact: true }),
    ).toBeVisible();
    await expect(page.locator("#projects details, #about details")).toHaveCount(0);
    await expect(projects.getByRole("link")).toHaveCount(8);
    const studio = about.locator('[data-experience-record="skaltek-founder"]').getByRole("link");
    await expect(studio).toHaveAccessibleName(/Skaltek/i);
    await expect(studio).toHaveAttribute("href", /^https:\/\/(?:www\.)?skaltek\.co\.uk(?:\/|$)/i);

    await expectVisibleSkills(page);
    await studio.focus();
    await expect(studio).toBeFocused();
    await page.keyboard.press("Tab");
    // Safari on macOS can leave plain Tab for form controls and Option+Tab for links.
    if (
      browserName === "webkit" &&
      (await page.evaluate(() => document.activeElement === document.body))
    ) {
      await studio.focus();
      await page.keyboard.press("Alt+Tab");
    }
    await expect(page.locator("#contact").getByRole("link").first()).toBeFocused();
  });

  test("honors live reduced-motion changes in both directions", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const root = page.locator(".pq-root");
    await expect(root).toHaveAttribute("data-motion-mode", "reduced");
    await expectFinishedSkillArt(page);

    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(root).toHaveAttribute("data-motion-mode", "enhanced");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(root).toHaveAttribute("data-motion-mode", "reduced");
    await expectFinishedSkillArt(page);
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
      page.locator("#projects article[data-project-record]").first().locator("p"),
    ).toBeVisible();
    await expect(
      page.locator("#about [data-experience-record]").last().getByRole("heading", { level: 3 }),
    ).toBeVisible();
    await expect(
      page.locator("#contact").getByRole("link", { name: "Request by email" }),
    ).toBeVisible();
    await expectVisibleSkills(page);
    await expectNoHorizontalOverflow(page);
  });

  test("preserves direct work, contact and Skills access without JavaScript", async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL: requireBaseURL(baseURL),
      javaScriptEnabled: false,
      viewport: { width: 320, height: 568 },
    });
    const page = await context.newPage();
    await page.goto("/");

    await expect(
      page.locator("#contact").getByRole("link", { name: "Request by email" }),
    ).toHaveAttribute("href", /^mailto:SukhrajKalon@gmail\.com/);
    await expect(
      page.locator("#home").getByRole("link", { name: "Request private CV" }),
    ).toHaveAttribute("href", /^mailto:SukhrajKalon@gmail\.com/);

    const projects = page.locator("#projects");
    const articles = projects.locator("article[data-project-record]");
    await expect(articles).toHaveCount(6);
    await expect(page.locator("#projects details, #about details")).toHaveCount(0);
    await expect(page.locator("#about [data-experience-record]")).toHaveCount(5);
    for (const article of await articles.all()) {
      await expect(article.getByRole("heading", { level: 3 })).toBeVisible();
      await expect(article.locator("p")).toBeVisible();
      const image = article.getByRole("img");
      await expect(article.locator("img")).toHaveCount(1);
      await expect(image).toHaveAccessibleName(/\S/);
      await expect(image).toHaveAttribute("src", /^\/(?!\/)[^?#]+\.(?:webp|svg)$/i);
      await expect(image).toHaveAttribute("width", /^[1-9]\d*$/);
      await expect(image).toHaveAttribute("height", /^[1-9]\d*$/);
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          image.evaluate((element: HTMLImageElement) => {
            if (!element.complete || !element.naturalWidth || !element.naturalHeight) return false;
            // With page scripts disabled Firefox can paint the image without settling decode().
            // Read an actual pixel from the local cover rather than depending on that promise.
            const sample = document.createElement("canvas");
            sample.width = sample.height = 1;
            const context = sample.getContext("2d");
            if (!context) return false;
            context.drawImage(element, 0, 0, 1, 1);
            return context.getImageData(0, 0, 1, 1).data[3] > 0;
          }),
        )
        .toBe(true);
      await expect(article.getByRole("link")).toBeVisible();
      await expect(article.getByRole("link")).toHaveAccessibleName(/\S/);
    }
    await expect(
      projects.getByRole("link", { name: /Solana Smart Contract AI Generator/i }),
    ).toBeVisible();
    await expect(
      projects.getByRole("link", { name: /Crypto Portfolio Mobile App/i }),
    ).toBeVisible();
    await expect(
      page.locator('#about [data-experience-record="skaltek-founder"]').getByRole("link"),
    ).toBeVisible();
    await expectVisibleSkills(page);
    await expectFinishedSkillArt(page);
    await expectNoHorizontalOverflow(page);

    // Observe the native navigation, but never contact the external site from the test.
    const tymaura = projects.locator('[data-project-record="tymaura"]').getByRole("link");
    const destination = new URL((await tymaura.getAttribute("href"))!, page.url()).href;
    await context.route(destination, (route) => route.abort());
    await tymaura.focus();
    const [navigation] = await Promise.all([
      page.waitForRequest(
        (request) => request.isNavigationRequest() && request.url() === destination,
      ),
      page.keyboard.press("Enter"),
    ]);
    expect(navigation.frame()).toBe(page.mainFrame());
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
    const person = graph["@graph"].find(
      (entry: { "@type"?: string }) => entry["@type"] === "Person",
    );
    const visibleSkills = await page.locator("#loadout [data-skill]").allTextContents();
    expect([...new Set(person.knowsAbout)].sort()).toEqual(
      [...new Set(visibleSkills.map((item) => item.trim()))].sort(),
    );
    const works = graph["@graph"].filter(
      (entry: { "@type"?: string }) => entry["@type"] === "CreativeWork",
    ) as { name: string; url: string }[];
    expect(works).toHaveLength(8);
    const projects = page.locator("#projects");
    const articles = projects.locator("article[data-project-record]");
    await expect(articles).toHaveCount(6);
    const visibleWorks = await Promise.all(
      (await articles.all()).map(async (article) => ({
        name: (await article.getByRole("heading", { level: 3 }).textContent())?.trim(),
        url: await article.getByRole("link").getAttribute("href"),
      })),
    );
    for (const name of ["Solana Smart Contract AI Generator", "Crypto Portfolio Mobile App"]) {
      const url = await projects.getByRole("link", { name }).getAttribute("href");
      visibleWorks.push({ name, url });
    }
    // Match titles *and destinations*; a count of eight alone could still include Skaltek.
    for (const { name, url } of visibleWorks) {
      expect(
        works.filter((work) => work.name === name).map((work) => new URL(work.url).href),
      ).toEqual([new URL(url!, "https://sukhrajkalon.info/").href]);
    }

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
