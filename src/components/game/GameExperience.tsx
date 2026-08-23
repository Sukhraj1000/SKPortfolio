"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
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
import {
  chronicleChapterIds,
  chronicleChapters,
  chronicleTutorialSteps,
  formatRunTime,
  mergeChronicleProgress,
  resetChronicleStoryProgress,
  type ChronicleProgress,
} from "@/components/game/chronicle-story";
import { StoryLogDialog } from "@/components/game/StoryLogDialog";
import { StoryUnlockCard } from "@/components/game/StoryUnlockCard";
import {
  initialGameSnapshot,
  type ChronicleGameHandle,
  type GameAction,
  type GameControlsState,
  type GameSnapshot,
} from "@/components/game/game-types";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { SystemLabel } from "@/components/ui/system-label";
import { gameProgressKey, gameSoundKey } from "@/lib/game-mode";
import { cn } from "@/lib/utils";
import styles from "./GameExperience.module.css";

type SpawnPhase = "dropping" | "landed";
type NoticeTone = "info" | "success" | "warning";
type StoryOverlay = "story-log" | "complete";

const interactiveSelector =
  "button, a[href], input, textarea, select, summary, [contenteditable]:not([contenteditable='false']), [role='button'], [role='link']";
const gameKeyCodes = new Set([
  "Space",
  "ArrowUp",
  "ShiftLeft",
  "ShiftRight",
  "KeyD",
  "KeyS",
  "ArrowDown",
  "KeyP",
  "KeyL",
  "KeyR",
  "KeyM",
]);

function isInteractiveKeyboardTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && target.matches(interactiveSelector);
}

interface GameExperienceProps {
  onExit: () => void;
  initialProgress: ChronicleProgress;
}

interface HudButtonProps extends React.ComponentProps<"button"> {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

function HudButton({ label, icon, active = false, className, ...props }: HudButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "grid h-[44px] min-w-[44px] place-items-center border px-[10px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 sm:px-3",
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
  setPressed,
  onPress,
}: {
  action: GameAction;
  label: string;
  icon: React.ReactNode;
  setPressed: (action: GameAction, pressed: boolean) => void;
  onPress?: () => void;
}) {
  const releaseTimerRef = React.useRef<number | null>(null);

  React.useEffect(
    () => () => {
      if (releaseTimerRef.current) window.clearTimeout(releaseTimerRef.current);
      setPressed(action, false);
    },
    [action, setPressed],
  );

  const release = () => {
    if (releaseTimerRef.current) window.clearTimeout(releaseTimerRef.current);
    releaseTimerRef.current = window.setTimeout(() => {
      setPressed(action, false);
      releaseTimerRef.current = null;
    }, 50);
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={styles.touchButton}
      onPointerDown={(event) => {
        event.preventDefault();
        if (releaseTimerRef.current) {
          window.clearTimeout(releaseTimerRef.current);
          releaseTimerRef.current = null;
        }
        setPressed(action, true);
        onPress?.();
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // Some touch browsers reject capture for released or synthetic pointers.
        }
      }}
      onClick={(event) => {
        if (event.detail !== 0) return;
        setPressed(action, true);
        onPress?.();
        release();
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
    >
      {icon}
    </button>
  );
}

export function GameExperience({ onExit, initialProgress }: GameExperienceProps) {
  const controlsRef = React.useRef<GameControlsState>({
    jump: false,
    dash: false,
    drop: false,
  });
  const gameHandleRef = React.useRef<ChronicleGameHandle | null>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const noticeTimerRef = React.useRef<number | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const shouldPauseRef = React.useRef(true);
  const reducedMotionRef = React.useRef(false);
  const runtimeReadyRef = React.useRef(false);
  const snapshotRef = React.useRef<GameSnapshot>(initialGameSnapshot);
  const queuedTutorialActionRef = React.useRef<GameAction | null>(null);
  const [spawnCycle, setSpawnCycle] = React.useState(0);
  const [spawnPhase, setSpawnPhase] = React.useState<SpawnPhase>("dropping");
  const [runtimeReady, setRuntimeReady] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const [tutorialPauseArmed, setTutorialPauseArmed] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(false);
  const [reducedMotionActive, setReducedMotionActive] = React.useState(false);
  const [snapshot, setSnapshot] = React.useState<GameSnapshot>(initialGameSnapshot);
  const [storyOverlay, setStoryOverlay] = React.useState<StoryOverlay | null>(null);
  const overlayTriggerRef = React.useRef<HTMLElement | null>(null);
  const completionShownRef = React.useRef(false);
  const [activeUnlockId, setActiveUnlockId] = React.useState<GameSnapshot["latestUnlockId"]>(null);
  const [savedProgress, setSavedProgress] = React.useState<ChronicleProgress>(initialProgress);
  const [notice, setNotice] = React.useState<{
    message: string;
    tone: NoticeTone;
  } | null>(null);

  React.useEffect(() => {
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

  const resetSavedStories = React.useCallback(() => {
    setSavedProgress((current) => {
      const nextProgress = resetChronicleStoryProgress(current);
      try {
        window.localStorage.setItem(gameProgressKey, JSON.stringify(nextProgress));
      } catch {
        // Restart still clears the active run when persistence is blocked.
      }
      return nextProgress;
    });
  }, []);

  const setControlPressed = React.useCallback((action: GameAction, pressed: boolean) => {
    controlsRef.current[action] = pressed;
  }, []);

  const performTutorialAction = React.useCallback((action: GameAction) => {
    if (!runtimeReadyRef.current || !gameHandleRef.current) {
      if (snapshotRef.current.tutorialStep === action) {
        queuedTutorialActionRef.current = action;
      }
      return;
    }
    gameHandleRef.current.performTutorialAction(action);
  }, []);

  const restartLevel = React.useCallback(() => {
    const gameHandle = gameHandleRef.current;
    if (!runtimeReadyRef.current || !gameHandle) return;

    setStoryOverlay(null);
    setTutorialPauseArmed(false);
    completionShownRef.current = false;
    setPaused(false);
    setSnapshot(initialGameSnapshot);
    setActiveUnlockId(null);
    resetSavedStories();
    setSpawnCycle((cycle) => cycle + 1);
    gameHandle.restart();
    showNotice("New story run started. Records reset; best time and high score preserved.", "info");
  }, [resetSavedStories, showNotice]);

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
    const shouldPause = paused || storyOverlay !== null || spawnPhase === "dropping";
    shouldPauseRef.current = shouldPause;
    gameHandleRef.current?.setPaused(shouldPause);
    if (shouldPause) {
      controlsRef.current = { jump: false, dash: false, drop: false };
    }
  }, [paused, spawnPhase, storyOverlay]);

  React.useEffect(() => {
    const completedChapters = chronicleChapterIds.filter((chapterId) =>
      snapshot.checkpoints.includes(chapterId),
    );
    const nextProgress = mergeChronicleProgress(savedProgress, {
      completed: snapshot.completed,
      completedChapters,
      recoveredRecords: [...snapshot.recoveredRecords],
      tutorialCompleted: snapshot.tutorialCompleted,
      highScore: snapshot.completed ? snapshot.score : savedProgress.highScore,
      bestTimeMs: snapshot.completed ? snapshot.elapsedMs : savedProgress.bestTimeMs,
      completedAt:
        snapshot.completed && !savedProgress.completedAt
          ? new Date().toISOString()
          : savedProgress.completedAt,
    });

    const changed =
      nextProgress.completed !== savedProgress.completed ||
      nextProgress.highScore !== savedProgress.highScore ||
      nextProgress.bestTimeMs !== savedProgress.bestTimeMs ||
      nextProgress.completedAt !== savedProgress.completedAt ||
      nextProgress.tutorialCompleted !== savedProgress.tutorialCompleted ||
      nextProgress.recoveredRecords.join("|") !== savedProgress.recoveredRecords.join("|") ||
      nextProgress.completedChapters.join("|") !== savedProgress.completedChapters.join("|");

    if (!changed) return;
    setSavedProgress(nextProgress);
    try {
      window.localStorage.setItem(gameProgressKey, JSON.stringify(nextProgress));
    } catch {
      // The level remains fully playable when local persistence is blocked.
    }
  }, [savedProgress, snapshot]);

  React.useEffect(() => {
    if (snapshot.completed && !completionShownRef.current) {
      completionShownRef.current = true;
      overlayTriggerRef.current = stageRef.current;
      setPaused(true);
      setStoryOverlay("complete");
    }
  }, [snapshot.completed]);

  React.useEffect(() => {
    const preserveInteractiveKey = (event: KeyboardEvent) => {
      if (
        event.key !== "Escape" &&
        gameKeyCodes.has(event.code) &&
        isInteractiveKeyboardTarget(event.target)
      ) {
        event.stopPropagation();
      }
    };

    window.addEventListener("keydown", preserveInteractiveKey, true);
    window.addEventListener("keyup", preserveInteractiveKey, true);
    return () => {
      window.removeEventListener("keydown", preserveInteractiveKey, true);
      window.removeEventListener("keyup", preserveInteractiveKey, true);
    };
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isInteractiveKeyboardTarget(event.target) && event.key !== "Escape") {
        return;
      }

      const key = event.key.toLowerCase();
      if (event.repeat && ["p", "l", "m", "r"].includes(key)) return;

      const tutorialAction: GameAction | null =
        event.code === "Space" || event.code === "ArrowUp"
          ? "jump"
          : event.code === "ShiftLeft" || event.code === "ShiftRight" || event.code === "KeyD"
            ? "dash"
            : event.code === "KeyS" ||
                event.code === "ArrowDown" ||
                key === "s" ||
                key === "arrowdown"
              ? "drop"
              : null;
      if (!snapshotRef.current.runStarted && !storyOverlay && tutorialAction) {
        event.preventDefault();
        performTutorialAction(tutorialAction);
        return;
      }

      if (event.defaultPrevented) return;

      if (key === "m" && !storyOverlay) {
        event.preventDefault();
        setSoundEnabled((current) => {
          const next = !current;
          try {
            window.localStorage.setItem(gameSoundKey, next ? "on" : "off");
          } catch {
            // Sound remains usable for this session when storage is blocked.
          }
          return next;
        });
        return;
      }

      if (key === "r" && !storyOverlay) {
        event.preventDefault();
        restartLevel();
        return;
      }

      if (key === "p" && !storyOverlay && !snapshot.completed) {
        event.preventDefault();
        if (!snapshot.runStarted) {
          if (snapshot.tutorialStep !== "pause") return;
          if (!tutorialPauseArmed) {
            setTutorialPauseArmed(true);
            setPaused(true);
            showNotice("Training paused. Press P or Resume to continue.", "info");
          } else {
            setTutorialPauseArmed(false);
            setPaused(false);
            gameHandleRef.current?.completeTutorialAction("pause");
          }
          return;
        }
        setPaused((current) => !current);
        return;
      }

      if (key === "l" && !storyOverlay) {
        event.preventDefault();
        overlayTriggerRef.current = document.activeElement as HTMLElement | null;
        if (!snapshot.runStarted && snapshot.tutorialStep === "story-log") {
          gameHandleRef.current?.completeTutorialAction("story-log");
        }
        setStoryOverlay("story-log");
        setPaused(true);
        return;
      }

      if (event.key !== "Escape") return;
      event.preventDefault();
      if (storyOverlay) {
        setStoryOverlay(null);
        setPaused(true);
        window.setTimeout(() => overlayTriggerRef.current?.focus(), 0);
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
  }, [
    onExit,
    performTutorialAction,
    restartLevel,
    showNotice,
    snapshot.completed,
    snapshot.runStarted,
    snapshot.tutorialStep,
    storyOverlay,
    tutorialPauseArmed,
  ]);

  React.useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => {
      reducedMotionRef.current = motionQuery.matches;
      setReducedMotionActive(motionQuery.matches);
      gameHandleRef.current?.setReducedMotion(motionQuery.matches);
    };
    syncMotion();
    motionQuery.addEventListener("change", syncMotion);
    return () => motionQuery.removeEventListener("change", syncMotion);
  }, []);

  const setGameHandle = React.useCallback((handle: ChronicleGameHandle | null) => {
    gameHandleRef.current = handle;
    if (handle) {
      handle.setReducedMotion(reducedMotionRef.current);
      handle.setPaused(shouldPauseRef.current);
    }
  }, []);

  const callbacks = React.useMemo(
    () => ({
      onSnapshot: (nextSnapshot: GameSnapshot) => {
        snapshotRef.current = nextSnapshot;
        runtimeReadyRef.current = true;
        setSnapshot(nextSnapshot);
        setRuntimeReady(true);
        const queuedAction = queuedTutorialActionRef.current;
        if (queuedAction && nextSnapshot.tutorialStep === queuedAction) {
          queuedTutorialActionRef.current = null;
          window.queueMicrotask(() => gameHandleRef.current?.performTutorialAction(queuedAction));
        }
      },
      onUnlock: setActiveUnlockId,
      onNotice: showNotice,
    }),
    [showNotice],
  );

  const openStoryLog = React.useCallback(() => {
    overlayTriggerRef.current = document.activeElement as HTMLElement | null;
    if (!snapshot.runStarted && snapshot.tutorialStep === "story-log") {
      gameHandleRef.current?.completeTutorialAction("story-log");
    }
    setStoryOverlay("story-log");
    setPaused(true);
  }, [snapshot.runStarted, snapshot.tutorialStep]);

  const closeStoryOverlay = React.useCallback(() => {
    setStoryOverlay(null);
    setPaused(true);
    window.setTimeout(() => overlayTriggerRef.current?.focus(), 0);
  }, []);

  const beginNormalRun = React.useCallback((skipWalkthrough = false) => {
    gameHandleRef.current?.beginRun(skipWalkthrough);
    setTutorialPauseArmed(false);
    setStoryOverlay(null);
    setPaused(false);
    window.setTimeout(() => stageRef.current?.focus(), 0);
  }, []);

  const resumeFromStoryLog = React.useCallback(() => {
    if (!snapshot.runStarted && snapshot.tutorialCompleted) {
      beginNormalRun();
      return;
    }
    setStoryOverlay(null);
    setPaused(false);
    window.setTimeout(() => stageRef.current?.focus(), 0);
  }, [beginNormalRun, snapshot.runStarted, snapshot.tutorialCompleted]);

  const toggleSound = () => {
    const nextSoundState = !soundEnabled;
    setSoundEnabled(nextSoundState);
    try {
      window.localStorage.setItem(gameSoundKey, nextSoundState ? "on" : "off");
    } catch {
      // Sound remains usable for this session when storage is blocked.
    }
  };

  const gameStatus =
    spawnPhase === "dropping"
      ? "Deploying"
      : storyOverlay
        ? "Story"
        : paused
          ? "Paused"
          : snapshot.completed
            ? "Complete"
            : snapshot.runStarted
              ? "Running"
              : "Training";
  const activeChapter = chronicleChapters[snapshot.chapterIndex] ?? chronicleChapters[0];
  const journeyProgress = snapshot.journeyProgress;
  const isPersonalBest =
    snapshot.completed &&
    snapshot.elapsedMs > 0 &&
    (savedProgress.bestTimeMs === null || snapshot.elapsedMs <= savedProgress.bestTimeMs);
  const tutorialStep = chronicleTutorialSteps.find((step) => step.id === snapshot.tutorialStep);
  const tutorialStepIndex = chronicleTutorialSteps.findIndex(
    (step) => step.id === snapshot.tutorialStep,
  );

  return (
    <section
      aria-labelledby="game-runtime-title"
      data-game-state={gameStatus.toLowerCase()}
      data-chronicle-chapter={activeChapter.id}
      data-journey-progress={journeyProgress}
      data-player-state={snapshot.playerState}
      data-dash-ready={snapshot.dashReady}
      data-signal={snapshot.signal}
      data-score={snapshot.score}
      data-elapsed-ms={snapshot.elapsedMs}
      data-best-time-ms={savedProgress.bestTimeMs ?? ""}
      data-checkpoints={snapshot.checkpoints.length}
      data-tutorial-step={snapshot.tutorialStep}
      data-tutorial-completed={snapshot.tutorialCompleted}
      data-run-started={snapshot.runStarted}
      data-runtime-ready={runtimeReady}
      data-recovered-records={snapshot.recoveredRecords.length}
      data-latest-unlock={snapshot.latestUnlockId ?? ""}
      data-reduced-motion={reducedMotionActive}
      data-reward-motion={reducedMotionActive ? "settled" : "animated"}
      data-game-theme="orbital-engineering-journey"
      className="pq-scope pq-game-runtime min-h-[100svh] bg-background pt-[76px]"
    >
      <h1 id="game-runtime-title" className="sr-only">
        Chronicle Run playable story
      </h1>

      <div className={styles.hudBar}>
        <div className="mx-auto flex max-w-[96rem] flex-wrap items-center justify-between gap-2.5">
          <div className="flex min-w-0 flex-wrap items-center gap-2.5">
            <SystemLabel>{`Chapter ${activeChapter.index} // ${activeChapter.title}`}</SystemLabel>
            <StatusIndicator
              tone={
                gameStatus === "Paused" || gameStatus === "Story"
                  ? "idle"
                  : gameStatus === "Complete"
                    ? "active"
                    : "info"
              }
              pulse={gameStatus === "Running"}
            >
              {gameStatus}
            </StatusIndicator>
          </div>

          <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.625rem] uppercase tracking-[0.08em] text-ink-muted sm:text-xs">
            <div>
              <dt className="sr-only">Signal</dt>
              <dd>Signal {snapshot.signal}%</dd>
            </div>
            <div>
              <dt className="sr-only">Story records</dt>
              <dd className="text-primary">Records {snapshot.recoveredRecords.length}/9</dd>
            </div>
            <div>
              <dt className="sr-only">Time</dt>
              <dd className="text-signal-yellow">Time {formatRunTime(snapshot.elapsedMs)}</dd>
            </div>
            <div>
              <dt className="sr-only">Personal best time</dt>
              <dd>Best {formatRunTime(savedProgress.bestTimeMs)}</dd>
            </div>
            <div>
              <dt className="sr-only">Score</dt>
              <dd>Score {snapshot.score.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="sr-only">Momentum</dt>
              <dd>×{snapshot.multiplier.toFixed(2)}</dd>
            </div>
            <div className="hidden md:block">
              <dt className="sr-only">High score</dt>
              <dd>High {savedProgress.highScore.toLocaleString()}</dd>
            </div>
          </dl>

          <div
            role="group"
            aria-label="Game controls"
            className="flex flex-wrap items-center gap-[6px]"
          >
            <HudButton
              label="Start or resume"
              icon={<Play aria-hidden="true" className="h-4 w-4" />}
              active={
                spawnPhase === "landed" &&
                snapshot.runStarted &&
                !paused &&
                !storyOverlay &&
                !snapshot.completed
              }
              disabled={
                spawnPhase === "dropping" ||
                snapshot.completed ||
                (!paused && !storyOverlay && !(snapshot.tutorialCompleted && !snapshot.runStarted))
              }
              onClick={() => {
                if (tutorialPauseArmed) {
                  setTutorialPauseArmed(false);
                  setPaused(false);
                  gameHandleRef.current?.completeTutorialAction("pause");
                } else if (snapshot.tutorialCompleted && !snapshot.runStarted) {
                  beginNormalRun();
                } else {
                  setStoryOverlay(null);
                  setPaused(false);
                }
              }}
            />
            <HudButton
              label="Pause"
              icon={<Pause aria-hidden="true" className="h-4 w-4" />}
              active={paused && !storyOverlay}
              disabled={
                spawnPhase === "dropping" ||
                paused ||
                storyOverlay !== null ||
                (!snapshot.runStarted && snapshot.tutorialStep !== "pause")
              }
              onClick={() => {
                if (!snapshot.runStarted) {
                  setTutorialPauseArmed(true);
                  setPaused(true);
                  showNotice("Training paused. Select Resume to continue.", "info");
                  return;
                }
                setPaused(true);
              }}
            />
            <HudButton
              label="Open Story Log"
              icon={<BookOpen aria-hidden="true" className="h-4 w-4" />}
              active={storyOverlay === "story-log"}
              disabled={spawnPhase === "dropping" || storyOverlay !== null}
              onClick={openStoryLog}
            />
            <HudButton
              label={soundEnabled ? "Mute sound" : "Enable sound"}
              icon={
                soundEnabled ? (
                  <Volume2 aria-hidden="true" className="h-4 w-4" />
                ) : (
                  <VolumeX aria-hidden="true" className="h-4 w-4" />
                )
              }
              active={soundEnabled}
              onClick={toggleSound}
            />
            <HudButton
              label="Restart level"
              icon={<RotateCcw aria-hidden="true" className="h-4 w-4" />}
              disabled={!runtimeReady}
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
        <div
          className={styles.journeyMeter}
          aria-label={`Journey progress: ${journeyProgress} percent`}
        >
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
        <GameCanvas
          controls={controlsRef}
          callbacks={callbacks}
          onReady={setGameHandle}
          recoveredRecords={initialProgress.recoveredRecords}
        />
        <div className={styles.scanlines} aria-hidden="true" />

        {spawnPhase === "dropping" ? (
          <div className={styles.spawnOverlay} aria-hidden="true">
            <div key={`hatch-${spawnCycle}`} className={styles.hatch}>
              <span className={styles.hatchLeft} />
              <span className={styles.hatchRight} />
            </div>
            <div
              key={`operator-${spawnCycle}`}
              className={cn(styles.operator, styles.operatorDropping)}
            />
          </div>
        ) : null}

        {notice && snapshot.runStarted ? (
          <div
            data-game-notice
            className={cn(
              styles.notice,
              styles[`notice${notice.tone[0].toUpperCase()}${notice.tone.slice(1)}`],
            )}
            role="status"
            aria-live="polite"
          >
            <RadioTower aria-hidden="true" className="h-4 w-4 shrink-0" />
            {notice.message}
          </div>
        ) : null}

        {activeUnlockId && !storyOverlay ? (
          <StoryUnlockCard recordId={activeUnlockId} onDismiss={() => setActiveUnlockId(null)} />
        ) : null}

        {tutorialStep && tutorialStep.id !== "complete" && !storyOverlay ? (
          <aside
            className={styles.tutorialPrompt}
            role="status"
            aria-live="polite"
            data-tutorial-prompt
            data-tutorial-position={tutorialStepIndex + 1}
          >
            <div className={styles.tutorialHeading}>
              <span>
                {savedProgress.tutorialCompleted ? "Replay walkthrough" : "Quick walkthrough"}
              </span>
              <b>{`${tutorialStepIndex + 1} / 5`}</b>
            </div>
            <div className={styles.tutorialAction}>
              <kbd>{tutorialStep.keyLabel}</kbd>
              <span>
                <strong>{tutorialStep.title}</strong>
                <small>{tutorialStep.instruction}</small>
              </span>
            </div>
            <div className={styles.tutorialSteps} aria-hidden="true">
              {chronicleTutorialSteps.slice(0, 5).map((step, index) => (
                <i
                  key={step.id}
                  data-step-state={
                    index < tutorialStepIndex
                      ? "complete"
                      : index === tutorialStepIndex
                        ? "active"
                        : "ahead"
                  }
                />
              ))}
            </div>
            {savedProgress.tutorialCompleted ? (
              <button
                type="button"
                className={styles.skipWalkthrough}
                disabled={!runtimeReady}
                onClick={() => beginNormalRun(true)}
              >
                Skip walkthrough
              </button>
            ) : null}
          </aside>
        ) : null}

        {paused && !storyOverlay ? (
          <div className={styles.pauseOverlay} role="status">
            <Pause aria-hidden="true" className="h-7 w-7 text-primary" />
            <p className="mt-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
              Simulation paused
            </p>
            <button
              type="button"
              className="mt-4 border border-primary bg-primary px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.08em] text-primary-foreground"
              onClick={() => {
                if (snapshot.completed) {
                  setStoryOverlay("complete");
                } else if (tutorialPauseArmed) {
                  setTutorialPauseArmed(false);
                  setPaused(false);
                  gameHandleRef.current?.completeTutorialAction("pause");
                } else if (snapshot.tutorialCompleted && !snapshot.runStarted) {
                  beginNormalRun();
                } else {
                  setPaused(false);
                }
              }}
            >
              {snapshot.completed
                ? "View completion recap"
                : tutorialPauseArmed
                  ? "Resume training"
                  : snapshot.tutorialCompleted && !snapshot.runStarted
                    ? "Start run"
                    : "Resume"}
            </button>
          </div>
        ) : null}

        <div className={styles.touchControls} aria-label="Touch game controls">
          <TouchButton
            action="jump"
            label="Jump"
            icon={<ArrowUp aria-hidden="true" />}
            setPressed={setControlPressed}
            onPress={() => {
              if (!snapshot.runStarted) performTutorialAction("jump");
            }}
          />
          <TouchButton
            action="dash"
            label="Dash"
            icon={<Zap aria-hidden="true" />}
            setPressed={setControlPressed}
            onPress={() => {
              if (!snapshot.runStarted) performTutorialAction("dash");
            }}
          />
          <TouchButton
            action="drop"
            label="Fast drop"
            icon={<ArrowDown aria-hidden="true" />}
            setPressed={setControlPressed}
            onPress={() => {
              if (!snapshot.runStarted) performTutorialAction("drop");
            }}
          />
        </div>

        {storyOverlay ? (
          <StoryLogDialog
            mode={storyOverlay}
            recoveredRecords={snapshot.recoveredRecords}
            score={snapshot.score}
            highScore={savedProgress.highScore}
            elapsedMs={snapshot.elapsedMs}
            bestTimeMs={savedProgress.bestTimeMs}
            isPersonalBest={isPersonalBest}
            runCompleted={snapshot.completed}
            onClose={closeStoryOverlay}
            onResume={resumeFromStoryLog}
            onReplay={restartLevel}
            onShowLog={() => setStoryOverlay("story-log")}
            onShowRecap={() => setStoryOverlay("complete")}
            onExit={onExit}
          />
        ) : null}
      </div>

      <div className={styles.gameFooter}>
        <p className="flex items-center gap-2 font-mono uppercase tracking-[0.08em]">
          <Gamepad2 aria-hidden="true" className="h-4 w-4 text-primary" />
          {gameStatus === "Running"
            ? "Auto-run active · Space jumps · Shift dashes · S drops"
            : snapshot.runStarted
              ? "Run paused · Resume from the game controls"
              : "Training paused · Complete the displayed action"}
        </p>
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.08em]">
          P pause · L log · R restart · M sound · Esc exit
        </p>
      </div>
    </section>
  );
}
