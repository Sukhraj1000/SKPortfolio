"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  Gamepad2,
  LogOut,
  Pause,
  Play,
  RadioTower,
  RotateCcw,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { GameCanvas } from "@/components/game/GameCanvas";
import { chronicleChapters } from "@/components/game/chronicle-story";
import { SignalPanel } from "@/components/game/SignalPanel";
import {
  initialGameSnapshot,
  type GameAction,
  type GameControlsState,
  type GamePanelId,
  type GameSnapshot,
  type SavedGameProgress,
  type SignalGameHandle,
} from "@/components/game/game-types";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { SystemLabel } from "@/components/ui/system-label";
import { gameProgressKey, gameSoundKey } from "@/lib/game-mode";
import { cn } from "@/lib/utils";
import styles from "./GameExperience.module.css";

type SpawnPhase = "dropping" | "landed";
type NoticeTone = "info" | "success" | "warning";

interface GameExperienceProps {
  onExit: () => void;
}

interface HudButtonProps extends React.ComponentProps<"button"> {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

const emptyProgress: SavedGameProgress = {
  completed: false,
  highScore: 0,
  discovered: [],
  checkpoints: [],
};

function readSavedProgress(): SavedGameProgress {
  if (typeof window === "undefined") return emptyProgress;
  try {
    const value = JSON.parse(window.localStorage.getItem(gameProgressKey) ?? "null") as Partial<SavedGameProgress> | null;
    return {
      completed: value?.completed === true,
      highScore: typeof value?.highScore === "number" ? value.highScore : 0,
      discovered: Array.isArray(value?.discovered) ? value.discovered : [],
      checkpoints: Array.isArray(value?.checkpoints) ? value.checkpoints : [],
      completedAt: typeof value?.completedAt === "string" ? value.completedAt : undefined,
    };
  } catch {
    return emptyProgress;
  }
}

function HudButton({
  label,
  icon,
  active = false,
  className,
  ...props
}: HudButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "grid h-11 min-w-11 place-items-center border px-2.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40 sm:px-3",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border-strong bg-surface text-foreground hover:bg-surface-raised hover:text-primary",
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
}

function TouchButton({
  action,
  label,
  icon,
  controls,
}: {
  action: GameAction;
  label: string;
  icon: React.ReactNode;
  controls: React.MutableRefObject<GameControlsState>;
}) {
  const release = () => {
    controls.current[action] = false;
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={styles.touchButton}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        controls.current[action] = true;
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
    >
      {icon}
    </button>
  );
}

export function GameExperience({ onExit }: GameExperienceProps) {
  const controlsRef = React.useRef<GameControlsState>({
    jump: false,
    dash: false,
    drop: false,
  });
  const gameHandleRef = React.useRef<SignalGameHandle | null>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const noticeTimerRef = React.useRef<number | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const shouldPauseRef = React.useRef(true);
  const reducedMotionRef = React.useRef(false);
  const [spawnCycle, setSpawnCycle] = React.useState(0);
  const [spawnPhase, setSpawnPhase] = React.useState<SpawnPhase>("dropping");
  const [paused, setPaused] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(false);
  const [snapshot, setSnapshot] = React.useState<GameSnapshot>(initialGameSnapshot);
  const [panelId, setPanelId] = React.useState<GamePanelId | null>(null);
  const [savedProgress, setSavedProgress] = React.useState<SavedGameProgress>(emptyProgress);
  const [notice, setNotice] = React.useState<{
    message: string;
    tone: NoticeTone;
  } | null>(null);

  React.useEffect(() => {
    setSavedProgress(readSavedProgress());
    try {
      setSoundEnabled(window.localStorage.getItem(gameSoundKey) === "on");
    } catch {
      setSoundEnabled(false);
    }
  }, []);

  const playTone = React.useCallback(
    (tone: NoticeTone) => {
      if (!soundEnabled) return;
      try {
        const AudioContextConstructor = window.AudioContext;
        const context = audioContextRef.current ?? new AudioContextConstructor();
        audioContextRef.current = context;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "square";
        oscillator.frequency.value = tone === "success" ? 660 : tone === "warning" ? 180 : 360;
        gain.gain.setValueAtTime(0.035, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.12);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.13);
      } catch {
        // Visual feedback remains complete if Web Audio is unavailable.
      }
    },
    [soundEnabled],
  );

  const showNotice = React.useCallback(
    (message: string, tone: NoticeTone = "info") => {
      setNotice({ message, tone });
      playTone(tone);
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
      noticeTimerRef.current = window.setTimeout(() => setNotice(null), 3200);
    },
    [playTone],
  );

  React.useEffect(() => {
    return () => {
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
      void audioContextRef.current?.close();
    };
  }, []);

  React.useEffect(() => {
    setSpawnPhase("dropping");
    setPaused(false);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSpawnPhase("landed");
      return;
    }

    const landingTimer = window.setTimeout(() => setSpawnPhase("landed"), 760);
    return () => window.clearTimeout(landingTimer);
  }, [spawnCycle]);

  React.useEffect(() => {
    const shouldPause = paused || panelId !== null || spawnPhase === "dropping";
    shouldPauseRef.current = shouldPause;
    gameHandleRef.current?.setPaused(shouldPause);
    if (shouldPause) {
      controlsRef.current = { jump: false, dash: false, drop: false };
    }
  }, [panelId, paused, spawnPhase]);

  React.useEffect(() => {
    const nextProgress: SavedGameProgress = {
      completed: savedProgress.completed || snapshot.completed,
      highScore: Math.max(savedProgress.highScore, snapshot.score),
      discovered: [...new Set([...savedProgress.discovered, ...snapshot.discovered])],
      checkpoints: [...new Set([...savedProgress.checkpoints, ...snapshot.checkpoints])],
      completedAt:
        snapshot.completed && !savedProgress.completedAt
          ? new Date().toISOString()
          : savedProgress.completedAt,
    };

    const changed =
      nextProgress.completed !== savedProgress.completed ||
      nextProgress.highScore !== savedProgress.highScore ||
      nextProgress.completedAt !== savedProgress.completedAt ||
      nextProgress.discovered.length !== savedProgress.discovered.length ||
      nextProgress.checkpoints.length !== savedProgress.checkpoints.length;

    if (!changed) return;
    setSavedProgress(nextProgress);
    try {
      window.localStorage.setItem(gameProgressKey, JSON.stringify(nextProgress));
    } catch {
      // The level remains fully playable when local persistence is blocked.
    }
  }, [savedProgress, snapshot]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      event.preventDefault();
      if (panelId) {
        setPanelId(null);
        setPaused(false);
        window.setTimeout(() => stageRef.current?.focus(), 0);
      } else {
        onExit();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") setPaused(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [onExit, panelId]);

  React.useEffect(() => {
    const observer = new MutationObserver(() => gameHandleRef.current?.refreshTheme());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => {
      reducedMotionRef.current = motionQuery.matches;
      gameHandleRef.current?.setReducedMotion(motionQuery.matches);
    };
    syncMotion();
    motionQuery.addEventListener("change", syncMotion);
    return () => motionQuery.removeEventListener("change", syncMotion);
  }, []);

  const setGameHandle = React.useCallback((handle: SignalGameHandle | null) => {
    gameHandleRef.current = handle;
    if (handle) {
      handle.setReducedMotion(reducedMotionRef.current);
      handle.setPaused(shouldPauseRef.current);
    }
  }, []);

  const callbacks = React.useMemo(
    () => ({
      onSnapshot: setSnapshot,
      onOpenPanel: (nextPanelId: GamePanelId) => {
        setPanelId(nextPanelId);
        setPaused(true);
      },
      onNotice: showNotice,
    }),
    [showNotice],
  );

  const toggleSound = () => {
    const nextSoundState = !soundEnabled;
    setSoundEnabled(nextSoundState);
    try {
      window.localStorage.setItem(gameSoundKey, nextSoundState ? "on" : "off");
    } catch {
      // Sound remains usable for this session when storage is blocked.
    }
  };

  const restartLevel = () => {
    setPanelId(null);
    setPaused(false);
    setSnapshot(initialGameSnapshot);
    setSpawnCycle((cycle) => cycle + 1);
    gameHandleRef.current?.restart();
    showNotice("Transient level state reset. High score preserved.", "info");
  };

  const closePanel = () => {
    setPanelId(null);
    setPaused(false);
    window.setTimeout(() => stageRef.current?.focus(), 0);
  };

  const gameStatus =
    spawnPhase === "dropping"
      ? "Deploying"
      : panelId
        ? "Story"
        : paused
          ? "Paused"
          : snapshot.completed
            ? "Complete"
            : "Running";
  const activeChapter =
    chronicleChapters[snapshot.chapterIndex] ?? chronicleChapters[0];
  const journeyProgress = snapshot.journeyProgress;

  return (
    <section
      aria-labelledby="game-runtime-title"
      data-game-state={gameStatus.toLowerCase()}
      data-chronicle-chapter={activeChapter.id}
      data-journey-progress={journeyProgress}
      data-player-state={snapshot.playerState}
      data-dash-ready={snapshot.dashReady}
      className="min-h-[100svh] bg-background pt-16"
    >
      <h1 id="game-runtime-title" className="sr-only">
        Chronicle Run playable story
      </h1>

      <div className={styles.hudBar}>
        <div className="mx-auto flex max-w-[96rem] flex-wrap items-center justify-between gap-2.5">
          <div className="flex min-w-0 flex-wrap items-center gap-2.5">
            <SystemLabel>{`Chapter ${activeChapter.index} // ${activeChapter.title}`}</SystemLabel>
            <StatusIndicator
              tone={gameStatus === "Paused" || gameStatus === "Story" ? "idle" : gameStatus === "Complete" ? "active" : "info"}
              pulse={gameStatus === "Running"}
            >
              {gameStatus}
            </StatusIndicator>
          </div>

          <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.625rem] uppercase tracking-[0.08em] text-ink-muted sm:text-xs">
            <div><dt className="sr-only">Signal</dt><dd>Signal {snapshot.signal}%</dd></div>
            <div><dt className="sr-only">Story records</dt><dd className="text-primary">Records {snapshot.discovered.length}/9</dd></div>
            <div><dt className="sr-only">Score</dt><dd>Score {snapshot.score.toLocaleString()}</dd></div>
            <div><dt className="sr-only">Momentum</dt><dd>×{snapshot.multiplier.toFixed(2)}</dd></div>
            <div className="hidden md:block"><dt className="sr-only">High score</dt><dd>High {savedProgress.highScore.toLocaleString()}</dd></div>
          </dl>

          <div role="group" aria-label="Game controls" className="flex items-center gap-1.5">
            <HudButton
              label="Start or resume"
              icon={<Play aria-hidden="true" className="h-4 w-4" />}
              active={spawnPhase === "landed" && !paused && !panelId}
              disabled={spawnPhase === "dropping" || (!paused && !panelId)}
              onClick={() => {
                setPanelId(null);
                setPaused(false);
              }}
            />
            <HudButton
              label="Pause"
              icon={<Pause aria-hidden="true" className="h-4 w-4" />}
              active={paused && !panelId}
              disabled={spawnPhase === "dropping" || paused || panelId !== null}
              onClick={() => setPaused(true)}
            />
            <HudButton
              label={soundEnabled ? "Mute sound" : "Enable sound"}
              icon={soundEnabled ? <Volume2 aria-hidden="true" className="h-4 w-4" /> : <VolumeX aria-hidden="true" className="h-4 w-4" />}
              active={soundEnabled}
              onClick={toggleSound}
            />
            <HudButton
              label="Restart level"
              icon={<RotateCcw aria-hidden="true" className="h-4 w-4" />}
              onClick={restartLevel}
            />
            <HudButton
              label="Exit to Portfolio"
              icon={<LogOut aria-hidden="true" className="h-4 w-4" />}
              className="border-signal-red text-signal-red hover:bg-signal-red hover:text-white"
              onClick={onExit}
            />
          </div>
        </div>
        <div className={styles.journeyMeter} aria-label={`Journey progress: ${journeyProgress} percent`}>
          <span style={{ width: `${journeyProgress}%` }} />
        </div>
      </div>

      <ol className={styles.chapterRail} aria-label="Chronicle chapters">
        {chronicleChapters.map((chapter, index) => (
          <li
            key={chapter.id}
            data-chapter-state={
              index < snapshot.chapterIndex
                ? "complete"
                : index === snapshot.chapterIndex
                  ? "active"
                  : "ahead"
            }
          >
            <span>{chapter.index}</span>
            <strong>{chapter.title}</strong>
          </li>
        ))}
      </ol>

      <div ref={stageRef} className={styles.stage} tabIndex={-1}>
        <GameCanvas controls={controlsRef} callbacks={callbacks} onReady={setGameHandle} />
        <div className={styles.scanlines} aria-hidden="true" />

        {spawnPhase === "dropping" ? (
          <div className={styles.spawnOverlay} aria-hidden="true">
            <div key={`hatch-${spawnCycle}`} className={styles.hatch}>
              <span className={styles.hatchLeft} />
              <span className={styles.hatchRight} />
            </div>
            <div key={`operator-${spawnCycle}`} className={cn(styles.operator, styles.operatorDropping)} />
          </div>
        ) : null}

        {notice ? (
          <div className={cn(styles.notice, styles[`notice${notice.tone[0].toUpperCase()}${notice.tone.slice(1)}`])} role="status" aria-live="polite">
            <RadioTower aria-hidden="true" className="h-4 w-4 shrink-0" />
            {notice.message}
          </div>
        ) : null}

        {snapshot.nearbyLabel && !panelId && !paused && spawnPhase === "landed" ? (
          <div className={styles.interactionPrompt} role="status">
            <span className="border border-primary bg-primary px-2 py-1 font-mono text-[0.625rem] font-bold text-primary-foreground">E</span>
            <span>{snapshot.nearbyLabel}</span>
          </div>
        ) : null}

        {paused && !panelId ? (
          <div className={styles.pauseOverlay} role="status">
            <Pause aria-hidden="true" className="h-7 w-7 text-primary" />
            <p className="mt-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-foreground">Simulation paused</p>
            <button
              type="button"
              className="mt-4 border border-primary bg-primary px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.08em] text-primary-foreground"
              onClick={() => setPaused(false)}
            >
              Resume
            </button>
          </div>
        ) : null}

        <div className={styles.touchControls} aria-label="Touch game controls">
          <TouchButton
            action="jump"
            label="Jump"
            icon={<ArrowUp aria-hidden="true" />}
            controls={controlsRef}
          />
          <TouchButton
            action="dash"
            label="Dash"
            icon={<Zap aria-hidden="true" />}
            controls={controlsRef}
          />
          <TouchButton
            action="drop"
            label="Fast drop"
            icon={<ArrowDown aria-hidden="true" />}
            controls={controlsRef}
          />
        </div>

        {panelId ? (
          <SignalPanel panelId={panelId} snapshot={snapshot} onClose={closePanel} onExit={onExit} />
        ) : null}
      </div>

      <div className={styles.gameFooter}>
        <p className="flex items-center gap-2 font-mono uppercase tracking-[0.08em]">
          <Gamepad2 aria-hidden="true" className="h-4 w-4 text-primary" />
          Auto-run active · Space jumps · Shift dashes · S drops
        </p>
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.08em]">Pause or Escape exits safely</p>
      </div>
    </section>
  );
}
