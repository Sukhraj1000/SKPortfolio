import {
  experience,
  portfolioProfile,
  portfolioProjects,
} from "@/data/portfolio";

export const chronicleChapterIds = [
  "origin",
  "live-systems",
  "secure-engineering",
  "build-lab",
  "present-day",
] as const;

export type ChronicleChapterId = (typeof chronicleChapterIds)[number];

export const chronicleRecordIds = [
  "education:first-class-computer-science",
  "experience:techfront-led-technician",
  "experience:northrop-intern",
  "project:crypto-portfolio",
  "project:solana-contract-generator",
  "project:tymaura",
  "project:skaltek",
  "experience:endeavour-data",
  "experience:northrop-software-engineer",
] as const;

export type ChronicleRecordId = (typeof chronicleRecordIds)[number];
export type ChronicleRecordKind = "education" | "experience" | "project";

export type ChronicleTutorialStepId =
  | "auto-run"
  | "jump"
  | "dash"
  | "drop"
  | "route"
  | "pickup"
  | "pause"
  | "story-log"
  | "complete";

export interface ChronicleChapter {
  id: ChronicleChapterId;
  index: string;
  title: string;
  summary: string;
  tone: "cyan" | "amber" | "coral" | "green";
}

export interface ChronicleRecord {
  id: ChronicleRecordId;
  chapterId: ChronicleChapterId;
  kind: ChronicleRecordKind;
  title: string;
  context: string;
  period: string;
  summary: string;
  technologies: readonly string[];
  sourceId: string;
}

export interface ChronicleTutorialStep {
  id: ChronicleTutorialStepId;
  keyLabel: string;
  title: string;
  instruction: string;
}

export interface ChronicleProgress {
  version: typeof CHRONICLE_PROGRESS_VERSION;
  recoveredRecords: ChronicleRecordId[];
  completedChapters: ChronicleChapterId[];
  tutorialCompleted: boolean;
  completed: boolean;
  highScore: number;
  completedAt?: string;
}

export const CHRONICLE_PROGRESS_VERSION = 1 as const;

export const chronicleTutorialSteps: readonly ChronicleTutorialStep[] = [
  {
    id: "auto-run",
    keyLabel: "Forward",
    title: "The route moves with you",
    instruction: "No direction key is needed. Read the next obstacle.",
  },
  {
    id: "jump",
    keyLabel: "Space / ↑",
    title: "Jump the route marker",
    instruction: "Press once; a short input buffer protects close timing.",
  },
  {
    id: "dash",
    keyLabel: "Shift / D",
    title: "Dash through a timing gate",
    instruction: "Dash adds speed briefly, then enters a visible cooldown.",
  },
  {
    id: "drop",
    keyLabel: "S / ↓",
    title: "Fast-drop back to the line",
    instruction: "Jump, then drop while airborne to land sooner.",
  },
  {
    id: "route",
    keyLabel: "High route",
    title: "Choose the optional upper line",
    instruction: "Jump onto the raised route; the lower route remains safe.",
  },
  {
    id: "pickup",
    keyLabel: "Story node",
    title: "Recover the route pickup",
    instruction: "Cross the glowing node on the upper line.",
  },
  {
    id: "pause",
    keyLabel: "P / HUD",
    title: "Pause whenever you need",
    instruction: "Use Pause now; movement and hazards stop completely.",
  },
  {
    id: "story-log",
    keyLabel: "L / HUD",
    title: "Open the Story Log",
    instruction: "Recovered records stay available in a pause-safe log.",
  },
  {
    id: "complete",
    keyLabel: "Ready",
    title: "Walkthrough complete",
    instruction: "Normal scoring and route challenges are now active.",
  },
] as const;

export const chronicleChapters: readonly ChronicleChapter[] = [
  {
    id: "origin",
    index: "00",
    title: "Origin",
    summary: "Computer Science foundations and the decision to build useful systems.",
    tone: "cyan",
  },
  {
    id: "live-systems",
    index: "01",
    title: "Live Systems",
    summary: "Hands-on delivery where hardware, timing, and reliability were visible immediately.",
    tone: "amber",
  },
  {
    id: "secure-engineering",
    index: "02",
    title: "Secure Engineering",
    summary: "Professional software delivery inside a regulated engineering environment.",
    tone: "cyan",
  },
  {
    id: "build-lab",
    index: "03",
    title: "Build Lab",
    summary: "Independent products across mobile, blockchain, events, and AI automation.",
    tone: "coral",
  },
  {
    id: "present-day",
    index: "04",
    title: "Present Day",
    summary: "Current engineering and operational work, with the next chapter still open.",
    tone: "green",
  },
] as const;

function requireExperience(id: string) {
  const entry = experience.find((candidate) => candidate.id === id);
  if (!entry) throw new Error(`Missing canonical experience record: ${id}`);
  return entry;
}

function requireProject(id: string) {
  const project = portfolioProjects.find((candidate) => candidate.id === id);
  if (!project) throw new Error(`Missing canonical project record: ${id}`);
  return project;
}

function experienceRecord(
  sourceId: string,
  id: ChronicleRecordId,
  chapterId: ChronicleChapterId,
): ChronicleRecord {
  const entry = requireExperience(sourceId);
  return {
    id,
    chapterId,
    kind: "experience",
    title: entry.role,
    context: entry.organisation,
    period: `${entry.start} — ${entry.end}`,
    summary: entry.summary,
    technologies: entry.technologies.slice(0, 3),
    sourceId,
  };
}

function projectRecord(
  sourceId: string,
  id: ChronicleRecordId,
): ChronicleRecord {
  const project = requireProject(sourceId);
  return {
    id,
    chapterId: "build-lab",
    kind: "project",
    title: project.title,
    context: project.kind,
    period: project.grade
      ? `${project.status} · ${project.grade}`
      : project.status,
    summary: project.summary,
    technologies: project.technologies.slice(0, 3),
    sourceId,
  };
}

const finalYearProject = requireProject("solana-contract-generator");

export const chronicleRecords: readonly ChronicleRecord[] = [
  {
    id: "education:first-class-computer-science",
    chapterId: "origin",
    kind: "education",
    title: portfolioProfile.education,
    context: "Computer Science",
    period: `${finalYearProject.status} · ${finalYearProject.grade}`,
    summary: finalYearProject.summary,
    technologies: finalYearProject.technologies.slice(0, 3),
    sourceId: finalYearProject.id,
  },
  experienceRecord(
    "techfront-led-technician",
    "experience:techfront-led-technician",
    "live-systems",
  ),
  experienceRecord(
    "northrop-intern",
    "experience:northrop-intern",
    "secure-engineering",
  ),
  projectRecord("crypto-portfolio", "project:crypto-portfolio"),
  projectRecord(
    "solana-contract-generator",
    "project:solana-contract-generator",
  ),
  projectRecord("tymaura", "project:tymaura"),
  projectRecord("skaltek", "project:skaltek"),
  experienceRecord(
    "endeavour-data",
    "experience:endeavour-data",
    "present-day",
  ),
  experienceRecord(
    "northrop-software-engineer",
    "experience:northrop-software-engineer",
    "present-day",
  ),
] as const;

const recordById = new Map(
  chronicleRecords.map((record) => [record.id, record] as const),
);
const recordIdSet = new Set<string>(chronicleRecordIds);
const chapterIdSet = new Set<string>(chronicleChapterIds);

export function getChronicleRecord(id: ChronicleRecordId) {
  const record = recordById.get(id);
  if (!record) throw new Error(`Missing Chronicle record: ${id}`);
  return record;
}

export function isChronicleRecordId(value: unknown): value is ChronicleRecordId {
  return typeof value === "string" && recordIdSet.has(value);
}

export function isChronicleChapterId(
  value: unknown,
): value is ChronicleChapterId {
  return typeof value === "string" && chapterIdSet.has(value);
}

export const emptyChronicleProgress: ChronicleProgress = {
  version: CHRONICLE_PROGRESS_VERSION,
  recoveredRecords: [],
  completedChapters: [],
  tutorialCompleted: false,
  completed: false,
  highScore: 0,
};

function orderedUnique<T extends string>(
  values: unknown,
  order: readonly T[],
  isValid: (value: unknown) => value is T,
) {
  if (!Array.isArray(values)) return [];
  const present = new Set(values.filter(isValid));
  return order.filter((value) => present.has(value));
}

function finiteNonNegativeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : 0;
}

export function parseChronicleProgress(value: unknown): ChronicleProgress {
  let candidate: unknown = value;
  if (typeof value === "string") {
    try {
      candidate = JSON.parse(value);
    } catch {
      return { ...emptyChronicleProgress };
    }
  }

  if (!candidate || typeof candidate !== "object") {
    return { ...emptyChronicleProgress };
  }

  const stored = candidate as Record<string, unknown>;
  const isCurrentVersion = stored.version === CHRONICLE_PROGRESS_VERSION;
  const completedAt =
    typeof stored.completedAt === "string" && stored.completedAt.trim()
      ? stored.completedAt
      : undefined;

  return {
    version: CHRONICLE_PROGRESS_VERSION,
    recoveredRecords: isCurrentVersion
      ? orderedUnique(
          stored.recoveredRecords,
          chronicleRecordIds,
          isChronicleRecordId,
        )
      : [],
    completedChapters: isCurrentVersion
      ? orderedUnique(
          stored.completedChapters,
          chronicleChapterIds,
          isChronicleChapterId,
        )
      : [],
    tutorialCompleted:
      isCurrentVersion && stored.tutorialCompleted === true,
    completed: stored.completed === true,
    highScore: finiteNonNegativeNumber(stored.highScore),
    ...(completedAt ? { completedAt } : {}),
  };
}

export function mergeChronicleProgress(
  current: ChronicleProgress,
  update: Partial<Omit<ChronicleProgress, "version">>,
): ChronicleProgress {
  const completed = current.completed || update.completed === true;
  const completedAt = current.completedAt ?? update.completedAt;

  return {
    version: CHRONICLE_PROGRESS_VERSION,
    recoveredRecords: orderedUnique(
      [...current.recoveredRecords, ...(update.recoveredRecords ?? [])],
      chronicleRecordIds,
      isChronicleRecordId,
    ),
    completedChapters: orderedUnique(
      [...current.completedChapters, ...(update.completedChapters ?? [])],
      chronicleChapterIds,
      isChronicleChapterId,
    ),
    tutorialCompleted:
      current.tutorialCompleted || update.tutorialCompleted === true,
    completed,
    highScore: Math.max(
      current.highScore,
      finiteNonNegativeNumber(update.highScore),
    ),
    ...(completedAt ? { completedAt } : {}),
  };
}
