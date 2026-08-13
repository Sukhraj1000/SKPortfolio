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

export type GameAction = "left" | "right" | "jump" | "interact";

export interface GameControlsState {
  left: boolean;
  right: boolean;
  jump: boolean;
  interact: boolean;
}

export interface GameSnapshot {
  zone: GameZoneId;
  zoneLabel: string;
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
  restart: () => void;
  refreshTheme: () => void;
}

export const initialGameSnapshot: GameSnapshot = {
  zone: "onboarding",
  zoneLabel: "Onboarding Bay",
  score: 0,
  multiplier: 1,
  signal: 100,
  cores: [],
  discovered: [],
  checkpoints: [],
  nearbyLabel: null,
  completed: false,
};
