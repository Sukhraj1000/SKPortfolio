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
  formatRunTime,
  mergeChronicleProgress,
  parseChronicleProgress,
  resetChronicleStoryProgress,
} from "../../src/components/game/chronicle-story";
import {
  capabilityGroups,
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

    const currentRole = experience.find(
      (entry) => entry.id === "northrop-software-engineer",
    );
    const skillsOnly = [
      "RAG Workflows",
      "Model Context Protocol (MCP)",
      "Loop & Graph Engineering",
      "Agent Evaluations",
    ];
    const roleEvidence = [
      currentRole?.summary,
      ...(currentRole?.highlights ?? []),
      ...(currentRole?.technologies ?? []),
    ].join(" ");
    const skillsOnlyPatterns = [
      /\bRAG\b/i,
      /Model Context Protocol|\bMCP\b/i,
      /Loop (?:&|and) Graph Engineering/i,
      /Agent Evaluations?/i,
    ];
    for (const pattern of skillsOnlyPatterns) {
      expect(roleEvidence).not.toMatch(pattern);
    }

    const aiSkills = capabilityGroups
      .find((group) => group.id === "ai-automation")
      ?.items.map((item) => item.name);
    expect(aiSkills).toEqual(expect.arrayContaining(skillsOnly));

    const currentRoleRecord = chronicleRecords.find(
      (record) =>
        record.kind === "experience" &&
        record.sourceId === "northrop-software-engineer",
    );
    expect(currentRoleRecord?.summary).toBe(currentRole?.summary);
    expect(currentRoleRecord?.technologies).toEqual(
      currentRole?.technologies.slice(0, 3),
    );
    for (const pattern of skillsOnlyPatterns) {
      expect(JSON.stringify(currentRoleRecord)).not.toMatch(pattern);
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
        bestTimeMs: 123_456.7,
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
      bestTimeMs: 123_456,
    });
  });

  test("fails open for malformed and legacy progress", () => {
    expect(parseChronicleProgress("{broken-json")).toEqual(
      emptyChronicleProgress,
    );
    expect(parseChronicleProgress(null)).toEqual(emptyChronicleProgress);
    expect(
      parseChronicleProgress({
        ...emptyChronicleProgress,
        bestTimeMs: Number.POSITIVE_INFINITY,
      }).bestTimeMs,
    ).toBeNull();
    expect(
      parseChronicleProgress({
        ...emptyChronicleProgress,
        bestTimeMs: -1,
      }).bestTimeMs,
    ).toBeNull();

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
      bestTimeMs: null,
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
        bestTimeMs: 78_000,
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
        bestTimeMs: 92_000,
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
      bestTimeMs: 78_000,
      completedAt: "2026-08-15T12:00:00.000Z",
    });
    expect(
      mergeChronicleProgress(merged, { bestTimeMs: 70_250 }).bestTimeMs,
    ).toBe(70_250);
    expect(
      mergeChronicleProgress(merged, { bestTimeMs: Number.NaN }).bestTimeMs,
    ).toBe(78_000);
    expect(resetChronicleStoryProgress(merged)).toEqual({
      ...merged,
      recoveredRecords: [],
    });
    expect(formatRunTime(0)).toBe("0:00.0");
    expect(formatRunTime(70_250)).toBe("1:10.2");
    expect(formatRunTime(null)).toBe("—");
    expect(chronicleChapterIds).toHaveLength(5);
  });
});
