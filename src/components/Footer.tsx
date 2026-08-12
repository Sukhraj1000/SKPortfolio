"use client";

import { Github, Linkedin, Mail, X, Terminal, Code, ExternalLink, Cpu } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getObfuscatedEmail } from "@/lib/utils";
import { CVAccessDialog } from "@/components/CVAccessDialog";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  
  // Set the email on the client side to avoid having it in the HTML source
  useEffect(() => {
    setEmail(getObfuscatedEmail());
  }, []);
  
  // Handle email click to avoid direct mailto: link in HTML
  const handleEmailClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    window.location.href = `mailto:${email}`;
  };
  
  return (
    <footer id="contact" className="relative mt-20 scroll-mt-20 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 -z-10 gradient-animation opacity-10" />
      
      {/* Angled divider */}
      <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden -z-10">
        <div className="absolute inset-0 bg-background transform -skew-y-2" />
      </div>
      
      {/* Grid pattern */}
      <div className="site-grid pointer-events-none absolute inset-0 -z-10 opacity-20" />
      
      <div className="container py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="md:col-span-2"
          >
            <Link href="/" className="font-bold text-2xl text-primary flex items-center gap-2">
              <Terminal className="h-6 w-6" />
              <span className="gradient-text font-mono tracking-tight">SK PORTFOLIO</span>
            </Link>
            
            <p className="mt-4 text-muted-foreground max-w-md">
              Software Engineer focused on secure full-stack development, cloud services, AI-assisted automation, and product systems that are practical, reliable, and maintainable.
            </p>
            
            <div className="flex items-center gap-4 mt-8">
              {[
                { icon: <Github className="h-5 w-5" />, url: "https://github.com/Sukhraj1000", label: "GitHub", color: "hover:text-primary" },
                { icon: <Linkedin className="h-5 w-5" />, url: "https://www.linkedin.com/in/sukhraj-kalon-037031252/", label: "LinkedIn", color: "hover:text-signal-cyan" },
                { icon: <X className="h-5 w-5" />, url: "https://x.com/SKalon52254", label: "X", color: "hover:text-sky-500" },
                // Use a click handler instead of direct mailto link for the email
                { icon: <Mail className="h-5 w-5" />, url: "#", label: "Email", color: "hover:text-accent", onClick: handleEmailClick },
              ].map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.url}
                  target={social.onClick ? "_self" : "_blank"}
                  rel="noopener noreferrer"
                  onClick={social.onClick}
                  className={`p-3 rounded-full glass-morphism text-foreground ${social.color} hover-lift transition-all`}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.1 * index 
                  }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  {social.icon}
                  <span className="sr-only">{social.label}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>
          
          <div className="md:col-span-2 md:flex md:justify-end">
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h3 className="font-semibold mb-6 text-lg flex items-center gap-2">
                  <Code className="h-4 w-4 text-primary" />
                  <span>Navigation</span>
                </h3>
                <ul className="space-y-4">
                  {[
                    { href: "#home", label: "Home", icon: <Terminal className="h-4 w-4" /> },
                    { href: "#about", label: "About", icon: <Cpu className="h-4 w-4" /> },
                    { href: "#projects", label: "Projects", icon: <Code className="h-4 w-4" /> },
                  ].map((link) => (
                    <li key={link.href}>
                      <Link 
                        href={link.href} 
                        className="text-muted-foreground hover:text-primary transition-colors group flex items-center gap-2"
                      >
                        <span className="text-primary/50 group-hover:text-primary transition-colors">{link.icon}</span>
                        <span className="animated-underline inline-block">{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <h3 className="font-semibold mb-6 text-lg flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-primary" />
                  <span>Contact</span>
                </h3>
                <ul className="space-y-4">
                  <li className="text-muted-foreground">
                    <span className="block font-medium">West Midlands, UK</span>
                    <span className="text-sm text-muted-foreground/80">United Kingdom</span>
                  </li>
                  <li className="text-muted-foreground">
                    <button 
                      onClick={handleEmailClick}
                      className="hover:text-primary transition-colors group flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4 text-primary/50 group-hover:text-primary transition-colors" />
                      <span className="animated-underline inline-block">
                        {email || "Email Address"}
                      </span>
                    </button>
                  </li>
                  <li className="text-muted-foreground mt-4">
                    <CVAccessDialog 
                      buttonClassName="glass-morphism hover:border-primary/50 text-sm px-4"
                      buttonText="Request CV"
                    />
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-20 flex flex-col items-center justify-between border-t border-border pt-8 sm:flex-row"
        >
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} <span className="text-primary font-mono">Sukhraj Kalon</span>. All rights reserved.
          </p>
          
        </motion.div>
      </div>
    </footer>
  );
}
