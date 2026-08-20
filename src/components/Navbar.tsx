"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { flushSync } from "react-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CVAccessDialog, CVAccessDialogMobile } from "@/components/CVAccessDialog";
import { portfolioProfile, storyChapters } from "@/data/portfolio";
import {
  defaultPortfolioHref,
  portfolioStoryAnchors,
  readPortfolioReturnHref,
  rememberPortfolioAnchor,
  type PortfolioStoryAnchor,
} from "@/lib/game-mode";
import { cn } from "@/lib/utils";
import { usePortfolioProgress } from "@/components/pixel-quest/PortfolioProgress";
import { OperatorSprite } from "@/components/pixel-quest/QuestPrimitives";

function GameModeControl({ portfolioReturnHref }: { portfolioReturnHref: string }) {
  return (
    <div
      role="group"
      aria-label="Portfolio experience mode"
      className="grid min-h-[44px] shrink-0 grid-cols-[auto_auto] border border-border-strong bg-surface p-0.5 font-mono text-sm font-semibold uppercase tracking-[0.04em]"
    >
      <Link
        href={portfolioReturnHref}
        className="grid place-items-center px-1 text-ink-muted transition-colors hover:bg-surface-raised hover:text-foreground sm:px-2.5"
        aria-label="Return to Portfolio mode"
        title="Return to Portfolio mode"
      >
        <span aria-hidden="true" className="hidden min-[480px]:inline">
          Portfolio
        </span>
        <span aria-hidden="true" className="min-[480px]:hidden">
          Port.
        </span>
      </Link>
      <span
        className="grid place-items-center border-l border-border bg-primary px-1 text-primary-foreground sm:px-2"
        aria-current="page"
        title="Game mode selected"
      >
        Game<span className="sr-only"> mode selected</span>
      </span>
    </div>
  );
}

function GameNavbar() {
  const [portfolioReturnHref, setPortfolioReturnHref] = React.useState(
    defaultPortfolioHref,
  );

  React.useEffect(() => {
    setPortfolioReturnHref(readPortfolioReturnHref());
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border-strong bg-background shadow-[0_3px_0_var(--shadow-soft)]">
      <div className="section-shell flex h-[64px] items-center gap-2 lg:gap-4">
        <Link
          href={portfolioReturnHref}
          className="group hidden shrink-0 items-center gap-2 md:flex"
          aria-label={`${portfolioProfile.name}, exit Game mode`}
        >
          <span className="grid h-11 w-11 place-items-center border border-primary bg-primary font-mono text-sm font-bold text-primary-foreground shadow-[2px_2px_0_var(--shadow-strong)] transition-transform group-hover:-translate-y-0.5">
            {portfolioProfile.initials}
          </span>
          <span className="hidden leading-none sm:block">
            <span className="block text-sm font-semibold text-foreground">
              {portfolioProfile.name}
            </span>
            <span className="mt-1 block font-mono text-sm uppercase tracking-[0.06em] text-ink-muted">
              Software Engineer
            </span>
          </span>
        </Link>

        <p className="ml-auto hidden font-mono text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted xl:block">
          Game route // isolated runtime
        </p>

        <div className="ml-auto flex items-center xl:ml-0">
          <GameModeControl portfolioReturnHref={portfolioReturnHref} />
        </div>
      </div>
    </header>
  );
}

function PortfolioNavbar() {
  const { activeSection, activeIndex, progress, selectSection } =
    usePortfolioProgress();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [gameLaunching, setGameLaunching] = React.useState(false);
  const gameLaunchingRef = React.useRef(false);
  const launchFallbackTimerRef = React.useRef<number | null>(null);
  const activeChapter = storyChapters[activeIndex] ?? storyChapters[0];

  React.useEffect(
    () => () => {
      if (launchFallbackTimerRef.current !== null) {
        window.clearTimeout(launchFallbackTimerRef.current);
      }
    },
    [],
  );

  const handleGameEntry = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      rememberPortfolioAnchor(activeSection);

      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      ) {
        return;
      }

      if (gameLaunchingRef.current) {
        event.preventDefault();
        return;
      }

      gameLaunchingRef.current = true;
      flushSync(() => setGameLaunching(true));
      launchFallbackTimerRef.current = window.setTimeout(() => {
        gameLaunchingRef.current = false;
        setGameLaunching(false);
      }, 10_000);
    },
    [activeSection],
  );

  const activateChapter = React.useCallback(
    (sectionId: PortfolioStoryAnchor) => {
      selectSection(sectionId);
      setMobileOpen(false);
    },
    [selectSection],
  );

  return (
    <>
      <header className="pq-header pq-scope" data-portfolio-header>
      <div className="pq-header-inner">
        <Link
          href="/#home"
          className="pq-brand"
          aria-label={`${portfolioProfile.name}, return to Profile`}
          onClick={() => activateChapter("home")}
        >
          <span className="pq-brand-pixel" aria-hidden="true">
            {portfolioProfile.initials}
          </span>
          <span className="pq-brand-copy">
            <strong>{portfolioProfile.name}</strong>
            <small>{portfolioProfile.role}</small>
          </span>
        </Link>

        <div className="pq-story-status" aria-label="Portfolio story progress">
          <span className="pq-status-light" aria-hidden="true" />
          <span data-chapter-status>
            Chapter {activeChapter.index} / 05 · {activeChapter.portfolioLabel}
          </span>
          <span
            className="pq-status-track"
            role="progressbar"
            aria-label="Portfolio journey progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <i style={{ width: `${progress}%` }} />
          </span>
        </div>

        <nav className="pq-desktop-nav" aria-label="Primary navigation">
          {storyChapters.slice(1).map((chapter, index) => {
            const sectionId = portfolioStoryAnchors[index + 1];
            const active = activeSection === sectionId;
            return (
              <Link
                key={chapter.id}
                href={chapter.href}
                aria-current={active ? "location" : undefined}
                onClick={() => activateChapter(sectionId)}
              >
                {chapter.portfolioLabel}
              </Link>
            );
          })}
        </nav>

        <div className="pq-header-actions">
          <Link
            href="/game"
            prefetch={false}
            className="pq-game-link"
            aria-label="Enter Game mode"
            aria-disabled={gameLaunching || undefined}
            aria-busy={gameLaunching || undefined}
            onClick={handleGameEntry}
          >
            Game <span aria-hidden="true">↗</span>
          </Link>
          <div className="pq-header-cv">
            <CVAccessDialog buttonClassName="h-11 px-3" />
          </div>

          <div className="pq-mobile-menu">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-11 w-11"
                  aria-label="Open portfolio navigation"
                  title="Open navigation"
                >
                  <Menu aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="pq-scope w-[min(22rem,calc(100vw-1rem))] gap-0 border-l-2 border-border-strong bg-background p-0 shadow-[-6px_0_0_var(--shadow-strong)]"
              >
                <SheetHeader className="border-b border-border px-5 py-5 text-left">
                  <span className="pq-kicker">Five chapter journey</span>
                  <SheetTitle className="text-xl">Portfolio navigation</SheetTitle>
                  <SheetDescription>
                    Move directly between professional evidence chapters.
                  </SheetDescription>
                </SheetHeader>

                <nav aria-label="Mobile navigation" className="grid p-3">
                  {storyChapters.map((chapter, index) => {
                    const sectionId = portfolioStoryAnchors[index];
                    const active = activeSection === sectionId;
                    return (
                      <SheetClose asChild key={chapter.id}>
                        <Link
                          href={chapter.href}
                          aria-current={active ? "location" : undefined}
                          className={cn(
                            "group grid min-h-14 grid-cols-[2.5rem_1fr_auto] items-center border-b border-border px-3 font-mono text-sm font-semibold uppercase tracking-[0.04em] first:border-t",
                            active
                              ? "bg-surface-raised text-primary"
                              : "text-foreground hover:bg-surface",
                          )}
                          onClick={() => activateChapter(sectionId)}
                        >
                          <span className="text-xs text-signal-cyan">
                            {chapter.index}
                          </span>
                          {chapter.portfolioLabel}
                          <span aria-hidden="true" className="text-primary">
                            →
                          </span>
                        </Link>
                      </SheetClose>
                    );
                  })}
                </nav>

                <div className="mt-auto border-t border-border bg-surface p-4">
                  <p className="mb-3 font-mono text-xs uppercase tracking-[0.08em] text-ink-muted">
                    Private CV access
                  </p>
                  <CVAccessDialogMobile buttonClassName="h-11 bg-background" />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      </header>

      {gameLaunching ? (
        <div
          className="pq-game-launch-overlay pq-scope"
          data-game-launch-state="opening"
          role="status"
          aria-live="assertive"
          aria-atomic="true"
          aria-busy="true"
        >
          <div className="pq-game-launch-grid" aria-hidden="true" />
          <div className="pq-game-launch-copy">
            <OperatorSprite size="large" className="pq-game-launch-operator" />
            <p>Optional playable portfolio</p>
            <h2>Opening Chronicle Run</h2>
            <span className="pq-game-launch-progress" aria-hidden="true"><i /></span>
            <strong>Preparing training shell · Game runtime remains isolated</strong>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function Navbar() {
  const pathname = usePathname();
  return pathname.startsWith("/game") ? <GameNavbar /> : <PortfolioNavbar />;
}
