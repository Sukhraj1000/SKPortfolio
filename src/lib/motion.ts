import type { Transition, Variants } from "framer-motion";

export const motionTokens = {
  duration: {
    instant: 0.12,
    fast: 0.2,
    base: 0.36,
    slow: 0.6,
  },
  ease: {
    standard: [0.22, 1, 0.36, 1],
    enter: [0.16, 1, 0.3, 1],
  },
} as const;

export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const reducedRevealVariants: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};

export function revealTransition(delay = 0, reducedMotion = false): Transition {
  if (reducedMotion) {
    return { duration: 0 };
  }

  return {
    duration: motionTokens.duration.slow,
    delay,
    ease: motionTokens.ease.enter,
  };
}
