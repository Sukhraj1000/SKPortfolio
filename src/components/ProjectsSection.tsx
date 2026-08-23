import {
  QuestChapterHeading,
  QuestChip,
  QuestLink,
} from "@/components/pixel-quest/QuestPrimitives";
import {
  portfolioProjects,
  storyChapters,
  type FeaturedProject,
  type FeaturedProjectId,
  type PortfolioProject,
} from "@/data/portfolio";
import { cn } from "@/lib/utils";

const projectsChapter = storyChapters[1];
const allProjects: readonly PortfolioProject[] = portfolioProjects;
const featuredProjects = allProjects.filter(
  (project): project is FeaturedProject => project.tier === "featured",
);
const supportingProjects = allProjects.filter((project) => project.tier === "supporting");

interface FeaturedProjectPresentation {
  mission: string;
  nodes: readonly [
    { code: string; label: string },
    { code: string; label: string },
    { code: string; label: string },
    { code: string; label: string },
  ];
  stageNote: string;
  footerLabel: string;
  domain: string;
  overview: readonly [
    { label: string; value: string },
    { label: string; value: string },
    { label: string; value: string },
  ];
}

const featuredProjectPresentation = {
  tymaura: {
    mission: "Event operations",
    nodes: [
      { code: "01", label: "Vendors" },
      { code: "02", label: "Guests" },
      { code: "03", label: "Admin" },
      { code: "04", label: "Messages" },
    ],
    stageNote: "One coordinated product surface",
    footerLabel: "Production platform",
    domain: "tymaura.app",
    overview: [
      { label: "Status", value: "Production" },
      { label: "Scope", value: "Full product" },
      { label: "Surface", value: "Web platform" },
    ],
  },
  skaltek: {
    mission: "AI systems",
    nodes: [
      { code: "", label: "Research" },
      { code: "", label: "Review" },
      { code: "", label: "Delivery" },
      { code: "", label: "Observe" },
    ],
    stageNote: "Human review remains in the loop",
    footerLabel: "Monitored workflows",
    domain: "skaltek.co.uk",
    overview: [
      { label: "Status", value: "Production" },
      { label: "Scope", value: "AI workflows" },
      { label: "Control", value: "Human review" },
    ],
  },
} as const satisfies Record<FeaturedProjectId, FeaturedProjectPresentation>;

function ProjectLinks({ project }: { project: PortfolioProject }) {
  return (
    <div className="pq-project-links">
      {project.links.map((link) => (
        <QuestLink
          key={`${project.id}-${link.kind}`}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          variant={link.kind === "live" ? "primary" : "secondary"}
        >
          {link.label} <span aria-hidden="true">↗</span>
        </QuestLink>
      ))}
    </div>
  );
}

function TechnologyList({ project }: { project: PortfolioProject }) {
  return (
    <ul className="pq-tech-list" aria-label={`${project.title} technologies`}>
      {project.technologies.map((technology) => (
        <QuestChip key={technology}>{technology}</QuestChip>
      ))}
    </ul>
  );
}

function DisclosureLabel({ noun }: { noun: string }) {
  return (
    <>
      <span>
        <small>{noun}</small>
        <strong>Engineering details</strong>
      </span>
      <span className="pq-disclosure-state" aria-hidden="true">
        <i />
        <b className="when-closed">Expand</b>
        <b className="when-open">Close</b>
      </span>
    </>
  );
}

function ProjectStage({ project, questNumber }: { project: FeaturedProject; questNumber: string }) {
  const presentation = featuredProjectPresentation[project.id];

  return (
    <div className={cn("pq-project-visual", `pq-project-visual-${project.id}`)} data-project-media>
      <div className="pq-visual-hud" aria-hidden="true">
        <span>
          Mission {questNumber} / {presentation.mission}
        </span>
        <strong data-project-status>{project.status}</strong>
      </div>

      <div className="pq-project-media-stage" data-project-media-stage>
        <div className="pq-project-network" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        {presentation.nodes.map((node, index) => (
          <span
            key={node.label}
            className={cn("pq-project-node", `is-${String.fromCharCode(97 + index)}`)}
            aria-hidden="true"
          >
            <i>{node.code}</i>
            <b>{node.label}</b>
          </span>
        ))}
        <div className="pq-project-media-frame">
          {/* Static export keeps source media intrinsic and uncropped. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.image}
            srcSet={project.imageSrcSet}
            alt={project.imageAlt}
            width={project.imageWidth}
            height={project.imageHeight}
            sizes="(min-width: 1152px) 30vw, (min-width: 768px) 58vw, 82vw"
            loading="lazy"
            decoding="async"
          />
        </div>
        <span className="pq-project-stage-note" aria-hidden="true">
          {presentation.stageNote}
        </span>
      </div>

      <div className="pq-visual-footer" aria-hidden="true">
        <span>
          <i /> {presentation.footerLabel}
        </span>
        <strong>{presentation.domain} ↗</strong>
      </div>
    </div>
  );
}

function FeaturedProjectRecord({ project, index }: { project: FeaturedProject; index: number }) {
  const questNumber = String(index + 1).padStart(2, "0");
  const presentation = featuredProjectPresentation[project.id];

  return (
    <article
      id={`project-${project.id}`}
      data-project-record={project.id}
      data-project-tier="featured"
      data-motion="record"
      className={cn("pq-project-quest", index % 2 === 1 && "is-reverse")}
      aria-labelledby={`project-${project.id}-title`}
    >
      <ProjectStage project={project} questNumber={questNumber} />

      <div className="pq-project-story" data-project-overview>
        <p className="pq-project-type" data-project-kind>
          {project.kind} / {project.status}
        </p>
        <h3 id={`project-${project.id}-title`}>{project.title}</h3>
        <p className="pq-project-summary">{project.summary}</p>

        <ul className="pq-project-snapshot" aria-label={`${project.title} overview`}>
          {presentation.overview.map((item) => (
            <li key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </li>
          ))}
        </ul>

        <p className="pq-project-result" data-project-outcome>
          <span>Result</span>
          {project.outcome}
        </p>
        <ProjectLinks project={project} />

        <details
          name="featured-project-record"
          className="pq-project-details"
          data-disclosure-kind="mission"
        >
          <summary
            data-disclosure-action
            aria-label={`Toggle ${project.title} engineering details`}
          >
            <DisclosureLabel noun="Mission record" />
          </summary>
          <div className="pq-project-details-panel">
            <i className="pq-detail-scan" aria-hidden="true" />
            <dl className="pq-story-beats">
              <div>
                <dt>Problem</dt>
                <dd>{project.problem}</dd>
              </div>
              <div>
                <dt>My contribution</dt>
                <dd>{project.contribution}</dd>
              </div>
              <div>
                <dt>Outcome</dt>
                <dd>{project.outcome}</dd>
              </div>
            </dl>
            <TechnologyList project={project} />
          </div>
        </details>
      </div>
    </article>
  );
}

function SupportingProject({ project, index }: { project: PortfolioProject; index: number }) {
  const questNumber = String(index + featuredProjects.length + 1).padStart(2, "0");

  return (
    <article
      id={`project-${project.id}`}
      data-project-record={project.id}
      data-project-tier="supporting"
      data-motion="record"
      className="pq-side-quest"
      aria-labelledby={`project-${project.id}-title`}
    >
      <span className="pq-side-quest-number" aria-hidden="true">
        {questNumber}
      </span>
      <p className="pq-project-type" data-project-kind data-project-status>
        {project.status}
        {project.grade ? ` · ${project.grade}` : ""}
      </p>
      <h3 id={`project-${project.id}-title`}>{project.title}</h3>
      <p className="pq-project-summary">{project.summary}</p>
      <p className="pq-side-outcome" data-project-outcome>
        <strong>Outcome:</strong> {project.outcome}
      </p>

      <details className="pq-build-notes" data-disclosure-kind="mission">
        <summary data-disclosure-action aria-label={`Toggle ${project.title} engineering details`}>
          <span className="when-closed">Open project record</span>
          <span className="when-open">Close project record</span>
        </summary>
        <div className="pq-build-notes-panel">
          <dl>
            <div>
              <dt>Problem</dt>
              <dd>{project.problem}</dd>
            </div>
            <div>
              <dt>My contribution</dt>
              <dd>{project.contribution}</dd>
            </div>
          </dl>
          <TechnologyList project={project} />
        </div>
      </details>

      <ProjectLinks project={project} />
    </article>
  );
}

export function ProjectsSection() {
  return (
    <section
      id="projects"
      data-chapter="02"
      aria-labelledby="projects-title"
      className="pq-chapter pq-projects-chapter"
    >
      <QuestChapterHeading
        index={projectsChapter.index}
        label="Selected work"
        headingId="projects-title"
        title={
          <>
            <span>Projects with</span> <em>real gravity.</em>
          </>
        }
        description="Two live products lead the story. Each window shows what the system coordinates, what I owned, and what shipped."
      />

      <div className="pq-featured-quests">
        {featuredProjects.map((project, index) => (
          <FeaturedProjectRecord key={project.id} project={project} index={index} />
        ))}
      </div>

      <div className="pq-side-quest-heading">
        <span>Supporting builds</span>
        <p>Concise by default; complete engineering records on demand.</p>
      </div>
      <div className="pq-side-quest-grid">
        {supportingProjects.map((project, index) => (
          <SupportingProject key={project.id} project={project} index={index} />
        ))}
      </div>
    </section>
  );
}
