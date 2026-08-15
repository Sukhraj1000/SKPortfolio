import type {
  ChronicleChapterId,
  ChronicleRecordId,
  ChronicleTutorialStepId,
} from "@/components/game/chronicle-story";

export type ChroniclePlayerState =
  | "grounded"
  | "jumping"
  | "falling"
  | "dashing";

export type GameAction = "jump" | "dash" | "drop";

export interface GameControlsState {
  jump: boolean;
  dash: boolean;
  drop: boolean;
}

export interface GameSnapshot {
  zone: ChronicleChapterId;
  zoneLabel: string;
  chapterIndex: number;
  journeyProgress: number;
  playerState: ChroniclePlayerState;
  dashReady: boolean;
  tutorialStep: ChronicleTutorialStepId;
  tutorialCompleted: boolean;
  recoveredRecords: readonly ChronicleRecordId[];
  latestUnlockId: ChronicleRecordId | null;
  score: number;
  multiplier: number;
  signal: number;
  checkpoints: readonly ChronicleChapterId[];
  completed: boolean;
}

export interface ChronicleGameCallbacks {
  onSnapshot: (snapshot: GameSnapshot) => void;
  onUnlock: (recordId: ChronicleRecordId) => void;
  onNotice: (message: string, tone?: "info" | "success" | "warning") => void;
}

export interface ChronicleGameHandle {
  destroy: () => void;
  setPaused: (paused: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  completeTutorialAction: (action: "pause" | "story-log") => void;
  restart: () => void;
  refreshTheme: () => void;
}

export const initialGameSnapshot: GameSnapshot = {
  zone: "origin",
  zoneLabel: "Origin",
  chapterIndex: 0,
  journeyProgress: 0,
  playerState: "grounded",
  dashReady: true,
  tutorialStep: "auto-run",
  tutorialCompleted: false,
  recoveredRecords: [],
  latestUnlockId: null,
  score: 0,
  multiplier: 1,
  signal: 100,
  checkpoints: [],
  completed: false,
};
