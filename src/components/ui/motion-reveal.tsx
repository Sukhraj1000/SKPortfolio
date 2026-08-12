"use client";

import * as React from "react";
import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "framer-motion";
import { cn } from "@/lib/utils";
import {
  reducedRevealVariants,
  revealTransition,
  revealVariants,
} from "@/lib/motion";

interface MotionRevealProps extends HTMLMotionProps<"div"> {
  delay?: number;
  once?: boolean;
}

export function MotionReveal({
  className,
  delay = 0,
  once = true,
  children,
  ...props
}: MotionRevealProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      data-slot="motion-reveal"
      className={cn(className)}
      variants={reducedMotion ? reducedRevealVariants : revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.18 }}
      transition={revealTransition(delay, Boolean(reducedMotion))}
      {...props}
    >
      {children}
    </motion.div>
  );
}
