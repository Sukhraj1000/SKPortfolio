import type { ChronicleRecordId } from "@/components/game/chronicle-story";

export type GameZoneId =
  | "onboarding"
  | "mission-archive"
  | "field-log"
  | "loadout"
  | "comms";

export type SignalCoreId = Exclude<GameZoneId, "onboarding">;

export type GamePanelId =
  | "briefing"
  | "project:tymaura"
  | "project:skaltek"
  | "project:solana-contract-generator"
  | "project:crypto-portfolio"
  | "field-log"
  | "loadout"
  | "comms"
  | "uplink";

export type ChroniclePlayerState =
  | "grounded"
  | "jumping"
  | "falling"
  | "dashing";

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

export type GameAction = "jump" | "dash" | "drop";

export interface GameControlsState {
  jump: boolean;
  dash: boolean;
  drop: boolean;
}

export interface GameSnapshot {
  zone: GameZoneId;
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
  cores: readonly SignalCoreId[];
  discovered: readonly GamePanelId[];
  checkpoints: readonly GameZoneId[];
  nearbyLabel: string | null;
  completed: boolean;
}

export interface SavedGameProgress {
  completed: boolean;
  highScore: number;
  discovered: readonly GamePanelId[];
  checkpoints: readonly GameZoneId[];
  completedAt?: string;
}

export interface SignalGameCallbacks {
  onSnapshot: (snapshot: GameSnapshot) => void;
  onOpenPanel: (panelId: GamePanelId) => void;
  onUnlock: (recordId: ChronicleRecordId) => void;
  onNotice: (message: string, tone?: "info" | "success" | "warning") => void;
}

export interface SignalGameHandle {
  destroy: () => void;
  setPaused: (paused: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  completeTutorialAction: (action: "pause" | "story-log") => void;
  restart: () => void;
  refreshTheme: () => void;
}

export const initialGameSnapshot: GameSnapshot = {
  zone: "onboarding",
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
  cores: [],
  discovered: [],
  checkpoints: [],
  nearbyLabel: null,
  completed: false,
};
