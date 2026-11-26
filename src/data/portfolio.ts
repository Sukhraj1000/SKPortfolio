type SocialNetwork = "github" | "linkedin" | "x";
type ProjectLinkKind = "live" | "source";

type StoryChapterId = "briefing" | "build" | "progress" | "method" | "next";

export type PortfolioStoryAnchor = "home" | "projects" | "about" | "loadout" | "contact";
type PortfolioProjectId = "tymaura" | "skaltek" | "solana-contract-generator" | "crypto-portfolio";

interface SocialLink {
  id: SocialNetwork;
  label: string;
  href: string;
}

interface ProjectLink {
  kind: ProjectLinkKind;
  label: string;
  href: string;
}

export interface PortfolioProject {
  id: PortfolioProjectId;
  title: string;
  kind: string;
  tier: "featured" | "supporting";
  status: "Live" | "Independent project" | "Final-year project";
  summary: string;
  audience: string;
  scale: string;
  decision: string;
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
  startMonth: string;
  endMonth?: string;
  link?: { label: string; href: string };
  summary: string;
  highlights: readonly string[];
  technologies: readonly string[];
}

interface StoryChapter {
  id: StoryChapterId;
  index: string;
  portfolioLabel: string;
  anchor: PortfolioStoryAnchor;
  href: string;
  railState: string;
  railNote: string;
}

export const portfolioProfile = {
  name: "Sukhraj Kalon",
  initials: "SK",
  role: "Software Engineer",
  location: "West Midlands, UK",
  education: "First-Class Computer Science graduate",
  positioning:
    "I design and deliver secure software and AI-enabled engineering workflows across full-stack applications, cloud platforms, data systems, and automation.",
  storyObjective:
    "Deliver dependable software, make complex systems easier to operate, and keep the engineering evidence clear.",
  toolkit: "Secure software · Cloud · Data · AI systems",
} as const;

export const storyChapters = [
  {
    id: "briefing",
    index: "01",
    portfolioLabel: "Profile",
    anchor: "home",
    href: "/#home",
    railState: "Standing by",
    railNote: "Identity",
  },
  {
    id: "build",
    index: "02",
    portfolioLabel: "Projects",
    anchor: "projects",
    href: "/#projects",
    railState: "Inspecting build",
    railNote: "Selected work",
  },
  {
    id: "progress",
    index: "03",
    portfolioLabel: "Experience",
    anchor: "about",
    href: "/#about",
    railState: "Reviewing record",
    railNote: "Delivery record",
  },
  {
    id: "method",
    index: "04",
    portfolioLabel: "Skills",
    anchor: "loadout",
    href: "/#loadout",
    railState: "Tooling linked",
    railNote: "Working toolkit",
  },
  {
    id: "next",
    index: "05",
    portfolioLabel: "Contact",
    anchor: "contact",
    href: "/#contact",
    railState: "Channel open",
    railNote: "Next step",
  },
] as const satisfies readonly StoryChapter[];

export const portfolioStoryAnchors: readonly PortfolioStoryAnchor[] = storyChapters.map(
  (chapter) => chapter.anchor,
);

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

const tymauraSite = "https://tymaura.app";
const skaltekServices = "https://skaltek.co.uk/services";

// These four IDs are also used by existing game saves.
export const portfolioProjects = [
  {
    id: "tymaura",
    title: "Tymaura",
    kind: "Event-planning platform",
    tier: "featured",
    status: "Live",
    grade: undefined,
    summary:
      "A live event-operations platform for organisers, collaborators, guests, and vendors, covering planning, RSVP and check-in, marketplace bookings, messaging, and admin review.",
    audience: "Organisers, collaborators, guests, and vendors",
    scale: "Event setup through RSVP, live check-in, vendor booking, and follow-up",
    decision:
      "Used Clerk for multi-role identity, Convex for shared real-time state, and Stripe for subscription and payment boundaries.",
    problem:
      "One event crosses private organiser tools, public guest links, live check-in, and vendor transactions, so permissions and event ownership must remain consistent across every route.",
    contribution:
      "Designed and built the Next.js interface, Convex schema and functions, Clerk access boundaries, Stripe tiers, deployment path, and automated domain and browser coverage.",
    outcome:
      "Shipped one live product that carries an event from setup and invitations through guest operations, vendor coordination, and administrative review.",
    image: "/tymaura-logo-card.svg",
    imageAlt: "Tymaura event-planning platform logo",
    imageWidth: 1200,
    imageHeight: 675,
    technologies: ["React", "TypeScript", "Next.js", "Convex", "Clerk", "Vercel", "Stripe"],
    links: [{ kind: "live", label: "Visit Tymaura", href: tymauraSite }],
  },
  {
    id: "skaltek",
    title: "Skaltek",
    kind: "Independent software studio",
    tier: "featured",
    status: "Live",
    grade: undefined,
    summary:
      "An independent studio building websites, staff tools and practical AI for UK businesses.",
    audience: "UK businesses looking for software that fits how their teams work",
    scale: "From a customer-facing website to the tools staff use behind it",
    decision:
      "Start by visiting the team and understanding how they do the work before choosing the software.",
    problem: "Staff can end up entering the same information in several separate tools.",
    contribution:
      "Set up the studio to design websites, connect software and build tools for routine work.",
    outcome: "The studio offers ongoing fixes and updates for the software it builds.",
    image: "/skaltek-logo-card.webp",
    imageAlt: "Skaltek software engineering business logo",
    imageWidth: 960,
    imageHeight: 540,
    imageSrcSet: "/skaltek-logo-card-480.webp 480w, /skaltek-logo-card.webp 960w",
    technologies: ["Web development", "Workflow automation", "AI tools"],
    links: [{ kind: "live", label: "Visit Skaltek", href: skaltekServices }],
  },
  {
    id: "solana-contract-generator",
    title: "Solana Smart Contract AI Generator",
    kind: "AI developer platform",
    tier: "supporting",
    status: "Final-year project",
    grade: "82%",
    summary:
      "A developer tool that turns an escrow or crowdfunding requirement into Rust code, then carries it through Anchor compilation, tests, repair, and deployment preparation.",
    audience: "Developers learning or prototyping Solana and Anchor contract workflows",
    scale:
      "Requirement entry through generation, compilation, testing, analysis, and Devnet preparation",
    decision:
      "Separated the React interface from FastAPI orchestration and fed compiler and test failures back into the repair loop instead of returning unchecked generated code.",
    problem:
      "Generated contract code is not useful if it cannot compile or satisfy its tests, while manually moving between an LLM, Rust tooling, Anchor, and Devnet breaks the feedback loop.",
    contribution:
      "Built the React frontend, FastAPI and Claude orchestration, Rust and Anchor generation path, build-error repair loop, registry interoperability checks, and Solana Devnet tests.",
    outcome:
      "Delivered an 82%-graded final-year system that generated escrow and crowdfunding contracts and exposed their code, build status, tests, and deployment details.",
    image: "/solana.webp",
    imageAlt: "Solana logo used for the smart contract generator project",
    imageWidth: 450,
    imageHeight: 450,
    technologies: ["React", "FastAPI", "Claude API", "Solana", "Anchor", "Rust"],
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
    tier: "supporting",
    status: "Independent project",
    grade: "80%",
    summary:
      "A cross-platform practice app that combines live BTC, ETH, and SOL prices with a virtual balance, simulated trades, watchlists, charts, and portfolio history.",
    audience: "People practising crypto portfolio decisions without risking real funds",
    scale:
      "Account setup, three-asset watchlist, seven-day charts, simulated buy/sell, valuation, and transaction history",
    decision:
      "Used .NET MAUI for one mobile codebase and CoinGecko for current and historical prices; every trade remains virtual and verifies the latest price before execution.",
    problem:
      "New users need to experience live price movement and portfolio accounting without exposing money or assets to a volatile market.",
    contribution:
      "Built registration and login, the virtual-funds ledger, BTC/ETH/SOL quotes, seven-day charts, simulated trade confirmation, watchlists, portfolio calculations, and transaction history.",
    outcome:
      "Delivered an 80%-graded cross-platform practice environment driven by real market data with no real-asset execution.",
    image: "/cryptoapp.webp",
    imageAlt: "Crypto portfolio mobile application showing price history charts",
    imageWidth: 480,
    imageHeight: 782,
    imageSrcSet: "/cryptoapp-240.webp 240w, /cryptoapp.webp 480w",
    technologies: [".NET MAUI", "C#", "CoinGecko API", "Mobile", "Data Visualisation"],
    links: [
      {
        kind: "source",
        label: "View source",
        href: "https://github.com/Sukhraj1000/CryptoMobileAppPorfolio",
      },
    ],
  },
] as const satisfies readonly PortfolioProject[];

interface WorkEntry {
  id: string;
  title: string;
  caption: string;
  href: string;
  action: string;
  preview: { src: string; alt: string; width: number; height: number };
}

export const selectedWork: readonly WorkEntry[] = [
  {
    id: "padel-match-analysis",
    title: "Padel Match Analysis",
    caption:
      "Doubles partners can replay a rally and use court heatmaps to spot the space they left open.",
    action: "Read the build notes",
    href: "https://www.linkedin.com/posts/sukhraj-kalon-037031252_computervision-sportstech-padel-activity-7525482728872517633-HshA",
    preview: {
      src: "/images/work/padel.webp",
      alt: "Court heatmap with the densest clusters of player detections near both ends.",
      width: 768,
      height: 480,
    },
  },
  {
    id: "sketch-clash",
    title: "Sketch Clash",
    caption:
      "I built an island simulation to see how AI agents ask each other for help when a task needs an ability they lack.",
    action: "View source",
    href: "https://github.com/Sukhraj1000/sketch-clash",
    preview: {
      src: "/images/work/sketch-clash.webp",
      alt: "The Sunrise practice island, with paths connecting garden beds and a solar charging dock.",
      width: 768,
      height: 480,
    },
  },
  {
    id: "tymaura",
    title: "Tymaura",
    caption:
      "Event organisers can assign guests to tables and use the same RSVP list for QR check-in at the door.",
    action: "Visit Tymaura",
    href: tymauraSite,
    preview: {
      src: "/images/work/tymaura-invitations.webp",
      alt: "A botanical invitation on a teal envelope beside an RSVP card marked Table 06.",
      width: 960,
      height: 540,
    },
  },
  {
    id: "signaldesk",
    title: "SignalDesk",
    caption: "Run the same market indicators and risk checks from the command line or a REST API.",
    action: "View source",
    href: "https://github.com/Sukhraj1000/signaldesk",
    preview: {
      src: "/images/work/signaldesk-study.webp",
      alt: "A candlestick chart from sample data feeds the same moving-average study to the CLI and API.",
      width: 960,
      height: 540,
    },
  },
  {
    id: "spend-limited-ai-agent-wallet",
    title: "Spend-Limited AI Agent Wallet",
    caption:
      "An AI agent can pay approved merchants with test funds, but the ledger rejects purchases above the owner’s spending limit.",
    action: "View source",
    href: "https://github.com/Sukhraj1000/hackathon-toolkit",
    preview: {
      src: "/images/work/wallet-mandate.webp",
      alt: "A blue mandate card sends two payment paths to a brass gate: one passes and the other stops at the cap.",
      width: 960,
      height: 540,
    },
  },
  {
    id: "fork-fighter",
    title: "Fork Fighter",
    caption:
      "Three AI agents propose rule changes while you play, and a referee picks which one takes effect.",
    action: "View source",
    href: "https://github.com/Sukhraj1000/fork-fighter-live-patch-war",
    preview: {
      src: "/images/work/fork-fighter-directors.webp",
      alt: "Three pixel-art game masters send proposals to a referee; a single platform appears under the runner.",
      width: 960,
      height: 540,
    },
  },
];

export const universityWork = portfolioProjects
  .filter(
    (project) => project.id === "solana-contract-generator" || project.id === "crypto-portfolio",
  )
  .map((project) => ({ id: project.id, title: project.title, href: project.links[0].href }));

export const experience: readonly ExperienceEntry[] = [
  {
    id: "northrop-software-engineer",
    role: "Software Engineer",
    organisation: "Northrop Grumman",
    start: "Sep 2025",
    startMonth: "2025-09",
    end: "Present",
    current: true,
    summary:
      "I build and test cloud software in a regulated environment. I also work with the team on how we use and evaluate AI tools in everyday development.",
    highlights: [
      "Build and test scalable applications using TypeScript, Python, Jinja, AWS, Infrastructure as Code, and PostgreSQL.",
      "Apply agentic and AI-assisted development through coordinated multi-agent systems and human-reviewed engineering workflows.",
      "Use automated testing, code review, and quality gates to improve reliability, maintainability, and delivery confidence.",
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
      "Secure Delivery",
    ],
  },
  {
    id: "skaltek-founder",
    role: "Founder",
    organisation: "Skaltek",
    start: "Jan 2026",
    startMonth: "2026-01",
    end: "Present",
    current: true,
    summary:
      "I run an independent software studio for UK businesses. I work with teams to design, build and support their websites, internal tools and automations.",
    link: { label: "Visit Skaltek", href: skaltekServices },
    highlights: [],
    technologies: ["Web development", "Workflow automation", "AI tools"],
  },
  {
    id: "endeavour-data",
    role: "Administration with Data Analysis, part-time",
    organisation: "Endeavour Restaurants Ltd",
    start: "Jul 2025",
    startMonth: "2025-07",
    end: "Jan 2026",
    endMonth: "2026-01",
    current: false,
    summary:
      "I looked after operational reporting and sales forecasting, and helped keep the restaurant’s web services running.",
    highlights: [
      "Developed Excel automation for reporting, sales projections, and performance analysis.",
      "Configured and troubleshot Cloudflare domains, DNS records, and SSL enforcement.",
      "Maintained spreadsheet workflows and data accuracy for day-to-day operations.",
    ],
    technologies: ["Excel Automation", "Reporting Dashboards", "Cloudflare", "DNS", "SSL"],
  },
  {
    id: "northrop-intern",
    role: "Software Engineer Intern",
    organisation: "Northrop Grumman",
    start: "Sep 2023",
    startMonth: "2023-09",
    end: "Sep 2024",
    endMonth: "2024-09",
    current: false,
    summary:
      "During my placement I worked across backend services and user interfaces, applying computer vision as part of a software engineering team.",
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
    startMonth: "2023-04",
    end: "Jun 2025",
    endMonth: "2025-06",
    current: false,
    summary:
      "I set up and maintained LED display systems for live sport, working with the event crew to keep the screens running throughout fixtures.",
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

// Public skills, grouped as in the CV. No ratings or employer attribution.
export const capabilityGroups = [
  {
    id: "languages",
    title: "Languages",
    items: ["Python", "TypeScript", "JavaScript", "Java", "SQL", "C#", "C++", "Rust", "Bash", "R"],
  },
  {
    id: "application-engineering",
    title: "Web & application development",
    items: [
      "React",
      "Next.js",
      "HTML/CSS",
      "FastAPI",
      "Spring Boot",
      "Flask",
      "Node.js",
      "Fastify",
      "Koa.js",
      ".NET MAUI",
      "Phaser 3",
      "REST APIs",
    ],
  },
  {
    id: "ai-automation",
    title: "AI & automation",
    items: [
      "OpenAI API",
      "Anthropic’s Claude API",
      "Gemini API",
      "Codex",
      "Prompt design",
      "Multi-agent orchestration",
      "Agent memory and evaluation",
      "Daytona sandboxes",
      "Structured output validation",
      "Browser and workflow automation",
    ],
  },
  {
    id: "backend-data",
    title: "Data & reporting",
    items: [
      "PostgreSQL",
      "MongoDB Atlas Vector Search and Change Streams",
      "NumPy",
      "SciPy",
      "Data analysis",
      "Excel automation",
      "Reporting dashboards",
      "Sales forecasting",
    ],
  },
  {
    id: "cloud-delivery",
    title: "Cloud & delivery",
    items: [
      "AWS",
      "Docker",
      "Infrastructure as code",
      "Linux/Ubuntu",
      "Git",
      "Jenkins",
      "GitHub Actions",
      "CI/CD",
      "Cloudflare",
      "Netlify",
      "Vercel",
      "DNS and SSL configuration",
    ],
  },
  {
    id: "testing-quality",
    title: "Testing & quality",
    items: [
      "Unit and integration testing",
      "Playwright",
      "Postman",
      "Cross-browser testing",
      "Accessibility checks",
      "Peer code review",
    ],
  },
  {
    id: "emerging-technology",
    title: "Blockchain",
    items: [
      "Solana",
      "Anchor",
      "Solidity",
      "Web3.js",
      "Daml",
      "Canton",
      "Smart contract development and testing",
    ],
  },
  {
    id: "vision-hardware",
    title: "Computer vision & hardware",
    items: [
      "OpenCV",
      "YOLOv8 object detection",
      "Machine learning",
      "Neural networks",
      "Raspberry Pi and Pi Camera",
      "LED display systems",
      "Data transmission",
    ],
  },
] as const;

export type SkillGroupId = (typeof capabilityGroups)[number]["id"];

export const contactDetails = {
  location: portfolioProfile.location,
  email: "SukhrajKalon@gmail.com",
  emailLabel: "Request by email",
  cvRequest: "The full CV is shared privately with recruiters, hiring managers, and collaborators.",
} as const;
