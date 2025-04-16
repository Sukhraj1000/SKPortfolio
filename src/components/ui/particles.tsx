"use client";

import React, { useRef, useEffect } from "react";
import { useTheme } from "next-themes";

interface ParticlesProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  refresh?: boolean;
  color?: string;
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
    // Base movement with direction
    this.x += this.directionX * 0.05;
    this.y += this.directionY * 0.05;
    
    // Keep particles within screen bounds
    if (this.x > window.innerWidth || this.x < 0) {
      this.directionX *= -1;
    }
    if (this.y > window.innerHeight || this.y < 0) {
      this.directionY *= -1;
    }
    
    // Cursor interaction
    const dx = cursorX - this.x;
    const dy = cursorY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Repulsion effect when cursor is close
    if (distance < mouseRadius) {
      const angle = Math.atan2(dy, dx);
      const force = (mouseRadius - distance) / mouseRadius;
      
      // Calculate repulsion based on force and angle
      this.vx -= Math.cos(angle) * force * 0.5;
      this.vy -= Math.sin(angle) * force * 0.5;
    }
    
    // Apply easing to velocity and position
    this.vx *= ease;
    this.vy *= ease;
    
    this.x += this.vx;
    this.y += this.vy;
  }
}

export function Particles({
  className = "",
  quantity = 50,
  staticity = 50,
  ease = 50,
  color = "#ffffff",
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

  const lightColor = particleColor || "rgba(25, 25, 35, 0.5)";
  const darkColor = particleColor || "rgba(220, 220, 255, 0.7)";

  const init = () => {
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
      const pSize = particleSize;
      const pDirectionX = (Math.random() - 0.5) * speed + directionX;
      const pDirectionY = (Math.random() - 0.5) * speed + directionY;
      
      particles.current.push(new Particle(x, y, pSize, pColor, pDirectionX, pDirectionY));
    }
    
    render();
  };

  const render = () => {
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
    
    window.requestAnimationFrame(render);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
    }
  };

  const onMouseEnter = () => {
    mouseOver.current = true;
  };

  const onMouseLeave = () => {
    mouseOver.current = false;
    mouse.current.x = -100;
    mouse.current.y = -100;
  };

  const onResize = () => {
    if (canvasRef.current && canvasContainerRef.current) {
      canvasRef.current.width = canvasContainerRef.current.clientWidth;
      canvasRef.current.height = canvasContainerRef.current.clientHeight;
    }
    init();
  };

  // Initialize canvas and particles
  useEffect(() => {
    init();
    
    if (canvasRef.current) {
      canvasRef.current.addEventListener("mousemove", onMouseMove);
      canvasRef.current.addEventListener("mouseenter", onMouseEnter);
      canvasRef.current.addEventListener("mouseleave", onMouseLeave);
    }
    
    window.addEventListener("resize", onResize);
    
    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener("mousemove", onMouseMove);
        canvasRef.current.removeEventListener("mouseenter", onMouseEnter);
        canvasRef.current.removeEventListener("mouseleave", onMouseLeave);
      }
      
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Re-initialize when theme changes or on refresh
  useEffect(() => {
    init();
  }, [theme, refresh]);

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