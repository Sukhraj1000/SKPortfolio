"use client";

import Link from "next/link";
import { storyChapters } from "@/data/portfolio";
import { portfolioStoryAnchors } from "@/lib/game-mode";
import { cn } from "@/lib/utils";
import { OperatorSprite } from "@/components/pixel-quest/QuestPrimitives";
import { usePortfolioProgress } from "@/components/pixel-quest/PortfolioProgress";

export function StoryRail() {
  const { activeSection, selectSection } = usePortfolioProgress();

  return (
    <nav className="pq-chapter-rail" aria-label="Portfolio sections">
      <div className="pq-rail-sticky">
        <div className="pq-rail-operator">
          <OperatorSprite data-rail-operator />
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
    </nav>
  );
}
