"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Github, Code, Cpu, LayoutGrid, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { TiltCard } from "@/components/ui/tilt-card";
import { LiquidButton } from "@/components/ui/liquid-button";

// Terminal window component
const TerminalWindow = ({ title, children }: { title: string, children: React.ReactNode }) => {
  return (
    <motion.div 
      className="w-full overflow-hidden border border-primary/20 bg-surface/90 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-secondary/30 p-2 flex items-center border-b border-primary/10">
        <div className="flex space-x-1.5 mr-2">
          <div className="h-3 w-3 bg-signal-red/70" />
          <div className="h-3 w-3 bg-primary/70" />
          <div className="h-3 w-3 bg-signal-green/70" />
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
    title: "Tymaura",
    description: "A broader event-planning web platform with vendor workflows, authentication, guest RSVP journeys, messaging, and admin readiness controls. Built across frontend, backend, deployment, database workflows, and production QA.",
    image: "/tymaura-logo-card.svg",
    tags: ["React", "TypeScript", "Next.js", "Convex", "Clerk", "Vercel", "Stripe"],
    websiteUrl: "https://tymaura.app",
    feature: "Production-focused vendor, guest, messaging, and admin workflows",
    icon: <LayoutGrid className="h-5 w-5" />
  },
  {
    id: 2,
    title: "Skaltek",
    description: "A freelance software engineering and digital-agent business building high-performance websites, AI automation, and practical lead-generation systems for local UK businesses, with a focus on measurable operational improvements rather than generic agency work.",
    image: "/skaltek-logo-card.png",
    tags: ["Web Development", "AI Automation", "Lead Generation", "Local SEO", "Operations", "QA"],
    websiteUrl: "https://skaltek.co.uk",
    feature: "Websites, automation, and client-acquisition systems for UK businesses",
    icon: <Cpu className="h-5 w-5" />
  },
  {
    id: 3,
    title: "Solana Smart Contract AI Generator",
    description: "Final-year project graded 82%: a platform to generate, compile, test, and analyse Solana smart contracts using AI, with a FastAPI backend, Claude API integration, React frontend, Rust, Anchor, and Solana Devnet testing.",
    image: "/solana.png",
    tags: ["React", "FastAPI", "Claude API", "Solana", "Anchor", "Rust"],
    githubUrl: "https://github.com/Sukhraj1000/SmartContractGen",
    feature: "AI-assisted Solana smart contract generation and testing",
    icon: <Cpu className="h-5 w-5" />
  },
  {
    id: 4,
    title: "Crypto Portfolio Mobile App",
    description: "Independent project graded 80%: a .NET MAUI mobile app for tracking crypto holdings, live price changes, buy/sell activity, real-time portfolio valuation, and transaction management via the CoinGecko API.",
    image: "/cryptoapp.png",
    tags: [".NET MAUI", "C#", "CoinGecko API", "Mobile", "Data Visualisation"],
    githubUrl: "https://github.com/Sukhraj1000/CryptoMobileAppPorfolio",
    feature: "Real-time portfolio valuation and transaction management",
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
              {(project.websiteUrl || project.githubUrl) && (
                <LiquidButton variant="default" size="sm" asChild>
                  <a 
                    href={project.websiteUrl || project.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5"
                  >
                    {project.websiteUrl ? (
                      <ExternalLink className="h-3.5 w-3.5" />
                    ) : (
                      <Github className="h-3.5 w-3.5" />
                    )}
                    {project.websiteUrl ? "View Website" : "View on GitHub"}
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
  
  return (
    <section
      id="projects"
      ref={sectionRef}
      className="py-32 md:py-40 relative overflow-hidden"
    >
      <div className="site-grid pointer-events-none absolute inset-0 -z-10 opacity-20" />
      
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
            A few current and recent builds spanning full-stack products, AI automation, cloud-backed workflows, and applied blockchain development
          </motion.p>
        </motion.div>

        {/* Projects grid with enhanced cards */}
        <motion.div 
          ref={projectsContainerRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 xl:gap-10"
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
              <span className="text-muted-foreground">Want to see more of what I&apos;m building?</span>
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
