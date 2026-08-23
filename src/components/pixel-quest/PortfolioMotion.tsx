"use client";

import * as React from "react";

type MotionState = "idle" | "running" | "complete";

const completionDelay: Record<string, number> = {
  "hero-copy": 700,
  "hero-scene": 1_500,
  "hero-console": 800,
  section: 650,
  record: 650,
  "ending-scene": 900,
};

export function PortfolioMotion() {
  React.useEffect(() => {
    const root = document.querySelector<HTMLElement>(".pq-root");
    if (!root) return;

    const targets = [...root.querySelectorAll<HTMLElement>("[data-motion]")];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timers = new Set<number>();
    let observer: IntersectionObserver | null = null;

    const setState = (target: HTMLElement, state: MotionState) => {
      target.dataset.motionState = state;
    };

    const stopEnhancements = () => {
      observer?.disconnect();
      observer = null;
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };

    const completeAll = () => {
      stopEnhancements();
      targets.forEach((target) => setState(target, "complete"));
    };

    const reduce = () => {
      root.dataset.motionMode = "reduced";
      completeAll();
    };

    const enhance = () => {
      if (!("IntersectionObserver" in window)) {
        reduce();
        return;
      }

      stopEnhancements();
      root.dataset.motionMode = "enhanced";
      targets.forEach((target) => setState(target, "idle"));

      const run = (target: HTMLElement) => {
        if (target.dataset.motionState !== "idle") return;
        setState(target, "running");
        const role = target.dataset.motion ?? "record";
        const timer = window.setTimeout(() => {
          setState(target, "complete");
          timers.delete(timer);
        }, completionDelay[role] ?? 650);
        timers.add(timer);
        observer?.unobserve(target);
      };

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) run(entry.target as HTMLElement);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8%" },
      );
      targets.forEach((target) => observer?.observe(target));
    };

    if (reducedMotion.matches) reduce();
    else enhance();

    const handlePreferenceChange = (event: MediaQueryListEvent) => {
      if (event.matches) reduce();
      else enhance();
    };
    const handleVisibilityChange = () => {
      if (document.hidden) completeAll();
    };

    reducedMotion.addEventListener("change", handlePreferenceChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopEnhancements();
      reducedMotion.removeEventListener("change", handlePreferenceChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      delete root.dataset.motionMode;
    };
  }, []);

  return null;
}
