export type SocialNetwork = "github" | "linkedin" | "x";
export type ProjectLinkKind = "live" | "source";
export type CapabilityLevel = "primary" | "supporting";
export type StoryChapterId =
  | "briefing"
  | "build"
  | "progress"
  | "method"
  | "next";

export interface SocialLink {
  id: SocialNetwork;
  label: string;
  href: string;
}

export interface ProjectLink {
  kind: ProjectLinkKind;
  label: string;
  href: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  kind: string;
  status: "Live" | "Independent project" | "Final-year project";
  summary: string;
  problem: string;
  contribution: string;
  outcome: string;
  image: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  imageSrcSet?: string;
  technologies: readonly string[];
  links: readonly ProjectLink[];
  grade?: string;
}

export interface ExperienceEntry {
  id: string;
  role: string;
  organisation: string;
  start: string;
  end: string;
  current: boolean;
  summary: string;
  highlights: readonly string[];
  technologies: readonly string[];
}

export interface CapabilityItem {
  name: string;
  level: CapabilityLevel;
}

export interface CapabilityGroup {
  id: string;
  title: string;
  summary: string;
  items: readonly CapabilityItem[];
}

export interface StoryChapter {
  id: StoryChapterId;
  index: string;
  portfolioLabel: string;
  title: string;
  summary: string;
  href: string;
}

export const portfolioProfile = {
  name: "Sukhraj Kalon",
  initials: "SK",
  role: "Software Engineer",
  employer: "Northrop Grumman",
  location: "West Midlands, UK",
  education: "First-Class Computer Science graduate",
  positioning:
    "I design and deliver secure software and AI-enabled engineering workflows across full-stack applications, cloud platforms, data systems, and automation.",
  storyObjective:
    "Deliver dependable software, make complex systems easier to operate, and keep the engineering evidence clear.",
  toolkit: "Secure software · Cloud · Data · AI systems",
  summary:
    "Software Engineer and First-Class Computer Science graduate with hands-on experience across secure full-stack development, cloud services, data automation, AI-assisted systems, and blockchain applications.",
} as const;

export const storyChapters: readonly StoryChapter[] = [
  {
    id: "briefing",
    index: "01",
    portfolioLabel: "Profile",
    title: "Software engineer building secure, useful systems.",
    summary:
      "Current role, background, and the engineering work Sukhraj focuses on.",
    href: "/#home",
  },
  {
    id: "build",
    index: "02",
    portfolioLabel: "Projects",
    title: "Selected projects and product work.",
    summary:
      "Production products and technical projects, with outcomes and individual contribution made clear.",
    href: "/#projects",
  },
  {
    id: "progress",
    index: "03",
    portfolioLabel: "Experience",
    title: "Professional experience.",
    summary:
      "Current and previous roles across software engineering, data, and operations.",
    href: "/#about",
  },
  {
    id: "method",
    index: "04",
    portfolioLabel: "Skills",
    title: "Technical skills.",
    summary:
      "Technologies grouped by how they are used across applications, data, cloud, automation, and delivery.",
    href: "/#loadout",
  },
  {
    id: "next",
    index: "05",
    portfolioLabel: "Contact",
    title: "Get in touch.",
    summary:
      "Contact details for recruiters, engineering teams, and relevant collaborators.",
    href: "/#contact",
  },
];

export const socialLinks: readonly SocialLink[] = [
  {
    id: "github",
    label: "GitHub",
    href: "https://github.com/Sukhraj1000",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/sukhraj-kalon-037031252/",
  },
  {
    id: "x",
    label: "X",
    href: "https://x.com/SKalon52254",
  },
];

export const portfolioProjects: readonly PortfolioProject[] = [
  {
    id: "tymaura",
    title: "Tymaura",
    kind: "Event-planning platform",
    status: "Live",
    summary:
      "A production-focused event-planning platform with vendor workflows, authentication, guest RSVP journeys, messaging, and admin readiness controls.",
    problem:
      "Event operations need vendor, guest, messaging, and administrative workflows to remain coordinated across one reliable product.",
    contribution:
      "Built across frontend, backend, deployment, database workflows, and production QA.",
    outcome:
      "A live platform supporting vendor, guest, messaging, and administrative workflows.",
    image: "/tymaura-logo-card.svg",
    imageAlt: "Tymaura event-planning platform logo",
    imageWidth: 1200,
    imageHeight: 675,
    technologies: [
      "React",
      "TypeScript",
      "Next.js",
      "Convex",
      "Clerk",
      "Vercel",
      "Stripe",
    ],
    links: [
      { kind: "live", label: "Visit Tymaura", href: "https://tymaura.app" },
    ],
  },
  {
    id: "skaltek",
    title: "Skaltek",
    kind: "AI systems and product automation",
    status: "Live",
    summary:
      "Independent AI-assisted systems for research, outreach, product, and content workflows, alongside production web delivery for local UK businesses.",
    problem:
      "Small teams need repeatable automation that improves digital operations without removing human review from important decisions.",
    contribution:
      "Built workflows with Python, TypeScript, LLM APIs, prompt and system instructions, browser automation, scheduled agents, logging, QA gates, and human checks.",
    outcome:
      "Reusable AI-assisted workflows with practical monitoring, quality checks, and human oversight.",
    image: "/skaltek-logo-card.webp",
    imageAlt: "Skaltek software engineering business logo",
    imageWidth: 960,
    imageHeight: 540,
    imageSrcSet: "/skaltek-logo-card-480.webp 480w, /skaltek-logo-card.webp 960w",
    technologies: [
      "Python",
      "TypeScript",
      "LLM APIs",
      "Workflow Automation",
      "Browser Automation",
      "GitHub Workflows",
    ],
    links: [
      { kind: "live", label: "Visit Skaltek", href: "https://skaltek.co.uk" },
    ],
  },
  {
    id: "solana-contract-generator",
    title: "Solana Smart Contract AI Generator",
    kind: "AI developer platform",
    status: "Final-year project",
    grade: "82%",
    summary:
      "A platform that generates, compiles, tests, and analyses Solana smart contracts using AI.",
    problem:
      "Writing and validating blockchain programs requires specialist tooling across generation, compilation, testing, and analysis.",
    contribution:
      "Built the React frontend, FastAPI backend, Claude API integration, Rust and Anchor workflow, and Solana Devnet testing path.",
    outcome: "Completed as a final-year Computer Science project graded 82%.",
    image: "/solana.webp",
    imageAlt: "Solana logo used for the smart contract generator project",
    imageWidth: 450,
    imageHeight: 450,
    technologies: [
      "React",
      "FastAPI",
      "Claude API",
      "Solana",
      "Anchor",
      "Rust",
    ],
    links: [
      {
        kind: "source",
        label: "View source",
        href: "https://github.com/Sukhraj1000/SmartContractGen",
      },
    ],
  },
  {
    id: "crypto-portfolio",
    title: "Crypto Portfolio Mobile App",
    kind: "Cross-platform mobile application",
    status: "Independent project",
    grade: "80%",
    summary:
      "A .NET MAUI application for tracking holdings, live price changes, transactions, and real-time crypto portfolio value.",
    problem:
      "Crypto investors need one mobile view for holdings, market prices, buy and sell activity, and transaction history.",
    contribution:
      "Built the cross-platform application, CoinGecko integration, portfolio calculations, transaction management, and data visualisation.",
    outcome: "Completed as an independently delivered project graded 80%.",
    image: "/cryptoapp.webp",
    imageAlt: "Crypto portfolio mobile application showing price history charts",
    imageWidth: 480,
    imageHeight: 782,
    imageSrcSet: "/cryptoapp-240.webp 240w, /cryptoapp.webp 480w",
    technologies: [
      ".NET MAUI",
      "C#",
      "CoinGecko API",
      "Mobile",
      "Data Visualisation",
    ],
    links: [
      {
        kind: "source",
        label: "View source",
        href: "https://github.com/Sukhraj1000/CryptoMobileAppPorfolio",
      },
    ],
  },
];

export const experience: readonly ExperienceEntry[] = [
  {
    id: "northrop-software-engineer",
    role: "Software Engineer",
    organisation: "Northrop Grumman",
    start: "Sep 2025",
    end: "Present",
    current: true,
    summary:
      "Building secure full-stack applications, cloud services, and AI-enabled engineering workflows in a regulated delivery environment.",
    highlights: [
      "Build and test scalable applications using TypeScript, Python, Jinja, AWS, Infrastructure as Code, and PostgreSQL.",
      "Apply agentic and AI-assisted development through multi-agent systems, RAG workflows, and Model Context Protocol integrations.",
      "Use loop and graph engineering, agent evaluations, code review, and quality gates to improve reliability, maintainability, and delivery confidence.",
    ],
    technologies: [
      "TypeScript",
      "Python",
      "Jinja",
      "AWS",
      "Infrastructure as Code",
      "PostgreSQL",
      "Agentic Development",
      "AI-Assisted Development",
      "Multi-Agent Systems",
      "RAG Workflows",
      "Model Context Protocol (MCP)",
      "Loop & Graph Engineering",
      "Agent Evaluations",
      "Secure Delivery",
    ],
  },
  {
    id: "endeavour-data",
    role: "Administration & Data Analysis",
    organisation: "Endeavour Restaurants Ltd",
    start: "Jul 2025",
    end: "Present",
    current: true,
    summary:
      "Developing operational reporting and automation while supporting business IT infrastructure and data quality.",
    highlights: [
      "Develop Excel automation for reporting, sales projections, and performance analysis.",
      "Configure and troubleshoot Cloudflare domains, DNS records, and SSL enforcement.",
      "Maintain spreadsheet workflows and data accuracy for day-to-day operations.",
    ],
    technologies: [
      "Excel Automation",
      "Reporting Dashboards",
      "Cloudflare",
      "DNS",
      "SSL",
    ],
  },
  {
    id: "northrop-intern",
    role: "Software Engineer Intern",
    organisation: "Northrop Grumman",
    start: "Sep 2023",
    end: "Sep 2024",
    current: false,
    summary:
      "Worked in an Agile software engineering team delivering web applications and contributing to secure software practices in a regulated environment.",
    highlights: [
      "Contributed to delivery tasks, ceremonies, code reviews, and technical training.",
      "Built user-facing applications and worked across multiple languages and delivery tools.",
    ],
    technologies: [
      "JavaScript",
      "HTML/CSS",
      "React",
      "Bash",
      "Java",
      "Python",
      "Spring Boot",
      "AWS",
      "Jenkins",
      "Machine Learning",
      "Git",
    ],
  },
  {
    id: "techfront-led-technician",
    role: "LED Technician",
    organisation: "Techfront UK Ltd",
    start: "Apr 2023",
    end: "Jun 2025",
    current: false,
    summary:
      "Installed and supported electrical systems, LED display boards, hardware, and data transmission for live sports and major events.",
    highlights: [
      "Delivered hardware setup and LED display support in time-critical live environments.",
      "Built practical fault awareness and maintained reliable operations under pressure.",
    ],
    technologies: [
      "Electrical Systems",
      "LED Display Systems",
      "Hardware Setup",
      "Data Transmission",
      "Live Event Operations",
    ],
  },
];

export const capabilityGroups: readonly CapabilityGroup[] = [
  {
    id: "application-engineering",
    title: "Application Engineering",
    summary: "User-facing web and mobile products built for maintainable delivery.",
    items: [
      { name: "TypeScript / JavaScript", level: "primary" },
      { name: "Python", level: "primary" },
      { name: "React / Next.js", level: "primary" },
      { name: "Jinja", level: "supporting" },
      { name: "C# / .NET MAUI", level: "supporting" },
      { name: "Java / Spring Boot", level: "supporting" },
      { name: "HTML / CSS", level: "supporting" },
    ],
  },
  {
    id: "backend-data",
    title: "Backend & Data",
    summary: "APIs, databases, reporting systems, and dependable data workflows.",
    items: [
      { name: "FastAPI / REST APIs", level: "primary" },
      { name: "PostgreSQL / SQL", level: "primary" },
      { name: "Convex", level: "supporting" },
      { name: "Excel Automation", level: "supporting" },
      { name: "Reporting Dashboards", level: "supporting" },
      { name: "Postman", level: "supporting" },
    ],
  },
  {
    id: "cloud-delivery",
    title: "Cloud & Delivery",
    summary: "Secure, repeatable delivery across cloud and production environments.",
    items: [
      { name: "AWS / Cloud Services", level: "primary" },
      { name: "Infrastructure as Code", level: "primary" },
      { name: "GitHub Workflows / CI/CD", level: "primary" },
      { name: "Docker", level: "supporting" },
      { name: "Jenkins", level: "supporting" },
      { name: "Vercel", level: "supporting" },
      { name: "Cloudflare / DNS / SSL", level: "supporting" },
      { name: "Linux / Ubuntu", level: "supporting" },
    ],
  },
  {
    id: "ai-automation",
    title: "AI & Automation",
    summary:
      "Agentic systems, retrieval workflows, and evaluated automation grounded in observable outcomes.",
    items: [
      { name: "Agentic Development", level: "primary" },
      { name: "AI-Assisted Development", level: "primary" },
      { name: "Multi-Agent Systems", level: "primary" },
      { name: "RAG Workflows", level: "primary" },
      { name: "LLM API Integration", level: "supporting" },
      { name: "Model Context Protocol (MCP)", level: "supporting" },
      { name: "Loop & Graph Engineering", level: "supporting" },
      { name: "Agent Evaluations", level: "supporting" },
      { name: "Prompt / System Instructions", level: "supporting" },
      { name: "Workflow Automation", level: "supporting" },
      { name: "Browser Automation", level: "supporting" },
      { name: "Automated Testing & QA", level: "supporting" },
      { name: "Claude / Codex / Cursor / Copilot", level: "supporting" },
    ],
  },
  {
    id: "emerging-technology",
    title: "Blockchain & Systems",
    summary: "Applied work across blockchain, embedded hardware, and live technical systems.",
    items: [
      { name: "Solana / Anchor", level: "primary" },
      { name: "Rust", level: "supporting" },
      { name: "Solidity / Web3.js", level: "supporting" },
      { name: "Raspberry Pi", level: "supporting" },
      { name: "Electrical / LED Systems", level: "supporting" },
      { name: "Hardware / Data Transmission", level: "supporting" },
    ],
  },
];

export const contactDetails = {
  location: portfolioProfile.location,
  emailLabel: "Request by email",
  cvRequest:
    "The full CV is shared privately with recruiters, hiring managers, and collaborators.",
} as const;
