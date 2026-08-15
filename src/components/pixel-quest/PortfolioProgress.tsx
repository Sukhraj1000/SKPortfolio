"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  portfolioStoryAnchors,
  type PortfolioStoryAnchor,
} from "@/lib/game-mode";

interface PortfolioProgressValue {
  activeSection: PortfolioStoryAnchor;
  activeIndex: number;
  progress: number;
  selectSection: (section: PortfolioStoryAnchor) => void;
}

const defaultProgress: PortfolioProgressValue = {
  activeSection: portfolioStoryAnchors[0],
  activeIndex: 0,
  progress: 20,
  selectSection: () => undefined,
};

const PortfolioProgressContext =
  React.createContext<PortfolioProgressValue>(defaultProgress);

export function PortfolioProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] =
    React.useState<PortfolioStoryAnchor>(portfolioStoryAnchors[0]);

  React.useEffect(() => {
    if (pathname !== "/" || !("IntersectionObserver" in window)) return;

    const sections = portfolioStoryAnchors.flatMap((sectionId) => {
      const section = document.getElementById(sectionId);
      return section ? [section] : [];
    });
    if (!sections.length) return;

    const visibleSections = new Set<PortfolioStoryAnchor>();
    const syncActiveSection = () => {
      const active = portfolioStoryAnchors.reduce<PortfolioStoryAnchor | null>(
        (current, sectionId) =>
          visibleSections.has(sectionId) ? sectionId : current,
        null,
      );
      if (active) setActiveSection(active);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sectionId = entry.target.id as PortfolioStoryAnchor;
          if (entry.isIntersecting) visibleSections.add(sectionId);
          else visibleSections.delete(sectionId);
        });
        syncActiveSection();
      },
      {
        threshold: 0,
        rootMargin: "-72px 0px -72% 0px",
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [pathname]);

  const activeIndex = portfolioStoryAnchors.indexOf(activeSection);
  const value = React.useMemo<PortfolioProgressValue>(
    () => ({
      activeSection,
      activeIndex,
      progress: (activeIndex + 1) * 20,
      selectSection: setActiveSection,
    }),
    [activeIndex, activeSection],
  );

  return (
    <PortfolioProgressContext.Provider value={value}>
      {children}
    </PortfolioProgressContext.Provider>
  );
}

export function usePortfolioProgress() {
  return React.useContext(PortfolioProgressContext);
}
