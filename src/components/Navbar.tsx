"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon, FileText, Code, Terminal, Laptop } from "lucide-react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/#", label: "Home", icon: <Terminal className="h-3.5 w-3.5" /> },
  { href: "/#about", label: "About", icon: <Laptop className="h-3.5 w-3.5" /> },
  { href: "/#projects", label: "Projects", icon: <Code className="h-3.5 w-3.5" /> },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [activeLink, setActiveLink] = React.useState("/#");
  const { scrollY } = useScroll();
  
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 5);
  });
  
  // Update active link based on scroll position
  React.useEffect(() => {
    const handleScroll = () => {
      const sections = navLinks.map(link => link.href.replace('/#', '')).filter(Boolean);
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveLink(`/#${section}`);
            break;
          }
        }
      }
      
      // If we're at the top of the page, set Home as active
      if (window.scrollY < 100) {
        setActiveLink("/#");
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        isScrolled 
          ? "bg-background/60 shadow-md shadow-black/5 backdrop-blur-xl border-b border-white/5" 
          : "bg-transparent"
      )}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Glowing line accent when scrolled */}
      {isScrolled && (
        <motion.div 
          className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.8 }}
        />
      )}
      
      {/* Centered navigation bar - enhanced for sleek design */}
      <div className="h-16 w-full flex items-center justify-center">
        <div className="w-full max-w-screen-xl mx-auto px-4 flex justify-center relative">
          {/* Logo on the left for mobile */}
          <motion.div 
            className="absolute left-4 flex md:hidden items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link 
              href="/#" 
              className="text-primary font-bold flex items-center"
              onClick={() => setActiveLink("/#")}
            >
              <span className="text-xl font-mono tracking-tight">DEV</span>
            </Link>
          </motion.div>
          
          {/* Desktop Navigation - Centered with glass effect */}
          <div className="hidden md:flex items-center glass-morphism rounded-full px-4 py-2">
            {navLinks.map((link, index) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "px-5 py-1.5 text-sm font-medium rounded-full transition-all mx-1 flex items-center gap-1.5 group",
                  activeLink === link.href
                    ? "text-white bg-gradient-to-r from-primary to-primary/80 shadow-md shadow-primary/20"
                    : "text-foreground/90 hover:text-white hover:bg-primary/20"
                )}
                onClick={() => setActiveLink(link.href)}
              >
                <motion.span
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index + 0.3 }}
                >
                  {link.icon}
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index + 0.3 }}
                >
                  {link.label}
                </motion.span>
              </Link>
            ))}
          </div>
          
          {/* Right actions */}
          <div className="absolute right-4 flex items-center space-x-3">
            <AnimatePresence>
              {isScrolled && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="hidden md:block mr-2"
                >
                  <Link 
                    href="/#" 
                    className="text-primary font-bold flex items-center"
                    onClick={() => setActiveLink("/#")}
                  >
                    <span className="text-xl font-mono tracking-tight flex items-center">
                      <Terminal className="mr-1 h-4 w-4" />
                      <span className="gradient-text">SK</span>
                    </span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                href="/Sukhrajport_CV.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:block"
              >
                <Button variant="outline" size="sm" className="h-8 text-xs rounded-full border-white/10 glass-morphism hover:border-primary/50 hover:bg-primary/10 transition-all shadow-sm group">
                  <FileText className="mr-1.5 h-3.5 w-3.5 group-hover:text-primary transition-colors" />
                  Resume
                </Button>
              </Link>
            </motion.div>
            
            {/* Mobile menu trigger */}
            <motion.div
              className="md:hidden"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full glass-morphism border border-white/10">
                    <MenuIcon className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent 
                  side="right" 
                  className="w-72 p-0 border-none bg-background/95 backdrop-blur-xl"
                >
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-white/5 mb-2">
                      <SheetHeader className="text-left">
                        <SheetTitle className="text-xl flex items-center">
                          <Terminal className="mr-2 h-5 w-5 text-primary" />
                          <span className="gradient-text">Menu</span>
                        </SheetTitle>
                      </SheetHeader>
                    </div>
                    
                    <nav className="flex flex-col gap-2 p-4">
                      {navLinks.map((link) => (
                        <Link
                          key={link.label}
                          href={link.href}
                          className={cn(
                            "px-3 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                            activeLink === link.href
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-secondary/10"
                          )}
                        >
                          {link.icon}
                          {link.label}
                        </Link>
                      ))}
                    </nav>
                    
                    <div className="mt-auto p-4 border-t border-white/5">
                      <Button variant="outline" className="w-full justify-center rounded-lg glass-morphism" asChild>
                        <Link href="/Sukhrajport_CV.pdf" target="_blank" rel="noopener noreferrer">
                          <FileText className="mr-2 h-4 w-4" /> Resume
                        </Link>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
} 