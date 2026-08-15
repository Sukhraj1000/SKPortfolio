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
  onNotice: (message: string, tone?: "info" | "success" | "warning") => void;
}

export interface SignalGameHandle {
  destroy: () => void;
  setPaused: (paused: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
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
  score: 0,
  multiplier: 1,
  signal: 100,
  cores: [],
  discovered: [],
  checkpoints: [],
  nearbyLabel: null,
  completed: false,
};
