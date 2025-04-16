"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";

interface ParticlesProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  refresh?: boolean;
  particleColor?: string;
  particleSize?: number;
  speed?: number;
  directionX?: number;
  directionY?: number;
}

class Particle {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  directionX: number;
  directionY: number;
  
  constructor(
    x: number, 
    y: number, 
    size: number, 
    color: string, 
    directionX: number, 
    directionY: number
  ) {
    this.x = this.originalX = x;
    this.y = this.originalY = y;
    this.vx = 0;
    this.vy = 0;
    this.size = size;
    this.color = color;
    this.directionX = directionX;
    this.directionY = directionY;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update(cursorX: number, cursorY: number, staticity: number, ease: number, mouseRadius: number) {
    // Base movement with direction - increased speed for more energetic movement
    this.x += this.directionX * 0.15;
    this.y += this.directionY * 0.15;
    
    // Keep particles within screen bounds with more energetic bouncing
    if (this.x > window.innerWidth || this.x < 0) {
      this.directionX *= -1.2; // Increase bounce energy by 20%
      // Add some random variation to make bouncing more natural
      this.directionY += (Math.random() - 0.5) * 0.5;
    }
    if (this.y > window.innerHeight || this.y < 0) {
      this.directionY *= -1.2; // Increase bounce energy by 20%
      // Add some random variation to make bouncing more natural
      this.directionX += (Math.random() - 0.5) * 0.5;
    }
    
    // Normalize direction if it gets too fast
    const speed = Math.sqrt(this.directionX * this.directionX + this.directionY * this.directionY);
    if (speed > 4) {
      this.directionX = (this.directionX / speed) * 4;
      this.directionY = (this.directionY / speed) * 4;
    }
    
    // Cursor interaction with stronger repulsion
    const dx = cursorX - this.x;
    const dy = cursorY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Increase repulsion effect radius and force
    if (distance < mouseRadius * 1.5) {
      const angle = Math.atan2(dy, dx);
      const force = (mouseRadius * 1.5 - distance) / (mouseRadius * 1.5);
      
      // Stronger repulsion
      this.vx -= Math.cos(angle) * force * 1.2;
      this.vy -= Math.sin(angle) * force * 1.2;
    }
    
    // Apply less easing to velocity for more persistent movement
    this.vx *= ease * 1.05; // Reduce damping for more persistent movement
    this.vy *= ease * 1.05;
    
    this.x += this.vx;
    this.y += this.vy;
  }
}

export function Particles({
  className = "",
  quantity = 50,
  staticity = 50,
  ease = 50,
  particleColor,
  particleSize = 1.5,
  speed = 1,
  directionX = 0,
  directionY = 0,
  refresh = false,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseOver = useRef<boolean>(false);
  const { theme } = useTheme();
  const animationFrameId = useRef<number | null>(null);

  const lightColor = particleColor || "rgba(25, 25, 35, 0.7)";
  const darkColor = particleColor || "rgba(220, 220, 255, 0.85)";

  // Function to render particles
  const render = useCallback(() => {
    if (!context.current || !canvasRef.current) return;
    
    const ctx = context.current;
    const canvas = canvasRef.current;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    for (const particle of particles.current) {
      particle.update(
        mouse.current.x,
        mouse.current.y,
        staticity,
        1 - ease / 100,
        mouseOver.current ? 100 : 0
      );
      particle.draw(ctx);
    }
    
    animationFrameId.current = window.requestAnimationFrame(render);
  }, [staticity, ease]);

  // Initialize particles
  const init = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;
    
    context.current = ctx;
    
    // Set canvas to full screen
    if (canvasContainerRef.current) {
      const container = canvasContainerRef.current;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    } else {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    
    // Create particles
    particles.current = [];
    const particleCount = quantity;
    
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const pColor = theme === "dark" ? darkColor : lightColor;
      // Slightly larger particles
      const pSize = particleSize * (Math.random() * 0.5 + 0.8); 
      // More initial velocity
      const pDirectionX = (Math.random() - 0.5) * speed * 2.5 + directionX;
      const pDirectionY = (Math.random() - 0.5) * speed * 2.5 + directionY;
      
      particles.current.push(new Particle(x, y, pSize, pColor, pDirectionX, pDirectionY));
    }
    
    // Cancel any existing animation frame
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    
    // Start rendering
    render();
  }, [theme, quantity, particleSize, speed, directionX, directionY, lightColor, darkColor, render]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
    }
  }, []);

  const onMouseEnter = useCallback(() => {
    mouseOver.current = true;
  }, []);

  const onMouseLeave = useCallback(() => {
    mouseOver.current = false;
    mouse.current.x = -100;
    mouse.current.y = -100;
  }, []);

  const onResize = useCallback(() => {
    if (canvasRef.current && canvasContainerRef.current) {
      canvasRef.current.width = canvasContainerRef.current.clientWidth;
      canvasRef.current.height = canvasContainerRef.current.clientHeight;
    }
    init();
  }, [init]);

  // Initialize canvas and particles
  useEffect(() => {
    init();
    
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("mousemove", onMouseMove);
      canvas.addEventListener("mouseenter", onMouseEnter);
      canvas.addEventListener("mouseleave", onMouseLeave);
    }
    
    window.addEventListener("resize", onResize);
    
    return () => {
      if (canvas) {
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("mouseenter", onMouseEnter);
        canvas.removeEventListener("mouseleave", onMouseLeave);
      }
      
      window.removeEventListener("resize", onResize);
      
      // Cancel animation frame on cleanup
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [init, onMouseMove, onMouseEnter, onMouseLeave, onResize]);

  // Re-initialize when theme changes or on refresh
  useEffect(() => {
    init();
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [theme, refresh, init]);

  return (
    <div
      ref={canvasContainerRef}
      className={`${className} absolute inset-0 overflow-hidden`}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-auto"
      />
    </div>
  );
} 