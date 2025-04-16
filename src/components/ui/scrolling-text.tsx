"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface ScrollingTextProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export function ScrollingText({
  children,
  speed = 20,
  className = "",
}: ScrollingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = React.useState(1000); // Default value to prevent 0
  const [duplicatedContent, setDuplicatedContent] = React.useState(2);
  const [isInitialized, setIsInitialized] = React.useState(false);

  useEffect(() => {
    // Skip if refs aren't available
    if (!scrollerRef.current || !containerRef.current) return;
    
    const measureContent = () => {
      // Get container width
      const containerWidth = containerRef.current?.offsetWidth || 1000;
      
      // Get the first content element
      const firstContent = scrollerRef.current?.querySelector(".scroller-content") as HTMLElement;
      if (!firstContent) return;
      
      // Measure content width
      const firstContentWidth = firstContent.offsetWidth || 1000;
      
      if (firstContentWidth > 0) {
        setContentWidth(firstContentWidth);
        
        // Set reasonable number of duplicates
        const duplicatesNeeded = Math.max(2, Math.ceil((containerWidth * 2) / firstContentWidth));
        setDuplicatedContent(duplicatesNeeded);
        
        // Mark initialization complete
        if (!isInitialized) {
          setIsInitialized(true);
        }
      }
    };
    
    // Measure after a short delay to ensure DOM is ready
    const timer = setTimeout(measureContent, 100);
    
    // Handle resize
    const handleResize = () => {
      // Use requestAnimationFrame to throttle
      window.requestAnimationFrame(measureContent);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [isInitialized]);

  // Calculate duration - ensure reasonable defaults
  const duration = contentWidth > 0 ? contentWidth / speed : 50;

  return (
    <div 
      ref={containerRef}
      className={`overflow-hidden w-full ${className}`}
    >
      <motion.div
        ref={scrollerRef}
        className="flex items-center"
        animate={{ x: -contentWidth }}
        initial={{ x: 0 }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: duration,
          ease: "linear",
          repeatDelay: 0,
        }}
        style={{ willChange: "transform" }}
      >
        {/* Original content */}
        <div className="scroller-content flex">
          {children}
        </div>
        
        {/* Duplicated content for continuous scrolling */}
        {Array.from({ length: duplicatedContent }).map((_, i) => (
          <div key={i} className="scroller-content flex">
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
} 