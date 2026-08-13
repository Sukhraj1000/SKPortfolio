import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ExternalLink,
  Github,
  Layers3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PixelFrame } from "@/components/ui/pixel-frame";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { SystemLabel } from "@/components/ui/system-label";
import {
  portfolioProjects,
  socialLinks,
  storyChapters,
  type PortfolioProject,
} from "@/data/portfolio";
import { cn } from "@/lib/utils";

const archiveChapter = storyChapters[1];
const githubProfile = socialLinks.find((social) => social.id === "github");

function ProjectMedia({ project }: { project: PortfolioProject }) {
  return (
    <PixelFrame
      tone="primary"
      raised
      className="project-media-frame overflow-hidden bg-surface-raised"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-3 py-2.5">
        <SystemLabel marker={false} tone="neutral">
          Visual record
        </SystemLabel>
        <span className="font-mono text-[0.625rem] uppercase tracking-[0.1em] text-ink-faint">
          {project.id}
        </span>
      </div>

      <div className="micro-grid relative aspect-[16/10] overflow-hidden bg-background">
        <Image
          src={project.image}
          alt={project.imageAlt}
          fill
          sizes="(min-width: 1024px) 42vw, (min-width: 768px) 46vw, 100vw"
          className={cn(
            "project-media-image object-contain p-6 sm:p-8",
            project.id === "crypto-portfolio" && "p-4 sm:p-5",
          )}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-[linear-gradient(to_top,var(--surface-raised),transparent)] opacity-40"
        />
      </div>
    </PixelFrame>
  );
}

function MissionLinks({ project }: { project: PortfolioProject }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {project.links.map((link) => {
        const Icon = link.kind === "source" ? Github : ExternalLink;

        return (
          <Button
            key={`${project.id}-${link.kind}`}
            variant={link.kind === "live" ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href={link.href} target="_blank" rel="noopener noreferrer">
              <Icon aria-hidden="true" />
              {link.label}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}

function MissionRecord({
  project,
  index,
}: {
  project: PortfolioProject;
  index: number;
}) {
  const recordNumber = String(index + 1).padStart(2, "0");

  return (
    <details
      id={`mission-${project.id}`}
      name="mission-archive"
      open={index === 0}
      data-project-record={project.id}
      className="story-disclosure group/mission scroll-mt-24 border-t border-border-strong bg-background last:border-b open:bg-surface/70"
    >
      <summary className="grid min-h-28 cursor-pointer items-center gap-4 px-3 py-5 transition-colors hover:bg-surface-raised focus-visible:outline-offset-[-3px] sm:grid-cols-[5rem_minmax(0,1fr)_auto] sm:px-5 lg:grid-cols-[8rem_minmax(0,1fr)_auto] lg:gap-7">
        <div className="flex items-center justify-between gap-3 sm:block">
          <span className="font-mono text-xs font-semibold text-primary">
            {recordNumber}
          </span>
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.08em] text-ink-faint sm:mt-2 sm:block">
            {project.kind}
          </span>
        </div>

        <div className="min-w-0">
          <h3
            id={`mission-${project.id}-title`}
            className="text-xl font-semibold leading-tight text-foreground transition-colors group-hover/mission:text-primary sm:text-2xl"
          >
            {project.title}
          </h3>
          <p className="text-pretty mt-2 max-w-3xl text-sm leading-6 text-ink-muted">
            <span className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-primary">
              Result //{" "}
            </span>
            {project.outcome}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div className="flex flex-wrap items-center gap-2">
            <StatusIndicator
              tone={project.status === "Live" ? "active" : "info"}
            >
              {project.status}
            </StatusIndicator>
            {project.grade ? (
              <span className="border border-border-strong bg-surface px-2 py-1 font-mono text-[0.625rem] font-bold text-primary">
                Grade {project.grade}
              </span>
            ) : null}
          </div>
          <ArrowDown
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-primary transition-transform duration-200 group-open/mission:rotate-180 motion-reduce:transition-none"
          />
        </div>
      </summary>

      <div className="story-disclosure-panel border-t border-border px-3 py-6 sm:px-5 sm:py-8">
        <div className="grid items-start gap-7 md:grid-cols-[minmax(18rem,0.85fr)_minmax(0,1.15fr)] lg:gap-10">
          <ProjectMedia project={project} />

          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <Layers3 aria-hidden="true" className="h-4 w-4 text-primary" />
              <SystemLabel marker={false}>Case-study signal</SystemLabel>
            </div>
            <p className="text-pretty mt-3 text-sm leading-6 text-ink-muted sm:text-base sm:leading-7">
              {project.summary}
            </p>

            <div className="mt-5">
              <MissionLinks project={project} />
            </div>

            <div className="mt-6 grid gap-5 border-t border-border pt-5 sm:grid-cols-2">
              <div>
                <h4 className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-primary">
                  01 / Problem
                </h4>
                <p className="mt-2 text-sm leading-6 text-ink-muted">
                  {project.problem}
                </p>
              </div>
              <div>
                <h4 className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-primary">
                  02 / Ownership
                </h4>
                <p className="mt-2 text-sm leading-6 text-ink-muted">
                  {project.contribution}
                </p>
              </div>
              <div>
                <h4 className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-primary">
                  03 / Result
                </h4>
                <p className="mt-2 text-sm leading-6 text-ink-muted">
                  {project.outcome}
                </p>
              </div>
              <div>
                <h4 className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-primary">
                  04 / Technical approach
                </h4>
                <ul
                  aria-label={`${project.title} technologies`}
                  className="mt-2 flex flex-wrap gap-1.5"
                >
                  {project.technologies.map((technology) => (
                    <li
                      key={technology}
                      className="border border-border bg-background px-2 py-1 font-mono text-[0.625rem] text-foreground"
                    >
                      {technology}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </details>
  );
}

export function ProjectsSection() {
  return (
    <section id="projects" aria-labelledby="projects-title" className="relative py-16 sm:py-20 lg:py-24">
      <div className="site-grid pointer-events-none absolute inset-0 -z-20 opacity-35" />
      <div className="section-shell">
        <SectionHeading
          label={archiveChapter.gameLabel}
          index={archiveChapter.index}
          headingId="projects-title"
          title={archiveChapter.title}
          description={archiveChapter.summary}
        />

        <div className="mt-10 sm:mt-12">
          {portfolioProjects.map((project, index) => (
            <MissionRecord key={project.id} project={project} index={index} />
          ))}
        </div>

        {githubProfile ? (
          <div className="mt-8 flex flex-col items-start justify-between gap-5 border-l-2 border-primary bg-surface px-5 py-5 sm:flex-row sm:items-center sm:px-6">
            <div>
              <SystemLabel tone="neutral">Archive continues</SystemLabel>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">
                These four records are the selected evidence. Additional experiments
                and repositories remain available on GitHub.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link
                href={githubProfile.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github aria-hidden="true" />
                View GitHub
              </Link>
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
