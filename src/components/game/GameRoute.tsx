"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import {
  emptyChronicleProgress,
  parseChronicleProgress,
  type ChronicleProgress,
} from "@/components/game/chronicle-story";
import { Button } from "@/components/ui/button";
import { SystemLabel } from "@/components/ui/system-label";
import {
  defaultPortfolioHref,
  gameProgressKey,
  readPortfolioReturnHref,
} from "@/lib/game-mode";

const GameExperience = React.lazy(() =>
  import("@/components/game/GameExperience").then((module) => ({
    default: module.GameExperience,
  })),
);

function readReadyProgress() {
  if (typeof window === "undefined") return emptyChronicleProgress;
  try {
    return parseChronicleProgress(window.localStorage.getItem(gameProgressKey));
  } catch {
    return { ...emptyChronicleProgress };
  }
}

function TrainingShellFallback({
  portfolioReturnHref,
}: {
  portfolioReturnHref: string;
}) {
  return (
    <section
      aria-labelledby="game-training-title"
      className="pq-scope pq-game-fallback min-h-[100svh] bg-background px-4 pb-12 pt-32"
      data-game-theme="orbital-engineering-journey"
    >
      <div className="pq-game-fallback-panel mx-auto grid max-w-3xl gap-6 border border-border-strong bg-surface p-5 shadow-[6px_6px_0_var(--shadow-strong)] sm:p-8">
        <SystemLabel tone="cyan">Chronicle Run // Quick walkthrough</SystemLabel>
        <div>
          <h1
            id="game-training-title"
            className="text-4xl font-extrabold tracking-[-0.055em] text-foreground sm:text-6xl"
          >
            Five actions, then run.
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-ink-muted">
            Game mode opens directly into a short input walkthrough. Complete
            Jump, Dash, Fast Drop, Pause, and Story Log, then auto-run through
            five chapters of Sukhraj&apos;s professional story.
          </p>
        </div>
        <ol className="grid gap-px bg-border font-mono text-xs font-semibold uppercase tracking-[0.06em] sm:grid-cols-5">
          {[
            "Jump",
            "Dash",
            "Fast Drop",
            "Pause",
            "Story Log",
          ].map((step, index) => (
            <li key={step} className="bg-background p-3 text-foreground">
              <span className="mr-2 text-primary">{index + 1}/5</span>
              {step}
            </li>
          ))}
        </ol>
        <p className="font-mono text-xs uppercase tracking-[0.06em] text-ink-muted">
          Loading the paused training stage. This optional game will not move
          until the walkthrough is complete; the full Portfolio remains
          available below.
        </p>
        <Button variant="outline" asChild className="w-fit max-w-full">
          <Link href={portfolioReturnHref}>
            <LogOut aria-hidden="true" />
            Exit to Portfolio
          </Link>
        </Button>
      </div>
    </section>
  );
}

export function GameRoute() {
  const router = useRouter();
  const [hydrated, setHydrated] = React.useState(false);
  const [portfolioReturnHref, setPortfolioReturnHref] = React.useState(
    defaultPortfolioHref,
  );
  const [savedProgress, setSavedProgress] =
    React.useState<ChronicleProgress>(emptyChronicleProgress);

  React.useEffect(() => {
    setPortfolioReturnHref(readPortfolioReturnHref());
    setSavedProgress(readReadyProgress());
    setHydrated(true);
  }, []);

  const exitGame = React.useCallback(() => {
    router.push(portfolioReturnHref);
  }, [portfolioReturnHref, router]);

  if (!hydrated) {
    return <TrainingShellFallback portfolioReturnHref={portfolioReturnHref} />;
  }

  return (
    <React.Suspense
      fallback={<TrainingShellFallback portfolioReturnHref={portfolioReturnHref} />}
    >
      <GameExperience onExit={exitGame} initialProgress={savedProgress} />
    </React.Suspense>
  );
}
