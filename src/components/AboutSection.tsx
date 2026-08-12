"use client";

import { motion } from "framer-motion";
import { Code, FileText, User, Terminal, GanttChartSquare, Calendar, Monitor, Database, Wrench } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ScrollingText } from "@/components/ui/scrolling-text";
import { CVAccessDialog } from "@/components/CVAccessDialog";

export function AboutSection() {
  const sectionRef = useRef(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [isTabsSticky, setIsTabsSticky] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  
  // Handle sticky tabs
  useEffect(() => {
    const handleScroll = () => {
      if (tabsRef.current) {
        const tabsRect = tabsRef.current.getBoundingClientRect();
        setIsTabsSticky(tabsRect.top <= 80); // 80px for navbar offset
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-32 md:py-40 relative overflow-hidden"
    >
      <div className="site-grid pointer-events-none absolute inset-0 -z-10 opacity-20" />
      
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="container mx-auto max-w-5xl px-4"
      >
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            About Me
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-6"
          >
            My <span className="text-primary neon-text">Background</span> & Skills
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-muted-foreground max-w-2xl text-lg"
          >
            I&apos;m a Software Engineer and First-Class Computer Science graduate building across full-stack web,
            cloud services, AI automation, data workflows, and secure engineering environments.
          </motion.p>
        </div>

        <div 
          ref={tabsRef}
          className={`${isTabsSticky ? 'sticky top-16 z-40 py-4 backdrop-blur-md bg-background/80 border-b border-primary/10 mb-6' : ''} transition-all duration-300 flex justify-center w-full`}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="w-full max-w-md"
          >
            <div className="grid w-full grid-cols-3 overflow-hidden border border-border bg-surface p-1">
              {[
                { value: "personal", label: "Personal", icon: <User className="h-4 w-4" /> },
                { value: "experience", label: "Experience", icon: <FileText className="h-4 w-4" /> },
                { value: "skills", label: "Skills", icon: <Code className="h-4 w-4" /> }
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center justify-center gap-2 py-2 rounded-md transition-all duration-300 text-sm font-medium ${
                    activeTab === tab.value 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-foreground/5"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-8 flex justify-center"
        >
          <div className="w-full max-w-4xl">
            {activeTab === "personal" && (
              <Card className="enhanced-card border-primary/5 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <Terminal className="mr-2 h-6 w-6 text-primary inline-block" />
                    Who I Am
                  </CardTitle>
                  <CardDescription className="text-base">A bit about my background and passion</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-base">
                  <div className="p-4 border border-primary/10 rounded-lg glass-morphism relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-8 bg-primary/10 flex items-center px-4">
                      <div className="flex gap-1.5">
                        <div className="h-3 w-3 bg-signal-red opacity-80" />
                        <div className="h-3 w-3 bg-primary opacity-80" />
                        <div className="h-3 w-3 bg-signal-green opacity-80" />
                      </div>
                      <div className="ml-4 text-xs text-primary-foreground/70 font-mono">about.tsx</div>
                    </div>
                    <div className="mt-8 font-mono text-sm">
                      <div className="text-muted-foreground"><span className="text-primary">const</span> <span className="text-accent">developer</span> = {'{'}</div>
                      <div className="ml-4"><span className="text-muted-foreground">name:</span> <span className="text-signal-green">&apos;Sukhraj Kalon&apos;</span>,</div>
                      <div className="ml-4"><span className="text-muted-foreground">role:</span> <span className="text-signal-green">&apos;Software Engineer&apos;</span>,</div>
                      <div className="ml-4"><span className="text-muted-foreground">focus:</span> <span className="text-signal-green">&apos;Full-stack, cloud, AI automation and secure systems&apos;</span>,</div>
                      <div className="ml-4"><span className="text-muted-foreground">mission:</span> <span className="text-signal-green">&apos;Build reliable software that solves practical problems&apos;</span>,</div>
                      <div>{'};'}</div>
                    </div>
                  </div>
                  
                  <p>
                    I&apos;m a Software Engineer and First-Class Computer Science graduate with hands-on experience across secure full-stack development,
                    cloud services, data automation, AI-assisted systems, and blockchain applications. I enjoy building systems that are technically sound,
                    maintainable, and useful in real operational settings.
                  </p>
                  <p>
                    My recent work spans TypeScript, Python, React, FastAPI, AWS, PostgreSQL, Vercel, Cloudflare, LLM APIs, browser automation,
                    and production-facing product workflows. I&apos;ve worked in regulated engineering teams and also build independent products end-to-end.
                  </p>
                  <p>
                    Outside of coding, I enjoy keeping healthy in the gym, exploring new tech trends, and occasionally watching football. 
                    I&apos;m always up for a challenge, whether it&apos;s debugging or picking up a new skill through hands-on projects.
                  </p>

                  <div className="pt-6">
                    <CVAccessDialog 
                      buttonClassName="hover-lift px-6 glow-effect" 
                      buttonText="Request CV"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
            
            {activeTab === "experience" && (
              <Card className="enhanced-card border-primary/5 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <GanttChartSquare className="mr-2 h-6 w-6 text-primary inline-block" />
                    Work Experience
                  </CardTitle>
                  <CardDescription className="text-base">My professional journey</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Experience Item 1 */}
                  <div className="relative pl-8 pb-6 border-l border-primary/20">
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-primary"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                      <h3 className="text-xl font-bold">Software Engineer</h3>
                      <div className="text-sm text-muted-foreground font-mono inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Sep 2025 - Present</span>
                      </div>
                    </div>
                    <div className="text-primary/90 font-medium mb-2">Northrop Grumman</div>
                    <p className="text-muted-foreground">
                      Working across full-stack development, testing, cloud services, and secure software delivery in a regulated engineering environment.
                      Building and testing scalable applications with TypeScript, Python, AWS, Infrastructure as Code, and PostgreSQL while contributing to
                      reliability, maintainability, code review, and Agile delivery practices.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline" className="bg-primary/10 text-xs border-primary/20">TypeScript</Badge>
                      <Badge variant="outline" className="bg-primary/10 text-xs border-primary/20">Python</Badge>
                      <Badge variant="outline" className="bg-primary/10 text-xs border-primary/20">AWS</Badge>
                      <Badge variant="outline" className="bg-primary/10 text-xs border-primary/20">PostgreSQL</Badge>
                      <Badge variant="outline" className="bg-primary/10 text-xs border-primary/20">Secure Delivery</Badge>
                    </div>
                  </div>

                  {/* Experience Item 2 */}
                  <div className="relative pl-8 pb-6 border-l border-primary/20">
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-primary/80"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                      <h3 className="text-xl font-bold">Software Engineer Intern</h3>
                      <div className="text-sm text-muted-foreground font-mono inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Sep 2023 - Sep 2024</span>
                      </div>
                    </div>
                    <div className="text-primary/90 font-medium mb-2">Northrop Grumman</div>
                    <p className="text-muted-foreground">
                    Worked in an Agile/Scrum software engineering team, contributing to delivery tasks, ceremonies, code reviews, and technical training.
                    Built user-friendly web applications from scratch, wrote clean code across multiple languages, and contributed to secure software practices
                    while working with sensitive data in a regulated engineering environment.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline" className="bg-primary/10 text-xs border-primary/20">JavaScript</Badge>
                      <Badge variant="outline" className="bg-primary/10 text-xs border-primary/20">HTML/CSS</Badge>
                      <Badge variant="outline" className="bg-primary/10 text-xs border-primary/20">React</Badge>
                      <Badge variant="outline" className="bg-primary/10 text-xs border-primary/20">Bash</Badge>
                      <Badge variant="outline" className="bg-primary/10 text-xs border-primary/20">Java</Badge>
                      <Badge variant="outline" className="bg-primary/10 text-xs border-primary/20">Python</Badge>
                      <Badge variant="outline" className="bg-primary/10 text-xs border-primary/20">Spring Boot</Badge>
                      <Badge variant="outline" className="bg-primary/10 text-xs border-primary/20">AWS</Badge>
                      <Badge variant="outline" className="bg-primary/10 text-xs border-primary/20">Jenkins</Badge>
                      <Badge variant="outline" className="bg-primary/10 text-xs border-primary/20">Machine Learning</Badge>
                      <Badge variant="outline" className="bg-primary/10 text-xs border-primary/20">Git</Badge>
                    </div>
                  </div>

                  {/* Experience Item 3 */}
                  <div className="relative pl-8 pb-0">
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-primary/60"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                      <h3 className="text-xl font-bold">Administration & Data Analysis</h3>
                      <div className="text-sm text-muted-foreground font-mono inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Jul 2025 - Present</span>
                      </div>
                    </div>
                    <div className="text-primary/90 font-medium mb-2">Endeavour Restaurants Ltd</div>
                    <p className="text-muted-foreground">
                      Developed Excel-based automation tools for reporting, sales projections, and performance analysis. Configured and troubleshot IT infrastructure
                      including Cloudflare domain management, DNS records, and SSL enforcement, while improving spreadsheet structure and data accuracy.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline" className="bg-primary/10 text-xs border-primary/20">Excel Automation</Badge>
                      <Badge variant="outline" className="bg-primary/10 text-xs border-primary/20">Cloudflare</Badge>
                      <Badge variant="outline" className="bg-primary/10 text-xs border-primary/20">DNS / SSL</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {activeTab === "skills" && (
              <Card className="enhanced-card border-primary/5 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <Code className="mr-2 h-6 w-6 text-primary inline-block" />
                    Technical Skills
                  </CardTitle>
                  <CardDescription className="text-base">Technologies and tools I work with recently</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Frontend Skills */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Monitor className="h-5 w-5 text-primary" />
                        Programming Languages
                      </h3>
                      <div className="space-y-4">
                        {[
                          { skill: "Python", level: 95 },
                          { skill: "TypeScript / JavaScript", level: 90 },
                          { skill: "SQL", level: 85 },
                          { skill: "Java", level: 80 },
                          { skill: "C# / .NET", level: 75 },
                        ].map((item, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{item.skill}</span>
                              <span className="text-muted-foreground font-mono">{item.level}%</span>
                            </div>
                            <div className="w-full h-2 bg-primary/10 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                                initial={{ width: 0 }}
                                whileInView={{ width: `${item.level}%` }}
                                transition={{ duration: 1, delay: 0.2 * i, ease: "easeOut" }}
                                viewport={{ once: true }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Backend Skills */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Database className="h-5 w-5 text-primary" />
                        Frameworks & Technologies
                      </h3>
                      <div className="space-y-4">
                        {[
                          { skill: "React / Next.js", level: 90 },
                          { skill: "FastAPI / REST APIs", level: 85 },
                          { skill: "AWS / Cloud Services", level: 80 },
                          { skill: "AI Automation / LLM APIs", level: 85 },
                          { skill: "PostgreSQL", level: 80 },
                        ].map((item, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{item.skill}</span>
                              <span className="text-muted-foreground font-mono">{item.level}%</span>
                            </div>
                            <div className="w-full h-2 bg-primary/10 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-gradient-to-r from-accent to-primary rounded-full"
                                initial={{ width: 0 }}
                                whileInView={{ width: `${item.level}%` }}
                                transition={{ duration: 1, delay: 0.2 * i, ease: "easeOut" }}
                                viewport={{ once: true }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Tools & Other Skills */}
                  <div className="mt-10">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-primary" />
                      Tools & Environments
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {[
                        "GitHub workflows", "Docker", "Vercel", "Cloudflare", "DNS management", "SSL configuration", "Infrastructure as Code",
                        "Jenkins", "CI/CD", "Linux", "Ubuntu", "Postman", "Excel automation", "Reporting dashboards",
                        "LLM API integration", "Browser automation", "Workflow automation", "YOLOv8", "Computer vision",
                        "Solana", "Anchor", "Rust", "Solidity", "Web3.js", "Raspberry Pi", "Project management"
                      ].map((tool, i) => (
                        <motion.div 
                          key={i}
                          className="px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20 text-sm"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.05 * i }}
                          viewport={{ once: true }}
                        >
                          {tool}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>

        <div className="mt-16 space-y-6">
          <h3 className="text-2xl font-bold">Skills & Technologies</h3>
          
          <ScrollingText 
            speed={15} 
            className="py-4"
          >
            {[
              { name: "JavaScript", category: "language" },
              { name: "TypeScript", category: "language" },
              { name: "React.js", category: "frontend" },
              { name: "Next.js", category: "frontend" },
              { name: "Node.js", category: "backend" },
              { name: "HTML5", category: "frontend" },
              { name: "CSS", category: "frontend" },
              { name: "Redux", category: "frontend" },
              { name: "GraphQL", category: "backend" },
              { name: "Python", category: "language" },
              { name: "Java", category: "language" },
              { name: "MongoDB", category: "database" },
              { name: "PostgreSQL", category: "database" },
              { name: "Express.js", category: "backend" },
              { name: "Git", category: "tool" },
              { name: "Docker", category: "devops" },
              { name: "AWS", category: "cloud" },
              { name: "CI/CD", category: "devops" },
              { name: "Spring Boot", category: "backend" },
              { name: "REST API", category: "backend" },
              { name: "Machine Learning", category: "technology" },
              { name: "Neural Networks", category: "technology" },
              { name: "SQL", category: "database" },
              { name: "C++", category: "language" },
              { name: "C#", category: "language" },
              { name: "Flask", category: "backend" },
              { name: "R Language", category: "language" },
              { name: "Matlab", category: "tool" },
              { name: "Assembly", category: "language" },
              { name: "Bash", category: "tool" },
              { name: "Solidity", category: "blockchain" },
              { name: "Web3.js", category: "blockchain" },
              { name: "FastAPI", category: "backend" },
              { name: "Vercel", category: "cloud" },
              { name: "Cloudflare", category: "cloud" },
              { name: "LLM APIs", category: "technology" },
              { name: "Automation", category: "technology" },
              { name: "Smart Contracts", category: "blockchain" }
            ].map((skill, index) => {
              // Define color based on category
              const categoryColors = {
                language: "bg-signal-cyan/10 border-signal-cyan/30 text-signal-cyan",
                frontend: "bg-primary/10 border-primary/30 text-primary",
                backend: "bg-signal-green/10 border-signal-green/30 text-signal-green",
                database: "bg-primary/10 border-primary/30 text-primary",
                tool: "bg-primary/10 border-primary/30 text-primary",
                devops: "bg-steel/10 border-steel/30 text-ink-muted",
                cloud: "bg-signal-cyan/10 border-signal-cyan/30 text-signal-cyan",
                technology: "bg-signal-green/10 border-signal-green/30 text-signal-green",
                blockchain: "bg-signal-red/10 border-signal-red/30 text-signal-red"
              };
              
              const colorClass = categoryColors[skill.category as keyof typeof categoryColors];
              
              return (
                <motion.div
                  key={index}
                  className={`${colorClass} mx-2 flex h-20 w-36 flex-shrink-0 flex-col items-center justify-center border p-4 text-center transition-transform duration-300 hover:scale-105`}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className="font-medium">{skill.name}</div>
                  <div className="text-xs opacity-70 mt-1 capitalize">{skill.category}</div>
                </motion.div>
              );
            })}
          </ScrollingText>
        </div>
      </motion.div>
    </section>
  );
}
