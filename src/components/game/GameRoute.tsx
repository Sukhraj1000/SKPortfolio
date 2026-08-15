"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Gauge,
  LogOut,
  Play,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  chronicleChapters,
  chronicleRecords,
  emptyChronicleProgress,
  parseChronicleProgress,
  type ChronicleProgress,
} from "@/components/game/chronicle-story";
import { Button } from "@/components/ui/button";
import { PixelFrame } from "@/components/ui/pixel-frame";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { SystemLabel } from "@/components/ui/system-label";
import {
  defaultPortfolioHref,
  gameProgressKey,
  readPortfolioReturnHref,
} from "@/lib/game-mode";
import styles from "./GameRoute.module.css";

const GameExperience = React.lazy(() =>
  import("@/components/game/GameExperience").then((module) => ({
    default: module.GameExperience,
  })),
);

function RuntimeLoading() {
  return (
    <div
      className="grid min-h-[calc(100svh-4rem)] place-items-center bg-background px-4 pt-16"
      role="status"
    >
      <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.12em] text-primary">
        <span className="status-pulse h-2.5 w-2.5 bg-primary" />
        Building Chronicle Run
      </div>
    </div>
  );
}

function readReadyProgress() {
  if (typeof window === "undefined") return emptyChronicleProgress;
  try {
    return parseChronicleProgress(window.localStorage.getItem(gameProgressKey));
  } catch {
    return { ...emptyChronicleProgress };
  }
}

export function GameRoute() {
  const router = useRouter();
  const [started, setStarted] = React.useState(false);
  const [portfolioReturnHref, setPortfolioReturnHref] = React.useState(
    defaultPortfolioHref,
  );
  const [savedProgress, setSavedProgress] =
    React.useState<ChronicleProgress>(emptyChronicleProgress);

  React.useEffect(() => {
    setPortfolioReturnHref(readPortfolioReturnHref());
    setSavedProgress(readReadyProgress());
  }, []);

  const exitGame = React.useCallback(() => {
    router.push(portfolioReturnHref);
  }, [portfolioReturnHref, router]);

  if (started) {
    return (
      <React.Suspense fallback={<RuntimeLoading />}>
        <GameExperience onExit={exitGame} />
      </React.Suspense>
    );
  }

  return (
    <section aria-labelledby="game-ready-title" className={styles.ready}>
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.horizon} aria-hidden="true" />
      <div className={styles.track} aria-hidden="true" />

      <div className={styles.layout}>
        <div className={styles.copy}>
          <div className="flex flex-wrap items-center gap-3">
            <SystemLabel>{"Chronicle Run // Ready"}</SystemLabel>
            <StatusIndicator tone="info">3–5 minute story</StatusIndicator>
          </div>

          <h1 id="game-ready-title" className={styles.title}>
            Chronicle
            <span>Run.</span>
          </h1>

          <p className={styles.lede}>
            Keep moving through a short playable version of Sukhraj&apos;s story.
            Read the route, choose your line, and recover real Education,
            Experience, and Project milestones without stopping the run.
          </p>

          <div className={styles.actions}>
            <Button size="lg" onClick={() => setStarted(true)}>
              <Play aria-hidden="true" />
              Start Chronicle Run
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href={portfolioReturnHref}>
                <LogOut aria-hidden="true" />
                Exit to Portfolio
              </Link>
            </Button>
          </div>

          <p className={styles.assurance}>
            <ShieldCheck
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0 text-signal-green"
            />
            Nothing starts automatically. Progress and sound stay on this
            device, and the complete professional story remains available in
            Portfolio mode.
          </p>

        </div>

        <PixelFrame
          tone="cyan"
          raised
          className={styles.panel}
          data-ready-records={savedProgress.recoveredRecords.length}
        >
          <div className={styles.panelHeader}>
            <SystemLabel tone="cyan">The route</SystemLabel>
            <Sparkles aria-hidden="true" className="h-4 w-4 text-primary" />
          </div>

          <div className={styles.panelBody}>
            <p className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-primary">
              One finite run // Five chapters
            </p>
            <h2>The story is the reward. Movement is the game.</h2>
            <p>
              Auto-run forward, jump hazards, dash through timing gates, take
              optional high routes, and keep momentum through every chapter.
            </p>

            <ol className={styles.chapterList} aria-label="Chronicle route">
              {chronicleChapters.map((chapter) => (
                <li key={chapter.id}>
                  <span>{chapter.index}</span>
                  <strong>{chapter.title}</strong>
                  <small>
                    {savedProgress.completedChapters.includes(chapter.id)
                      ? "Complete"
                      : "Ahead"}
                  </small>
                  <ArrowRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5 text-ink-faint max-sm:hidden"
                  />
                </li>
              ))}
            </ol>
          </div>

          <dl className={styles.summary} aria-label="Saved Chronicle progress">
            <div>
              <dt>Story records</dt>
              <dd>
                {savedProgress.recoveredRecords.length} / {chronicleRecords.length}
              </dd>
            </div>
            <div>
              <dt>High score</dt>
              <dd>{savedProgress.highScore.toLocaleString()}</dd>
            </div>
            <div>
              <dt>Run state</dt>
              <dd>{savedProgress.completed ? "Complete" : "Ready"}</dd>
            </div>
          </dl>

          <div className={styles.controls} aria-label="Chronicle Run controls">
            <div>
              <strong>Space / ↑</strong>
              <span>Jump and choose a higher route</span>
            </div>
            <div>
              <strong>Shift / D</strong>
              <span>Dash through a timing window</span>
            </div>
            <div>
              <strong>S / ↓</strong>
              <span>Drop quickly back to the route</span>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-border bg-surface px-4 py-3 text-xs leading-5 text-ink-muted">
            <Gauge aria-hidden="true" className="h-4 w-4 shrink-0 text-signal-yellow" />
            A guided opening introduces each action before scoring begins.
          </div>
        </PixelFrame>
      </div>
    </section>
  );
}
