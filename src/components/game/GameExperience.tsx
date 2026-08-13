"use client";

import * as React from "react";
import {
  Gamepad2,
  LogOut,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { SystemLabel } from "@/components/ui/system-label";
import { gameSoundKey } from "@/lib/game-mode";
import { cn } from "@/lib/utils";
import styles from "./GameExperience.module.css";

type SpawnPhase = "dropping" | "landed";

interface GameExperienceProps {
  onExit: () => void;
}

interface HudButtonProps extends React.ComponentProps<"button"> {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
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
        "grid h-11 min-w-11 place-items-center border px-3 transition-colors disabled:cursor-not-allowed disabled:opacity-40",
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

export function GameExperience({ onExit }: GameExperienceProps) {
  const [spawnCycle, setSpawnCycle] = React.useState(0);
  const [spawnPhase, setSpawnPhase] = React.useState<SpawnPhase>("dropping");
  const [paused, setPaused] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(false);

  React.useEffect(() => {
    try {
      setSoundEnabled(window.localStorage.getItem(gameSoundKey) === "on");
    } catch {
      setSoundEnabled(false);
    }
  }, []);

  React.useEffect(() => {
    setSpawnPhase("dropping");
    setPaused(false);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSpawnPhase("landed");
      return;
    }

    const landingTimer = window.setTimeout(() => {
      setSpawnPhase("landed");
    }, 760);

    return () => window.clearTimeout(landingTimer);
  }, [spawnCycle]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onExit();
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
  }, [onExit]);

  const toggleSound = () => {
    const nextSoundState = !soundEnabled;
    setSoundEnabled(nextSoundState);

    try {
      window.localStorage.setItem(gameSoundKey, nextSoundState ? "on" : "off");
    } catch {
      // Sound remains usable for this session when storage is blocked.
    }
  };

  const restartDeployment = () => {
    setSpawnCycle((cycle) => cycle + 1);
  };

  const gameStatus =
    spawnPhase === "dropping" ? "Deploying" : paused ? "Paused" : "Running";

  return (
    <section
      aria-labelledby="game-runtime-title"
      data-game-state={gameStatus.toLowerCase()}
      className="min-h-[100svh] bg-background pt-16"
    >
      <h1 id="game-runtime-title" className="sr-only">
        IRON//SIGNAL Game mode runtime
      </h1>

      <div className="border-b border-border-strong bg-surface px-3 py-3 sm:px-5">
        <div className="mx-auto flex max-w-[96rem] flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SystemLabel>{"IRON//SIGNAL HUD"}</SystemLabel>
            <StatusIndicator
              tone={paused ? "idle" : spawnPhase === "dropping" ? "info" : "active"}
              pulse={!paused}
            >
              {gameStatus}
            </StatusIndicator>
          </div>

          <div
            role="group"
            aria-label="Game controls"
            className="flex flex-wrap items-center gap-1.5"
          >
            <HudButton
              label="Start or resume"
              icon={<Play aria-hidden="true" className="h-4 w-4" />}
              active={spawnPhase === "landed" && !paused}
              disabled={spawnPhase === "dropping" || !paused}
              onClick={() => setPaused(false)}
            />
            <HudButton
              label="Pause"
              icon={<Pause aria-hidden="true" className="h-4 w-4" />}
              active={paused}
              disabled={spawnPhase === "dropping" || paused}
              onClick={() => setPaused(true)}
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
              label="Restart deployment"
              icon={<RotateCcw aria-hidden="true" className="h-4 w-4" />}
              onClick={restartDeployment}
            />
            <HudButton
              label="Exit to Portfolio"
              icon={<LogOut aria-hidden="true" className="h-4 w-4" />}
              className="border-signal-red text-signal-red hover:bg-signal-red hover:text-white"
              onClick={onExit}
            />
          </div>
        </div>
      </div>

      <div className={styles.stage}>
        <div className={styles.scanlines} aria-hidden="true" />

        <div key={`hatch-${spawnCycle}`} className={styles.hatch} aria-hidden="true">
          <span className={styles.hatchLeft} />
          <span className={styles.hatchRight} />
        </div>

        <div className={styles.stageReadout}>
          <SystemLabel marker={false} tone="cyan">
            Spawn bay // 00
          </SystemLabel>
          <p className="mt-2 font-mono text-[0.625rem] uppercase tracking-[0.1em] text-ink-muted">
            World runtime reserved for first playable level
          </p>
        </div>

        <div
          key={`operator-${spawnCycle}`}
          role="img"
          aria-label="SK character deploying from the header hatch into the spawn bay"
          className={cn(
            styles.operator,
            spawnPhase === "dropping" ? styles.operatorDropping : styles.operatorLanded,
          )}
        />

        <div className={styles.spawnMarker} aria-hidden="true">
          <span />
        </div>

        <div className={styles.floor} aria-hidden="true" />

        {paused ? (
          <div className={styles.pauseOverlay} role="status">
            <Pause aria-hidden="true" className="h-7 w-7 text-primary" />
            <p className="mt-3 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
              Simulation paused
            </p>
            <button
              type="button"
              className="mt-4 border border-primary bg-primary px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.08em] text-primary-foreground"
              onClick={() => setPaused(false)}
            >
              Resume
            </button>
          </div>
        ) : null}

        <p className="sr-only" aria-live="polite">
          {spawnPhase === "landed"
            ? "SK has landed in the spawn bay."
            : "SK deployment in progress."}
        </p>
      </div>

      <div className="border-t border-border-strong bg-surface px-4 py-3">
        <div className="mx-auto flex max-w-[96rem] flex-wrap items-center justify-between gap-3 text-xs text-ink-muted">
          <p className="flex items-center gap-2 font-mono uppercase tracking-[0.08em]">
            <Gamepad2 aria-hidden="true" className="h-4 w-4 text-primary" />
            Runtime shell online // level module pending
          </p>
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.08em]">
            Escape exits safely
          </p>
        </div>
      </div>
    </section>
  );
}
