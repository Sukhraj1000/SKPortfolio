"use client";

import * as React from "react";
import Link from "next/link";
import { storyChapters } from "@/data/portfolio";
import { portfolioStoryAnchors } from "@/lib/game-mode";
import { cn } from "@/lib/utils";
import { OperatorSprite } from "@/components/pixel-quest/QuestPrimitives";
import { usePortfolioProgress } from "@/components/pixel-quest/PortfolioProgress";

type RailDirection = "idle" | "up" | "down";
type RailPhase = "settled" | "travelling";

interface RailMovement {
  chapter: string;
  direction: RailDirection;
  phase: RailPhase;
}

const chapterStates = [
  "Standing by",
  "Inspecting build",
  "Reviewing record",
  "Tooling linked",
  "Channel open",
] as const;

const chapterNotes = [
  "Identity",
  "Selected work",
  "Delivery record",
  "Working toolkit",
  "Next step",
] as const;

export function StoryRail() {
  const { activeSection, activeIndex, selectSection } = usePortfolioProgress();
  const previousIndexRef = React.useRef(activeIndex);
  const [movement, setMovement] = React.useState<RailMovement>({
    chapter: activeSection,
    direction: "idle",
    phase: "settled",
  });

  React.useEffect(() => {
    const previousIndex = previousIndexRef.current;
    if (activeIndex === previousIndex) return;

    const direction = activeIndex > previousIndex ? "down" : "up";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    previousIndexRef.current = activeIndex;

    const settle = () => {
      setMovement({ chapter: activeSection, direction, phase: "settled" });
    };

    if (reducedMotion.matches) {
      settle();
      return;
    }

    setMovement({ chapter: activeSection, direction, phase: "travelling" });
    const timer = window.setTimeout(settle, 620);
    const handlePreferenceChange = (event: MediaQueryListEvent) => {
      if (event.matches) settle();
    };
    reducedMotion.addEventListener("change", handlePreferenceChange);

    return () => {
      window.clearTimeout(timer);
      reducedMotion.removeEventListener("change", handlePreferenceChange);
    };
  }, [activeIndex, activeSection]);

  const activeChapter = storyChapters[activeIndex] ?? storyChapters[0];

  return (
    <nav className="pq-chapter-rail" aria-label="Portfolio sections">
      <div className="pq-rail-sticky">
        <p className="pq-rail-caption">Journey map</p>
        <div className="pq-rail-track">
          <div
            className="pq-rail-operator"
            data-rail-direction={movement.direction}
            data-rail-phase={movement.phase}
            data-rail-index={activeIndex}
            data-rail-chapter={activeChapter.index}
            style={{ "--rail-index": activeIndex } as React.CSSProperties}
            aria-hidden="true"
          >
            <span className="pq-rail-trail"><i /><i /><i /></span>
            <span key={movement.chapter} className="pq-rail-operator-cue">
              <OperatorSprite data-rail-operator />
            </span>
            <span className="pq-rail-ping">{activeChapter.index}</span>
          </div>
          <ol>
            {storyChapters.map((chapter, index) => {
              const sectionId = portfolioStoryAnchors[index];
              const active = activeSection === sectionId;
              return (
                <li
                  key={chapter.id}
                  className={cn(active && "is-active")}
                  data-rail-chapter={chapter.index}
                >
                  <Link
                    href={chapter.href}
                    aria-current={active ? "location" : undefined}
                    onClick={() => selectSection(sectionId)}
                  >
                    <span>{chapter.index}</span>
                    <strong>{chapter.portfolioLabel}</strong>
                    <small>{chapterNotes[index]}</small>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="pq-rail-readout" aria-hidden="true">
          <span>Active coordinate</span>
          <strong>{activeChapter.portfolioLabel.toUpperCase()}_{activeChapter.index}</strong>
          <small><i /> {movement.phase === "travelling" ? `Traversing ${movement.direction}` : chapterStates[activeIndex]}</small>
        </div>
      </div>
    </nav>
  );
}
