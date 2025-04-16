"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useTransform, HTMLMotionProps } from "framer-motion";

interface TiltCardProps {
  children: React.ReactNode;
  glareEnabled?: boolean;
  tiltAmount?: number;
  glareOpacity?: number;
  perspective?: number;
  className?: string;
}

export function TiltCard({
  children,
  glareEnabled = true,
  tiltAmount = 10,
  glareOpacity = 0.15,
  perspective = 1000,
  className,
  ...props
}: TiltCardProps & Omit<HTMLMotionProps<"div">, keyof TiltCardProps>) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Motion values for the tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Smooth springs for the tilt effect
  const springConfig = { damping: 15, stiffness: 150 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [tiltAmount, -tiltAmount]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-tiltAmount, tiltAmount]), springConfig);
  
  // Values for the glare effect
  const glareX = useSpring(useTransform(x, [-0.5, 0.5], [100, 0]), springConfig);
  const glareY = useSpring(useTransform(y, [-0.5, 0.5], [0, 100]), springConfig);
  const glareOpacityValue = useSpring(glareOpacity);

  // Handle mouse move
  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current || isMobile) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate cursor position relative to the card (0 to 1)
    const xPos = (e.clientX - rect.left) / width - 0.5;
    const yPos = (e.clientY - rect.top) / height - 0.5;
    
    // Update motion values
    x.set(xPos);
    y.set(yPos);
    glareOpacityValue.set(glareOpacity);
  }

  // Handle mouse leave
  function onMouseLeave() {
    x.set(0);
    y.set(0);
    glareOpacityValue.set(0);
  }

  return (
    <motion.div
      ref={cardRef}
      className={cn("relative overflow-hidden group", className)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        perspective: perspective,
        transformStyle: "preserve-3d",
      }}
      {...props}
    >
      <motion.div
        className="w-full h-full relative z-10"
        style={{
          rotateX: isMobile ? 0 : rotateX,
          rotateY: isMobile ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </motion.div>

      {glareEnabled && (
        <motion.div
          className="absolute inset-0 w-full h-full pointer-events-none z-20 mix-blend-overlay"
          style={{
            backgroundImage: "linear-gradient(145deg, transparent, rgba(255, 255, 255, 1))",
            backgroundPosition: `${glareX}% ${glareY}%`,
            opacity: glareOpacityValue,
          }}
        />
      )}
    </motion.div>
  );
} 