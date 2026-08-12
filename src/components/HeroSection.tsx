"use client";

import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDownCircle, Github, Linkedin, X, Code, Terminal } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRef, useState, useEffect, useCallback } from "react";

// Terminal text effect component with improved animation and callback when complete
const TerminalText = ({ text, onComplete }: { text: string; onComplete: () => void }) => {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isDone, setIsDone] = useState(false);
  
  // Start typing animation only once
  useEffect(() => {
    if (isTyping || isDone) return;
    
    setIsTyping(true);
    let currentIndex = 0;
    const maxIndex = text.length;
    
    function typeNextChar() {
      if (currentIndex < maxIndex) {
        setDisplayText(text.substring(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeNextChar, 50);
      } else {
        setIsTyping(false);
        setIsDone(true);
        onComplete();
      }
    }
    
    typeNextChar();
  }, [text, onComplete, isTyping, isDone]);
  
  return (
    <div className="font-mono text-sm sm:text-base flex items-start">
      <span className="text-primary mr-2">&gt;</span>
      <span>{displayText}</span>
      <motion.span 
        className="inline-block w-2 h-5 bg-primary ml-1"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ repeat: Infinity, duration: 1 }}
      />
    </div>
  );
};

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);
  
  // Set hero visible after initial delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setHeroVisible(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handler for when typewriter animation completes
  const handleTypewriterComplete = useCallback(() => {
    // This is a placeholder function that does nothing but satisfies the interface
  }, []);
  
  // Create scroll-based animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  return (
    <section 
      id="home" 
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center py-20 overflow-hidden"
    >
      <div className="site-grid pointer-events-none absolute inset-0 opacity-35" />

      <div className="container flex flex-row items-center justify-between z-10 max-w-6xl px-4">
        {/* Text content - fades in from left */}
        <motion.div 
          style={{ opacity, scale, y }} 
          className="flex flex-col items-start text-left max-w-2xl"
          initial={{ opacity: 0, x: -100 }}
          animate={heroVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -100 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-2 text-sm font-medium px-6 py-2 rounded-full bg-primary/10 text-primary backdrop-blur-sm border border-primary/20 flex items-center gap-2"
          >
            <Terminal className="h-4 w-4" />
            <span className="font-mono">Hello, I&apos;m Sukhraj Kalon, a</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 mb-2"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="gradient-text">
                Software Engineer
              </span>
              <motion.span 
                className="inline-block w-3 h-14 bg-primary ml-2"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
            </h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 text-xl text-muted-foreground max-w-2xl"
          >
            <div className="glass-morphism px-4 py-3 rounded-lg">
              {heroVisible && (
                <TerminalText 
                  text="I build secure full-stack products, cloud-backed services, AI automation workflows, and practical systems that turn messy real-world problems into reliable software." 
                  onComplete={handleTypewriterComplete}
                />
              )}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 mt-12"
          >
            <Button size="lg" className="hover-lift hover:shadow-lg hover:shadow-primary/20 px-8 glow-effect group" asChild>
              <Link href="#projects" className="flex items-center gap-2">
                <Code className="h-4 w-4 group-hover:animate-pulse" />
                View My Work
              </Link>
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex items-center gap-8 mt-10"
          >
            {[
              { icon: <Github size={20} />, url: "https://github.com/Sukhraj1000", label: "GitHub" },
              { icon: <Linkedin size={20} />, url: "https://www.linkedin.com/in/sukhraj-kalon-037031252/", label: "LinkedIn" },
              { icon: <X size={20} />, url: "https://x.com/SKalon52254", label: "X" },
            ].map((social, index) => (
              <motion.div 
                key={social.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.1 }}
              >
                <Link 
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {social.icon}
                  <span className="sr-only">{social.label}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        
        {/* Profile Image - fades in from right at the same time as text content */}
        <motion.div
          className="hidden md:block relative"
          initial={{ opacity: 0, x: 100 }}
          animate={heroVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }}
          transition={{ 
            duration: 0.7, 
            ease: "easeOut",
          }}
        >
          <div className="relative w-80 h-80 rounded-full overflow-hidden border-2 border-primary/30 shadow-xl shadow-primary/10">
            <Image 
              src="/profile.png" 
              alt="Profile" 
              fill
              className="object-cover"
            />
            {/* Decorative ring */}
            <motion.div 
              className="absolute inset-0 border-4 border-primary/20 rounded-full z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-background/50" />
          </div>
          
          {/* Decorative elements around profile */}
          <motion.div 
            className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-primary/10 backdrop-blur-md z-[-1]"
            animate={{ 
              y: [0, -10, 0],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-accent/10 backdrop-blur-md z-[-1]"
            animate={{ 
              y: [0, 10, 0],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="absolute bottom-10"
      >
        <Link href="#about" className="text-muted-foreground hover:text-primary transition-colors flex flex-col items-center gap-2 group">
          <span className="text-sm animated-underline font-mono">&lt; Scroll_Down /&gt;</span>
          <ArrowDownCircle size={20} className="float-animation group-hover:text-primary" />
        </Link>
      </motion.div>
    </section>
  );
}
