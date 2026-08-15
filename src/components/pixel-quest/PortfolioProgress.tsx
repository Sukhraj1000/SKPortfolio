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

  React.useEffect(() => {
    if (pathname !== "/") return;

    const hash = window.location.hash.slice(1);
    if (!portfolioStoryAnchors.includes(hash as PortfolioStoryAnchor)) return;
    const sectionId = hash as PortfolioStoryAnchor;
    let cancelled = false;
    const timers: number[] = [];

    const alignAnchor = () => {
      if (cancelled || window.location.hash !== `#${sectionId}`) return;
      const section = document.getElementById(sectionId);
      if (!section) return;
      const top = section.getBoundingClientRect().top;
      if (top >= 70 && top <= 90) return;

      const previousBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      section.scrollIntoView({ block: "start" });
      document.documentElement.style.scrollBehavior = previousBehavior;
      setActiveSection(sectionId);
    };

    const settleAnchor = async () => {
      try {
        await document.fonts?.ready;
      } catch {
        // Font loading must not block direct chapter navigation.
      }
      if (cancelled) return;
      requestAnimationFrame(() => requestAnimationFrame(alignAnchor));
      timers.push(window.setTimeout(alignAnchor, 250));
    };

    void settleAnchor();
    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [pathname]);

  const activeIndex = portfolioStoryAnchors.indexOf(activeSection);

  React.useEffect(() => {
    const root = document.querySelector<HTMLElement>(".pq-root");
    if (!root) return;
    root.dataset.activeChapter = String(activeIndex + 1).padStart(2, "0");
  }, [activeIndex]);

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
