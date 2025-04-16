"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiquidButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  animate?: boolean;
  asChild?: boolean;
  onClick?: () => void;
}

const blobVariants = {
  rest: {
    scale: 0,
    opacity: 0,
  },
  hover: {
    scale: 1.8,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
};

export function LiquidButton({
  children,
  className,
  variant = "default",
  size = "default",
  animate = true,
  asChild = false,
  onClick,
}: LiquidButtonProps) {
  // Determine classes based on variant and size
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-primary text-primary hover:bg-primary/10",
    ghost: "text-primary hover:bg-primary/10",
  };
  
  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
  };
  
  const buttonStyles = {
    whileHover: "hover",
    initial: "rest",
    animate: animate ? "rest" : undefined,
    onClick,
    className: cn(
      "relative rounded-full font-medium text-sm flex items-center justify-center transition-colors z-10",
      variantClasses[variant],
      sizeClasses[size],
      className
    ),
  };
  
  return (
    <div className="relative inline-block group">
      {asChild ? (
        <motion.div {...buttonStyles}>
          {children}
        </motion.div>
      ) : (
        <motion.button {...buttonStyles} type="button">
          {children}
        </motion.button>
      )}
      
      {/* Liquid blob effect */}
      <motion.div
        className={cn(
          "absolute -inset-1 rounded-full pointer-events-none z-0",
          variant === "default" ? "bg-primary/30" : "bg-primary/10"
        )}
        variants={blobVariants}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
        }}
      />
      
      {/* Radial gradient for extra effect */}
      <motion.div
        className={cn(
          "absolute -inset-3 opacity-0 blur-xl pointer-events-none z-0",
          variant === "default" ? "bg-primary/20" : "bg-primary/5"
        )}
        variants={{
          rest: { opacity: 0 },
          hover: { opacity: 0.7 },
        }}
      />
    </div>
  );
} 