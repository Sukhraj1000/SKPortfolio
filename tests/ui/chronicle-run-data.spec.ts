import { expect, test } from "@playwright/test";
import {
  chronicleJumpApex,
  chronicleRouteReachability,
} from "../../src/components/game/chronicle-route";
import {
  CHRONICLE_PROGRESS_VERSION,
  chronicleChapterIds,
  chronicleChapters,
  chronicleRecordIds,
  chronicleRecords,
  emptyChronicleProgress,
  mergeChronicleProgress,
  parseChronicleProgress,
} from "../../src/components/game/chronicle-story";
import {
  experience,
  portfolioProfile,
  portfolioProjects,
} from "../../src/data/portfolio";

test.describe("Chronicle Run story foundation", () => {
  test("keeps five ordered chapters and nine ordered records", () => {
    expect(chronicleChapters.map((chapter) => chapter.id)).toEqual([
      "origin",
      "live-systems",
      "secure-engineering",
      "build-lab",
      "present-day",
    ]);
    expect(chronicleChapters.map((chapter) => chapter.index)).toEqual([
      "00",
      "01",
      "02",
      "03",
      "04",
    ]);
    expect(chronicleRecords.map((record) => record.id)).toEqual(
      chronicleRecordIds,
    );
    expect(new Set(chronicleRecordIds).size).toBe(9);
  });

  test("keeps every optional-route entrance within a forgiving jump margin", () => {
    expect(chronicleJumpApex).toBeGreaterThan(190);
    expect(chronicleRouteReachability).toHaveLength(5);
    for (const route of chronicleRouteReachability) {
      expect(route.entryRise).toBeGreaterThan(0);
      expect(route.reachRatio).toBeLessThanOrEqual(0.82);
      expect(route.jumpApex - route.entryRise).toBeGreaterThanOrEqual(35);
    }
  });

  test("adapts experience and project facts from canonical portfolio data", () => {
    for (const record of chronicleRecords) {
      if (record.kind === "experience") {
        const source = experience.find((entry) => entry.id === record.sourceId);
        expect(source).toBeDefined();
        expect(record.title).toBe(source?.role);
        expect(record.context).toBe(source?.organisation);
        expect(record.period).toBe(`${source?.start} — ${source?.end}`);
        expect(record.summary).toBe(source?.summary);
        expect(record.technologies).toEqual(source?.technologies.slice(0, 3));
      }

      if (record.kind === "project") {
        const source = portfolioProjects.find(
          (project) => project.id === record.sourceId,
        );
        expect(source).toBeDefined();
        expect(record.title).toBe(source?.title);
        expect(record.context).toBe(source?.kind);
        expect(record.summary).toBe(source?.summary);
        expect(record.technologies).toEqual(source?.technologies.slice(0, 3));
      }
    }

    const education = chronicleRecords[0];
    const finalProject = portfolioProjects.find(
      (project) => project.id === "solana-contract-generator",
    );
    expect(education.title).toBe(portfolioProfile.education);
    expect(education.summary).toBe(finalProject?.summary);
    expect(education.period).toContain(finalProject?.grade);
  });

  test("filters, deduplicates, and restores current progress in story order", () => {
    expect(
      parseChronicleProgress({
        version: CHRONICLE_PROGRESS_VERSION,
        recoveredRecords: [
          "project:tymaura",
          "not-a-record",
          "education:first-class-computer-science",
          "project:tymaura",
        ],
        completedChapters: [
          "build-lab",
          "origin",
          "origin",
          "not-a-chapter",
        ],
        tutorialCompleted: true,
        completed: false,
        highScore: 422.9,
      }),
    ).toEqual({
      version: CHRONICLE_PROGRESS_VERSION,
      recoveredRecords: [
        "education:first-class-computer-science",
        "project:tymaura",
      ],
      completedChapters: ["origin", "build-lab"],
      tutorialCompleted: true,
      completed: false,
      highScore: 422,
    });
  });

  test("fails open for malformed and legacy progress", () => {
    expect(parseChronicleProgress("{broken-json")).toEqual(
      emptyChronicleProgress,
    );
    expect(parseChronicleProgress(null)).toEqual(emptyChronicleProgress);

    expect(
      parseChronicleProgress({
        completed: true,
        highScore: 900,
        completedAt: "2026-08-15T12:00:00.000Z",
        discovered: ["project:tymaura"],
        checkpoints: ["build-lab"],
      }),
    ).toEqual({
      version: CHRONICLE_PROGRESS_VERSION,
      recoveredRecords: [],
      completedChapters: [],
      tutorialCompleted: false,
      completed: true,
      highScore: 900,
      completedAt: "2026-08-15T12:00:00.000Z",
    });
  });

  test("merges durable progress without duplication or regression", () => {
    const merged = mergeChronicleProgress(
      {
        ...emptyChronicleProgress,
        recoveredRecords: ["project:tymaura"],
        completedChapters: ["origin"],
        highScore: 800,
      },
      {
        recoveredRecords: [
          "education:first-class-computer-science",
          "project:tymaura",
        ],
        completedChapters: ["secure-engineering", "origin"],
        tutorialCompleted: true,
        completed: true,
        highScore: 500,
        completedAt: "2026-08-15T12:00:00.000Z",
      },
    );

    expect(merged).toEqual({
      version: CHRONICLE_PROGRESS_VERSION,
      recoveredRecords: [
        "education:first-class-computer-science",
        "project:tymaura",
      ],
      completedChapters: ["origin", "secure-engineering"],
      tutorialCompleted: true,
      completed: true,
      highScore: 800,
      completedAt: "2026-08-15T12:00:00.000Z",
    });
    expect(chronicleChapterIds).toHaveLength(5);
  });
});
