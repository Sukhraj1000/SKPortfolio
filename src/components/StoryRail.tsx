"use client";

import * as React from "react";
import Link from "next/link";
import { storyChapters } from "@/data/portfolio";
import { portfolioStoryAnchors } from "@/lib/game-mode";
import { cn } from "@/lib/utils";
import { OperatorSprite } from "@/components/pixel-quest/QuestPrimitives";
import { usePortfolioProgress } from "@/components/pixel-quest/PortfolioProgress";

type RailDirection = "idle" | "up" | "down";

export function StoryRail() {
  const { activeSection, activeIndex, selectSection } = usePortfolioProgress();
  const previousIndexRef = React.useRef(activeIndex);
  const [movement, setMovement] = React.useState<{
    chapter: string;
    direction: RailDirection;
  }>({ chapter: activeSection, direction: "idle" });

  React.useEffect(() => {
    const previousIndex = previousIndexRef.current;
    if (activeIndex === previousIndex) return;

    setMovement({
      chapter: activeSection,
      direction: activeIndex > previousIndex ? "down" : "up",
    });
    previousIndexRef.current = activeIndex;
  }, [activeIndex, activeSection]);

  return (
    <nav className="pq-chapter-rail" aria-label="Portfolio sections">
      <div className="pq-rail-sticky">
        <div className="pq-rail-track">
          <div
            className="pq-rail-operator"
            data-rail-direction={movement.direction}
            data-rail-index={activeIndex}
            style={{ "--rail-index": activeIndex } as React.CSSProperties}
          >
            <span key={movement.chapter} className="pq-rail-operator-cue">
              <OperatorSprite data-rail-operator />
            </span>
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
                    {chapter.portfolioLabel}
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </nav>
  );
}
