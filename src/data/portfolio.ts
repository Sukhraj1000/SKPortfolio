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
  shortTitle: string;
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
  gameLabel: string;
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
  headline: "Building secure products, cloud services, and intelligent automation.",
  journey:
    "From learning how systems work to building dependable products in secure, real-world environments.",
  summary:
    "Software Engineer working across full-stack development, cloud services, data automation, AI-assisted systems, and secure engineering environments.",
  proofPoints: [
    "Software Engineer at Northrop Grumman",
    "First-Class Computer Science graduate",
    "Production product and automation builds",
  ],
} as const;

export const portfolioNavigation = [
  { id: "home", label: "Home", href: "/#home" },
  { id: "projects", label: "Projects", href: "/#projects" },
  { id: "about", label: "Experience", href: "/#about" },
  { id: "contact", label: "Contact", href: "/#contact" },
] as const;

export const storyChapters: readonly StoryChapter[] = [
  {
    id: "briefing",
    index: "01",
    portfolioLabel: "Origin",
    gameLabel: "Briefing Room",
    title: "Start with the person behind the systems.",
    summary:
      "Who Sukhraj is, where he is now, and why practical engineering problems hold his attention.",
    href: "/#home",
  },
  {
    id: "build",
    index: "02",
    portfolioLabel: "Selected Work",
    gameLabel: "Mission Archive",
    title: "Learning by building things that have to work.",
    summary:
      "Products, platforms, and experiments that show increasing ownership from idea through delivery.",
    href: "/#projects",
  },
  {
    id: "progress",
    index: "03",
    portfolioLabel: "Experience",
    gameLabel: "Field Log",
    title: "A path from study into secure engineering.",
    summary:
      "The education, internship, professional roles, and operational work that shaped the engineer behind the portfolio.",
    href: "/#about",
  },
  {
    id: "method",
    index: "04",
    portfolioLabel: "Capabilities",
    gameLabel: "Loadout Bay",
    title: "Tools matter most in how they are applied.",
    summary:
      "Capabilities grouped around solving product, data, cloud, automation, and delivery problems.",
    href: "/#loadout",
  },
  {
    id: "next",
    index: "05",
    portfolioLabel: "Contact",
    gameLabel: "Comms Tower",
    title: "The next chapter starts with a useful problem.",
    summary:
      "A direct route for recruiters, engineering teams, and collaborators to continue the conversation.",
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
    shortTitle: "Tymaura",
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
    shortTitle: "Skaltek",
    kind: "Software and digital operations",
    status: "Live",
    summary:
      "A software engineering and digital-agent business building websites, AI automation, and practical lead-generation systems for local UK businesses.",
    problem:
      "Local businesses need measurable improvements to digital operations and customer acquisition rather than generic agency deliverables.",
    contribution:
      "Delivered websites, automation, lead-generation systems, operational QA, and local search improvements.",
    outcome:
      "A live client-services business focused on practical operational outcomes.",
    image: "/skaltek-logo-card.webp",
    imageAlt: "Skaltek software engineering business logo",
    imageWidth: 960,
    imageHeight: 540,
    imageSrcSet: "/skaltek-logo-card-480.webp 480w, /skaltek-logo-card.webp 960w",
    technologies: [
      "Web Development",
      "AI Automation",
      "Lead Generation",
      "Local SEO",
      "Operations",
      "QA",
    ],
    links: [
      { kind: "live", label: "Visit Skaltek", href: "https://skaltek.co.uk" },
    ],
  },
  {
    id: "solana-contract-generator",
    title: "Solana Smart Contract AI Generator",
    shortTitle: "Solana AI Generator",
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
    shortTitle: "Crypto Portfolio",
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
      "Working across full-stack development, testing, cloud services, and secure software delivery in a regulated engineering environment.",
    highlights: [
      "Build and test scalable applications with TypeScript, Python, AWS, Infrastructure as Code, and PostgreSQL.",
      "Contribute to reliability, maintainability, code review, and Agile delivery practices.",
    ],
    technologies: [
      "TypeScript",
      "Python",
      "AWS",
      "Infrastructure as Code",
      "PostgreSQL",
      "Secure Delivery",
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
    ],
    technologies: [
      "Excel Automation",
      "Reporting Dashboards",
      "Cloudflare",
      "DNS",
      "SSL",
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
    summary: "AI-assisted products and workflow automation grounded in useful outcomes.",
    items: [
      { name: "LLM API Integration", level: "primary" },
      { name: "Workflow Automation", level: "primary" },
      { name: "Browser Automation", level: "supporting" },
      { name: "YOLOv8 / Computer Vision", level: "supporting" },
      { name: "Machine Learning", level: "supporting" },
    ],
  },
  {
    id: "emerging-technology",
    title: "Emerging Technology",
    summary: "Applied experimentation with blockchain, embedded systems, and new platforms.",
    items: [
      { name: "Solana / Anchor", level: "primary" },
      { name: "Rust", level: "supporting" },
      { name: "Solidity / Web3.js", level: "supporting" },
      { name: "Raspberry Pi", level: "supporting" },
      { name: "Project Management", level: "supporting" },
    ],
  },
];

export const contactDetails = {
  location: portfolioProfile.location,
  emailLabel: "Request by email",
  cvRequest:
    "The full CV is shared privately with recruiters, hiring managers, and collaborators.",
} as const;
