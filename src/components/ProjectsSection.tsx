import {
  QuestChapterHeading,
  QuestChip,
  QuestLink,
} from "@/components/pixel-quest/QuestPrimitives";
import {
  portfolioProjects,
  storyChapters,
  type PortfolioProject,
} from "@/data/portfolio";
import { cn } from "@/lib/utils";

const projectsChapter = storyChapters[1];
const featuredProjects = portfolioProjects.slice(0, 2);
const supportingProjects = portfolioProjects.slice(2);

const featuredOverview: Record<
  string,
  readonly [
    { label: string; value: string },
    { label: string; value: string },
    { label: string; value: string },
  ]
> = {
  tymaura: [
    { label: "Status", value: "Production" },
    { label: "Scope", value: "Full product" },
    { label: "Surface", value: "Web platform" },
  ],
  skaltek: [
    { label: "Status", value: "Production" },
    { label: "Scope", value: "AI workflows" },
    { label: "Control", value: "Human review" },
  ],
};

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

function ProjectStage({ project, questNumber }: { project: PortfolioProject; questNumber: string }) {
  const isTymaura = project.id === "tymaura";

  return (
    <div
      className={cn("pq-project-visual", `pq-project-visual-${project.id}`)}
      data-project-media
    >
      <div className="pq-visual-hud">
        <span>
          Mission {questNumber} / {isTymaura ? "Event operations" : "AI systems"}
        </span>
        <strong data-project-status>{project.status}</strong>
      </div>

      <div className="pq-project-media-stage" data-project-media-stage>
        <div className="pq-project-network" aria-hidden="true">
          <i /><i /><i />
        </div>
        <span className="pq-project-node is-a">
          <i>{isTymaura ? "01" : ""}</i><b>{isTymaura ? "Vendors" : "Research"}</b>
        </span>
        <span className="pq-project-node is-b">
          <i>{isTymaura ? "02" : ""}</i><b>{isTymaura ? "Guests" : "Review"}</b>
        </span>
        <span className="pq-project-node is-c">
          <i>{isTymaura ? "03" : ""}</i><b>{isTymaura ? "Admin" : "Delivery"}</b>
        </span>
        <span className="pq-project-node is-d">
          <i>{isTymaura ? "04" : ""}</i><b>{isTymaura ? "Messages" : "Observe"}</b>
        </span>
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
        <span className="pq-project-stage-note">
          {isTymaura
            ? "One coordinated product surface"
            : "Human review remains in the loop"}
        </span>
      </div>

      <div className="pq-visual-footer">
        <span><i /> {isTymaura ? "Production platform" : "Monitored workflows"}</span>
        <strong>{isTymaura ? "tymaura.app" : "skaltek.co.uk"} ↗</strong>
      </div>
    </div>
  );
}

function FeaturedProject({
  project,
  index,
}: {
  project: PortfolioProject;
  index: number;
}) {
  const questNumber = String(index + 1).padStart(2, "0");
  const overview = featuredOverview[project.id] ?? featuredOverview.tymaura;

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
          {overview.map((item) => (
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
          <summary data-disclosure-action>
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

function SupportingProject({
  project,
  index,
}: {
  project: PortfolioProject;
  index: number;
}) {
  const questNumber = String(index + 3).padStart(2, "0");

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
        {project.status}{project.grade ? ` · ${project.grade}` : ""}
      </p>
      <h3 id={`project-${project.id}-title`}>{project.title}</h3>
      <p className="pq-project-summary">{project.summary}</p>
      <p className="pq-side-outcome" data-project-outcome>
        <strong>Outcome:</strong> {project.outcome}
      </p>

      <details className="pq-build-notes" data-disclosure-kind="mission">
        <summary data-disclosure-action>
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
        title={<><span>Projects with</span>{" "}<em>real gravity.</em></>}
        description="Two live products lead the story. Each window shows what the system coordinates, what I owned, and what shipped."
      />

      <div className="pq-featured-quests">
        {featuredProjects.map((project, index) => (
          <FeaturedProject key={project.id} project={project} index={index} />
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
