"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Code, FileText, User, Terminal, GanttChartSquare, Calendar, Monitor, Database, Wrench } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ScrollingText } from "@/components/ui/scrolling-text";
import { CVAccessDialog } from "@/components/CVAccessDialog";

// Code animation component for background effect
const CodeAnimation = () => {
  // Random code snippets
  const codeSnippets = [
    "const { data } = await axios.get('/api')",              // JS
    "useEffect(() => { fetchData(); }, [])",                 // React
    "def preprocess(data): return data.lower()",             // Python
    "std::vector<int> nums = {1, 2, 3};",                     // C++
    "contract Escrow { address public payer; }",             // Solidity
    "let provider = anchor.AnchorProvider.env();",           // Solana / Anchor (Rust)
    "fetch('/endpoint').then(res => res.json())",            // JS Fetch
    "if __name__ == '__main__': app.run()",                  // Python Flask
    "class Solution { public: int add(int a, int b); }",     // C++
    "const [wallet, setWallet] = useState(null)",            // React / Web3
    "msg.sender.transfer(amount);",                          // Solidity
    "pub fn process(ctx: Context<...>, amount: u64) -> Result<()>", // Rust / Solana
    "console.log('Connected to blockchain')",                // JS / Web3
    "pip install -r requirements.txt",                       // Python
    "cargo build-bpf",                                       // Rust / Solana
  ];
  
  return (
    <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none z-0">
      <div className="absolute w-full h-full">
        {codeSnippets.map((snippet, i) => (
          <motion.div
            key={i}
            className="absolute text-primary text-opacity-20 font-mono text-sm whitespace-nowrap"
            initial={{ 
              x: Math.random() > 0.5 ? "100%" : "-100%", 
              y: Math.floor(Math.random() * 100) + "%",
              opacity: 0 
            }}
            animate={{ 
              x: Math.random() > 0.5 ? "-100%" : "100%", 
              opacity: [0, 0.7, 0], 
            }}
            transition={{ 
              repeat: Infinity, 
              duration: Math.random() * 25 + 20,
              delay: Math.random() * 10,
              ease: "linear" 
            }}
            style={{
              top: `${Math.random() * 90}%`,
            }}
          >
            {snippet}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Binary particles animation
const BinaryParticles = () => {
  const particles = Array(20).fill(0).map((_, i) => i);
  
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute text-primary text-opacity-50 font-mono text-xs"
          initial={{ 
            x: `${Math.random() * 100}%`, 
            y: -20,
            opacity: 0 
          }}
          animate={{ 
            y: "120%",
            opacity: [0, 1, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: Math.random() * 15 + 10,
            delay: Math.random() * 5,
            ease: "linear" 
          }}
        >
          {Math.random() > 0.5 ? "1" : "0"}
        </motion.div>
      ))}
    </div>
  );
};

export function AboutSection() {
  const sectionRef = useRef(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [isTabsSticky, setIsTabsSticky] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  
  // Create scroll-based animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const bgOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 0.05]);

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
      {/* Code and binary animations */}
      <CodeAnimation />
      <BinaryParticles />
      
      {/* Animated background */}
      <motion.div 
        className="absolute inset-0 gradient-animation -z-10"
        style={{ opacity: bgOpacity }}
      />
      
      {/* Circle decorations */}
      <div className="absolute top-20 left-10 w-32 h-32 border-2 border-primary/20 rounded-full -z-10 hidden md:block">
        <motion.div 
          className="absolute inset-2 border-t-2 border-primary rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div className="absolute bottom-20 right-10 w-40 h-40 border-2 border-accent/20 rounded-full -z-10 hidden md:block">
        <motion.div 
          className="absolute inset-2 border-t-2 border-accent rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
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
            I&apos;m a passionate developer with a strong foundation in both design and development,
            creating meaningful projects that solve real problems.
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
            <div className="w-full grid grid-cols-3 bg-black/20 rounded-xl border border-white/10 overflow-hidden p-1">
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
                      : "hover:bg-white/5"
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
                        <div className="w-3 h-3 rounded-full bg-red-500 opacity-80"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500 opacity-80"></div>
                      </div>
                      <div className="ml-4 text-xs text-primary-foreground/70 font-mono">about.tsx</div>
                    </div>
                    <div className="mt-8 font-mono text-sm">
                      <div className="text-muted-foreground"><span className="text-primary">const</span> <span className="text-accent">developer</span> = {'{'}</div>
                      <div className="ml-4"><span className="text-muted-foreground">name:</span> <span className="text-green-400">&apos;Sukhraj Kalon&apos;</span>,</div>
                      <div className="ml-4"><span className="text-muted-foreground">passion:</span> <span className="text-green-400">&apos;Building efficient and scalable software&apos;</span>,</div>
                      <div className="ml-4"><span className="text-muted-foreground">background:</span> <span className="text-green-400">&apos;Strong design and development&apos;</span>,</div>
                      <div className="ml-4"><span className="text-muted-foreground">mission:</span> <span className="text-green-400">&apos;Solve real problems with powerful solutions&apos;</span>,</div>
                      <div>{'};'}</div>
                    </div>
                  </div>
                  
                  <p>
                    I&apos;m a Software Developer passionate about leveraging emerging technologies like blockchain, AI, and smart contracts 
                    to build innovative, scalable, and secure solutions. I enjoy creating systems that are both technically sound and 
                    practically impactful.
                  </p>
                  <p>
                    My journey started with a fascination for problem-solving and automation. Over time, I&apos;ve worked across multiple 
                    languages—JavaScript, Python, C++, and Rust—while diving deep into blockchain development.
                  </p>
                  <p>
                    Outside of coding, I enjoy keeping healthy in the gym, exploring new tech trends, and occasionally watching football. 
                    I&apos;m always up for a challenge, whether it&apos;s debugging or picking up a new skill through hands-on projects.
                  </p>

                  <div className="pt-6">
                    <CVAccessDialog 
                      buttonClassName="hover-lift px-6 glow-effect" 
                      buttonText="Download Resume"
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
                      <h3 className="text-xl font-bold">LED Technician (Part-Time)</h3>
                      <div className="text-sm text-muted-foreground font-mono inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>2022 - Present</span>
                      </div>
                    </div>
                    <div className="text-primary/90 font-medium mb-2">Infield Sports UK Ltd</div>
                    <p className="text-muted-foreground">
                      I&apos;ve refined my expertise in electrical systems and data transmission 
                      through hands-on experience with LED advertisement boards, particularly 
                      in dynamic environments like football, rugby, and other major sports events, 
                      which has deepened my understanding of hardware complexities and real-time operations.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline" className="bg-primary/10 text-xs border-primary/20">Data Transmission</Badge>
                      <Badge variant="outline" className="bg-primary/10 text-xs border-primary/20">Electrical Systems</Badge>
                    </div>
                  </div>

                  {/* Experience Item 2 */}
                  <div className="relative pl-8 pb-6 border-l border-primary/20">
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-primary/80"></div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                      <h3 className="text-xl font-bold">Software Engineer Intern</h3>
                      <div className="text-sm text-muted-foreground font-mono inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>2023 - 2024</span>
                      </div>
                    </div>
                    <div className="text-primary/90 font-medium mb-2">Northrop Grumman</div>
                    <p className="text-muted-foreground">
                    During my software engineering internship, I gained valuable real-world experience.
                    I practiced agile team processes and collaborated effectively within a team 
                    environment. I participated in code reviews, completed tasks, and attended training 
                    opportunities to enhance my technical and team skills. I also contributed to building 
                    user-friendly web applications from scratch and emerged in improving existing tools, 
                    which helped the average developer run their sessions more efficiently. Throughout my internship,
                    I learned to write clean and dynamic code, leveraging expertise across multiple programming languages to meet 
                    project requirements.
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
                      <h3 className="text-xl font-bold">Media Assistant</h3>
                      <div className="text-sm text-muted-foreground font-mono inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>2018 - 2024</span>
                      </div>
                    </div>
                    <div className="text-primary/90 font-medium mb-2">GrandSinghMusic</div>
                    <p className="text-muted-foreground">
                    In my role overseeing promotion planning, I managed our social media
                     presence and booking inquiries, growing our following from 2,000 to 8,000
                      organically in just a few months while fostering a strong online community. 
                      I also handle administrative tasks like managing client queries, processing deposits, 
                      and sending payment reminders, alongside coordinating photography and videography 
                      setups to ensure smooth and professional operations for every event.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline" className="bg-primary/10 text-xs border-primary/20">Consulting</Badge>
                      <Badge variant="outline" className="bg-primary/10 text-xs border-primary/20">Customer Service</Badge>
                      <Badge variant="outline" className="bg-primary/10 text-xs border-primary/20">Social Media</Badge>
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
                          { skill: "JavaScript", level: 90 },
                          { skill: "C++", level: 85 },
                          { skill: "Java", level: 80 },
                          { skill: "C#", level: 75 },
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
                          { skill: "React", level: 90 },
                          { skill: "Machine Learning", level: 85 },
                          { skill: "Neural Networks", level: 80 },
                          { skill: "SQL", level: 85 },
                          { skill: "AWS", level: 80 },
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
                        "Windows", "Mac", "Linux", "Ubuntu", "Amazon Web Services", "Raspberry Pi",  
                        "Jenkins", "Docker", "Postman", "Vercel", "Solidity", "Web3.js", 
                        "CSS", ".NET", "Spring Boot", "Flask", "R Language", "Matlab", 
                        "Assembly code", "Bash", "Excel (ICDL Certification)", "Word", "PowerPoint", 
                        "Outlook", "Teams", "Project Management", "Smart Contracts"
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
              { name: "Smart Contracts", category: "blockchain" }
            ].map((skill, index) => {
              // Define color based on category
              const categoryColors = {
                language: "from-blue-500/20 to-blue-700/20 border-blue-500/30 text-blue-400",
                frontend: "from-purple-500/20 to-purple-700/20 border-purple-500/30 text-purple-400",
                backend: "from-green-500/20 to-green-700/20 border-green-500/30 text-green-400",
                database: "from-yellow-500/20 to-yellow-700/20 border-yellow-500/30 text-yellow-400",
                tool: "from-orange-500/20 to-orange-700/20 border-orange-500/30 text-orange-400",
                devops: "from-pink-500/20 to-pink-700/20 border-pink-500/30 text-pink-400",
                cloud: "from-cyan-500/20 to-cyan-700/20 border-cyan-500/30 text-cyan-400",
                technology: "from-indigo-500/20 to-indigo-700/20 border-indigo-500/30 text-indigo-400",
                blockchain: "from-red-500/20 to-red-700/20 border-red-500/30 text-red-400"
              };
              
              const colorClass = categoryColors[skill.category as keyof typeof categoryColors];
              
              return (
                <motion.div
                  key={index}
                  className={`bg-gradient-to-br ${colorClass} backdrop-blur-md border rounded-xl mx-2 p-4 h-20 w-36 flex-shrink-0 flex flex-col items-center justify-center text-center hover:scale-110 transition-all duration-300`}
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