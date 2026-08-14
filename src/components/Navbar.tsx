"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CVAccessDialog, CVAccessDialogMobile } from "@/components/CVAccessDialog";
import { portfolioNavigation, portfolioProfile } from "@/data/portfolio";
import {
  defaultPortfolioHref,
  portfolioStoryAnchors,
  readPortfolioReturnHref,
  rememberPortfolioAnchor,
  type PortfolioStoryAnchor,
} from "@/lib/game-mode";
import { cn } from "@/lib/utils";

function ModeControl({
  isGameMode,
  portfolioReturnHref,
  onEnterGame,
}: {
  isGameMode: boolean;
  portfolioReturnHref: string;
  onEnterGame: () => void;
}) {
  return (
    <div
      role="group"
      aria-label="Portfolio experience mode"
      className="grid h-11 shrink-0 grid-cols-[auto_auto] border border-border-strong bg-surface p-0.5 font-mono text-sm font-semibold uppercase tracking-[0.04em]"
    >
      {isGameMode ? (
        <Link
          href={portfolioReturnHref}
          className="grid place-items-center px-2.5 text-ink-muted transition-colors hover:bg-surface-raised hover:text-foreground"
          aria-label="Return to Portfolio mode"
          title="Return to Portfolio mode"
        >
          Portfolio
        </Link>
      ) : (
        <span
          className="grid place-items-center bg-primary px-2.5 text-primary-foreground"
          aria-current="page"
          title="Portfolio mode selected"
        >
          Portfolio
          <span className="sr-only"> mode selected</span>
        </span>
      )}

      {isGameMode ? (
        <span
          className="grid place-items-center border-l border-border bg-primary px-2 text-primary-foreground"
          aria-current="page"
          title="Game mode selected"
        >
          Game
          <span className="sr-only"> mode selected</span>
        </span>
      ) : (
        <Link
          href="/game"
          prefetch={false}
          className="grid place-items-center border-l border-border px-2 text-ink-muted transition-colors hover:bg-surface-raised hover:text-foreground"
          aria-label="Enter Game mode"
          title="Enter Game mode"
          onClick={onEnterGame}
        >
          Game
        </Link>
      )}
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const isGameMode = pathname.startsWith("/game");
  const [activeSection, setActiveSection] =
    React.useState<PortfolioStoryAnchor>("home");
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [portfolioReturnHref, setPortfolioReturnHref] = React.useState(
    defaultPortfolioHref,
  );

  React.useEffect(() => {
    if (isGameMode) setPortfolioReturnHref(readPortfolioReturnHref());
  }, [isGameMode]);

  React.useEffect(() => {
    if (isGameMode) return;

    const updateActiveSection = () => {
      const readingLine = window.scrollY + 112;
      let currentSection: PortfolioStoryAnchor = portfolioStoryAnchors[0];

      for (const sectionId of portfolioStoryAnchors) {
        const section = document.getElementById(sectionId);

        if (section && section.offsetTop <= readingLine) {
          currentSection = sectionId;
        }
      }

      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 8
      ) {
        currentSection = "contact";
      }

      setActiveSection(currentSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [isGameMode]);

  const handleEnterGame = React.useCallback(() => {
    if (isGameMode) return;

    rememberPortfolioAnchor(activeSection);
    setPortfolioReturnHref(`/#${activeSection}`);
  }, [activeSection, isGameMode]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border-strong bg-background shadow-[0_3px_0_var(--shadow-soft)]">
      <div className="section-shell flex h-16 items-center gap-2 lg:gap-4">
        <Link
          href={isGameMode ? portfolioReturnHref : "/#home"}
          className="group hidden shrink-0 items-center gap-2 min-[360px]:flex"
          aria-label={
            isGameMode
              ? `${portfolioProfile.name}, exit Game mode`
              : `${portfolioProfile.name}, return to Home`
          }
          onClick={() => setActiveSection("home")}
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

        {!isGameMode ? (
          <nav
            aria-label="Primary navigation"
            className="ml-auto hidden items-stretch self-stretch xl:flex"
          >
            {portfolioNavigation.map((link, index) => {
              const isActive = activeSection === link.id;

              return (
                <Link
                  key={link.id}
                  href={link.href}
                  aria-current={isActive ? "location" : undefined}
                  className={cn(
                    "group relative flex min-w-20 items-center justify-center border-l border-border px-3 font-mono text-sm font-semibold uppercase tracking-[0.04em] transition-colors last:border-r",
                    isActive
                      ? "bg-surface-raised text-primary"
                      : "text-ink-muted hover:bg-surface hover:text-foreground",
                  )}
                  onClick={() => setActiveSection(link.id)}
                >
                  <span className="mr-1.5 text-xs text-ink-faint">
                    0{index + 1}
                  </span>
                  {link.label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-3 bottom-0 h-0.5 bg-primary transition-transform",
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </Link>
              );
            })}
          </nav>
        ) : (
          <p className="ml-auto hidden font-mono text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted xl:block">
            Game route // isolated runtime
          </p>
        )}

        <div className="ml-auto flex items-center gap-1.5 xl:ml-0 xl:gap-2">
          <ModeControl
            isGameMode={isGameMode}
            portfolioReturnHref={portfolioReturnHref}
            onEnterGame={handleEnterGame}
          />

          <ThemeToggle />

          {!isGameMode ? (
            <div className="hidden xl:block">
              <CVAccessDialog buttonClassName="h-11 px-3" />
            </div>
          ) : null}

          {!isGameMode ? (
            <div className="xl:hidden">
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
                  className="w-[min(22rem,calc(100vw-1rem))] gap-0 border-l border-border-strong bg-background p-0 shadow-[-6px_0_0_var(--shadow-soft)]"
                >
                  <SheetHeader className="border-b border-border px-5 py-5 text-left">
                    <span className="font-mono text-xs uppercase tracking-[0.08em] text-primary">
                      Sukhraj Kalon
                    </span>
                    <SheetTitle className="text-xl">Portfolio navigation</SheetTitle>
                    <SheetDescription>
                      Move directly between portfolio sections.
                    </SheetDescription>
                  </SheetHeader>

                  <nav aria-label="Mobile navigation" className="grid p-3">
                    {portfolioNavigation.map((link, index) => {
                      const isActive = activeSection === link.id;

                      return (
                        <SheetClose asChild key={link.id}>
                          <Link
                            href={link.href}
                            aria-current={isActive ? "location" : undefined}
                            className={cn(
                              "group grid min-h-14 grid-cols-[2.5rem_1fr_auto] items-center border-b border-border px-3 font-mono text-sm font-semibold uppercase tracking-[0.04em] transition-colors first:border-t",
                              isActive
                                ? "bg-surface-raised text-primary"
                                : "text-foreground hover:bg-surface",
                            )}
                            onClick={() => setActiveSection(link.id)}
                          >
                            <span className="text-xs text-ink-faint">
                              0{index + 1}
                            </span>
                            {link.label}
                            <span aria-hidden="true" className="text-primary">
                              /&#47;
                            </span>
                          </Link>
                        </SheetClose>
                      );
                    })}
                  </nav>

                  <div className="mt-auto border-t border-border bg-surface p-4">
                    <p className="mb-3 font-mono text-xs uppercase tracking-[0.08em] text-ink-muted">
                      CV access
                    </p>
                    <CVAccessDialogMobile buttonClassName="h-11 bg-background" />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
