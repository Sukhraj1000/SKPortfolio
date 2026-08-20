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

function FeaturedProject({
  project,
  index,
}: {
  project: PortfolioProject;
  index: number;
}) {
  const questNumber = String(index + 1).padStart(2, "0");

  return (
    <article
      id={`project-${project.id}`}
      data-project-record={project.id}
      data-project-tier="featured"
      data-motion="record"
      className={cn("pq-project-quest", index % 2 === 1 && "is-reverse")}
      aria-labelledby={`project-${project.id}-title`}
    >
      <div className={cn("pq-project-visual", `pq-project-visual-${project.id}`)} data-project-media>
        <div className="pq-visual-hud">
          <span>Quest {questNumber}</span>
          <strong data-project-status>{project.status}</strong>
        </div>
        <div className="pq-project-media-stage" data-project-media-stage>
          {/* Static export uses the explicit dimensions and optional responsive raster sources below. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.image}
            srcSet={project.imageSrcSet}
            alt={project.imageAlt}
            width={project.imageWidth}
            height={project.imageHeight}
            sizes="(min-width: 1152px) 36vw, (min-width: 768px) 60vw, 100vw"
            loading="lazy"
            decoding="async"
          />
        </div>
        {project.id === "skaltek" ? (
          <div className="pq-signal-orbits" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        ) : (
          <div className="pq-pixel-corners" aria-hidden="true" />
        )}
      </div>

      <div className="pq-project-story" data-project-overview>
        <p className="pq-project-type" data-project-kind>
          {project.kind} / {project.status}
        </p>
        <h3 id={`project-${project.id}-title`}>{project.title}</h3>
        <p className="pq-project-summary">{project.summary}</p>

        <dl className="pq-story-beats">
          <div>
            <dt>Problem</dt>
            <dd>{project.problem}</dd>
          </div>
          <div>
            <dt>My role</dt>
            <dd>{project.contribution}</dd>
          </div>
          <div>
            <dt>Outcome</dt>
            <dd data-project-outcome>{project.outcome}</dd>
          </div>
        </dl>

        <TechnologyList project={project} />
        <ProjectLinks project={project} />
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
      <TechnologyList project={project} />

      <details className="pq-build-notes">
        <summary data-disclosure-action>Read build notes</summary>
        <dl>
          <div>
            <dt>Problem</dt>
            <dd>{project.problem}</dd>
          </div>
          <div>
            <dt>Ownership</dt>
            <dd>{project.contribution}</dd>
          </div>
        </dl>
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
        label="Builds / Projects"
        headingId="projects-title"
        title="Proof lives in what shipped."
        description="Two live products lead the story. Supporting builds show range without competing for the same attention."
      />

      <div className="pq-featured-quests">
        {featuredProjects.map((project, index) => (
          <FeaturedProject key={project.id} project={project} index={index} />
        ))}
      </div>

      <div className="pq-side-quest-heading">
        <span>Optional paths</span>
        <p>Technical builds that expanded the toolkit.</p>
      </div>
      <div className="pq-side-quest-grid">
        {supportingProjects.map((project, index) => (
          <SupportingProject key={project.id} project={project} index={index} />
        ))}
      </div>
    </section>
  );
}
