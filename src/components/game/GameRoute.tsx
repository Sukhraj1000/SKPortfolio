"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Gamepad2,
  Keyboard,
  LogOut,
  MousePointer2,
  Play,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PixelFrame } from "@/components/ui/pixel-frame";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { SystemLabel } from "@/components/ui/system-label";
import {
  defaultPortfolioHref,
  readPortfolioReturnHref,
} from "@/lib/game-mode";

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
        Linking isolated game runtime
      </div>
    </div>
  );
}

export function GameRoute() {
  const router = useRouter();
  const [started, setStarted] = React.useState(false);
  const [portfolioReturnHref, setPortfolioReturnHref] = React.useState(
    defaultPortfolioHref,
  );

  React.useEffect(() => {
    setPortfolioReturnHref(readPortfolioReturnHref());
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
    <section
      aria-labelledby="game-ready-title"
      className="relative isolate min-h-[100svh] overflow-hidden bg-background px-4 pb-10 pt-24 sm:px-6 sm:pb-14 sm:pt-28"
    >
      <div className="site-grid pointer-events-none absolute inset-0 -z-20 opacity-60" />
      <div className="dither-field pointer-events-none absolute inset-y-16 right-0 -z-10 w-1/2 opacity-30 [mask-image:linear-gradient(to_left,black,transparent)]" />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:min-h-[calc(100svh-9rem)] lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)] lg:gap-14">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <SystemLabel>{"Game route // Ready state"}</SystemLabel>
            <StatusIndicator tone="info">Input idle</StatusIndicator>
          </div>

          <h1
            id="game-ready-title"
            className="text-balance mt-6 text-5xl font-semibold uppercase leading-[0.88] tracking-[-0.06em] text-foreground sm:text-7xl lg:text-8xl"
          >
            Signal link
            <span className="block text-primary">ready.</span>
          </h1>

          <p className="text-pretty mt-6 max-w-2xl text-base leading-7 text-ink-muted sm:text-lg sm:leading-8">
            Game mode is the optional second telling of the portfolio. Start when
            you are ready to deploy SK into the spawn bay; nothing captures input
            or begins automatically.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => setStarted(true)}>
              <Play aria-hidden="true" />
              Start deployment
            </Button>
            <Button variant="outline" size="lg" onClick={exitGame}>
              <LogOut aria-hidden="true" />
              Exit to Portfolio
            </Button>
          </div>

          <p className="mt-5 flex max-w-xl items-start gap-2.5 border-l border-border-strong pl-4 text-sm leading-6 text-ink-muted">
            <ShieldCheck
              aria-hidden="true"
              className="mt-1 h-4 w-4 shrink-0 text-signal-green"
            />
            Portfolio mode remains complete on its own. Game progress and sound
            preference stay on this device and never require an account.
          </p>
        </div>

        <PixelFrame tone="cyan" raised className="overflow-hidden bg-surface">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-raised px-4 py-3">
            <SystemLabel tone="cyan">Mission briefing</SystemLabel>
            <Gamepad2 aria-hidden="true" className="h-4 w-4 text-primary" />
          </div>

          <div className="micro-grid bg-background p-5 sm:p-6">
            <p className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-primary">
              Primary objective
            </p>
            <p className="mt-3 text-xl font-semibold leading-8 text-foreground">
              Trace the same engineering story through a playable industrial world.
            </p>

            <ol className="mt-6 grid gap-px border border-border bg-border">
              {[
                "Deploy into the onboarding bay",
                "Learn movement through play",
                "Recover four story signals",
                "Restore the final Comms uplink",
              ].map((step, index) => (
                <li
                  key={step}
                  className="grid min-h-12 grid-cols-[2.25rem_1fr_auto] items-center bg-surface px-3 text-sm text-foreground"
                >
                  <span className="font-mono text-[0.625rem] text-primary">
                    0{index + 1}
                  </span>
                  {step}
                  <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 text-ink-faint" />
                </li>
              ))}
            </ol>
          </div>

          <div className="grid gap-px border-t border-border bg-border sm:grid-cols-2">
            <div className="bg-surface p-4">
              <p className="flex items-center gap-2 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-primary">
                <Keyboard aria-hidden="true" className="h-4 w-4" />
                Keyboard
              </p>
              <p className="mt-2 text-xs leading-5 text-ink-muted">
                WASD, arrows, Space and E once the level is connected.
              </p>
            </div>
            <div className="bg-surface p-4">
              <p className="flex items-center gap-2 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-primary">
                <MousePointer2 aria-hidden="true" className="h-4 w-4" />
                Pointer / touch
              </p>
              <p className="mt-2 text-xs leading-5 text-ink-muted">
                Persistent HUD controls keep Start, Pause and Exit within reach.
              </p>
            </div>
          </div>
        </PixelFrame>
      </div>
    </section>
  );
}
