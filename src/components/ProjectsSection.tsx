"use client";

import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { Github, Code, Cpu, LayoutGrid } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { TiltCard } from "@/components/ui/tilt-card";
import { LiquidButton } from "@/components/ui/liquid-button";

// CodeBlock component for programmer theme
const CodeBlock = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      className="absolute -z-10 opacity-10 blur-sm pointer-events-none font-mono text-xs sm:text-sm overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.1 }}
      transition={{ duration: 1 }}
    >
      {children}
    </motion.div>
  );
};

// Binary particles effect
const BinaryParticles = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-primary/30 font-mono text-xs select-none"
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: -20, 
            opacity: 0 
          }}
          animate={{ 
            y: "120%", 
            opacity: [0, 0.5, 0],
          }}
          transition={{ 
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear"
          }}
          style={{
            left: `${Math.random() * 100}%`,
          }}
        >
          {Math.random() > 0.5 ? "1" : "0"}
        </motion.div>
      ))}
    </div>
  );
};

// Terminal window component
const TerminalWindow = ({ title, children }: { title: string, children: React.ReactNode }) => {
  return (
    <motion.div 
      className="border border-primary/20 rounded-lg overflow-hidden w-full bg-black/5 dark:bg-black/20 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-secondary/30 p-2 flex items-center border-b border-primary/10">
        <div className="flex space-x-1.5 mr-2">
          <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
        </div>
        <div className="text-xs font-medium text-center w-full">{title}</div>
      </div>
      <div className="p-4 font-mono text-sm">
        {children}
      </div>
    </motion.div>
  );
};

const projects = [
  {
    id: 1,
    title: "Solana Smart Contract Generator",
    description: "A platform that allows developers to easily generate, deploy, and manage Solana smart contracts through an intuitive interface. Making it one of the first existing platforms to do so.",
    image: "/solana.png",
    tags: ["React", "FastAPI", "JavaScript", "Solana", "Web3.js", "Rust"],
    githubUrl: "https://github.com/Sukhraj1000/SmartContractGen",
    feature: "No-code contract generation with customisable forms",
    icon: <Cpu className="h-5 w-5" />
  },
  {
    id: 2,
    title: "Crypto Portfolio Mobile App",
    description: "A cross-platform mobile application for tracking cryptocurrency investments, with real-time price updates, portfolio analytics, and market insights. Providing a demo account for users to track their portfolio.",
    image: "/cryptoapp.png",
    tags: [".Net Maui", "C#", "CoinGecko API", "Chart.js"],
    githubUrl: "https://github.com/Sukhraj1000/CryptoMobileAppPorfolio",
    feature: "Real-time portfolio performance treated as a demo account",
    icon: <LayoutGrid className="h-5 w-5" />
  },
];

// Project card with advanced animation
const ProjectCard = ({ project, index, isInView }: { project: typeof projects[0], index: number, isInView: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: 0.1 * index }}
    >
      <TiltCard 
        className="h-full"
        tiltAmount={5}
      >
        <div className="relative h-full rounded-lg overflow-hidden border border-primary/10 bg-background/50 backdrop-blur-sm shadow-lg group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 z-10"></div>
          
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          
          <div className="relative z-20 p-6">
            <h3 className="text-xl font-bold mb-2">{project.title}</h3>
            <p className="text-muted-foreground mb-4">{project.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex space-x-3 mt-auto">
              {project.githubUrl && (
                <LiquidButton variant="default" size="sm" asChild>
                  <a 
                    href={project.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5"
                  >
                    <Github className="h-3.5 w-3.5" />
                    View on GitHub
                  </a>
                </LiquidButton>
              )}
            </div>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
};

export function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const projectsContainerRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  
  // Create scroll-based animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const bgOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 0.2]);
  
  // Generate code snippets based on project technologies
  const getCodeSnippet = (project: typeof projects[0]) => {
    const tag = project.tags[0]?.toLowerCase() || '';
    
    if (tag.includes('react')) {
      return `
import React, { useState } from 'react';

function App() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => setData(data));
  }, []);

  return (
    <div className="app">
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
      `;
    }
    
    if (tag.includes('vue')) {
      return `
<template>
  <div class="app">
    <div v-for="item in items" :key="item.id">
      {{ item.name }}
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: []
    }
  },
  mounted() {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => this.items = data)
  }
}
</script>
      `;
    }
    
    return `
function initialize() {
  console.log("Loading ${project.title}...");
  
  const config = {
    target: "#app",
    data: {
      title: "${project.title}",
      description: "${project.description}"
    }
  };
  
  return config;
}
    `;
  };

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="py-32 md:py-40 relative overflow-hidden"
    >
      {/* Binary particles in background */}
      <BinaryParticles />
      
      {/* Animated gradient background */}
      <motion.div 
        className="absolute inset-0 gradient-animation -z-10"
        style={{ opacity: bgOpacity }}
      />
      
      {/* Code snippets in background */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        {projects.map((project, i) => (
          <CodeBlock key={i}>
            {getCodeSnippet(project)}
          </CodeBlock>
        ))}
      </div>
      
      {/* Grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none -z-10"></div>
      
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <span className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Featured Projects
            </span>
          </motion.div>
          
          <motion.h2 
            className="text-3xl md:text-5xl font-bold tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            My Recent <span className="text-primary neon-text">Work</span>
          </motion.h2>
          
          <motion.p 
            className="text-muted-foreground max-w-2xl mx-auto text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Here are a few highlighted projects that showcase my expertise in blockchain and crypto development
          </motion.p>
        </motion.div>

        {/* Projects grid with enhanced cards */}
        <motion.div 
          ref={projectsContainerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 xl:gap-10"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {projects.map((project, index) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              index={index} 
              isInView={isInView} 
            />
          ))}
        </motion.div>
        
        {/* Call to action */}
        <motion.div 
          className="text-center mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <TerminalWindow title="terminal">
            <div className="text-sm md:text-base">
              <span className="text-primary mr-2">&gt;</span>
              <span className="text-muted-foreground">Want to see more of my high-level projects? (I&apos;m still learning :D)</span>
              <br />
              <span className="text-primary mr-2">&gt;</span>
              <span className="text-muted-foreground">Check out my GitHub repository for what I&apos;ve been up to</span>
              <motion.span 
                className="inline-block w-2 h-5 bg-primary ml-1"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
            </div>
          </TerminalWindow>
          
          <motion.div 
            className="mt-8"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              className="hover-lift glow-effect px-8" 
              size="lg"
              asChild
            >
              <Link href="https://github.com/Sukhraj1000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                View More Projects
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 