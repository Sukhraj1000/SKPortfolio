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
  const isEven = index % 2 === 1;

  return (
    <article
      id={`mission-${project.id}`}
      data-project-record={project.id}
      aria-labelledby={`mission-${project.id}-title`}
      className="scroll-mt-24 border-t border-border-strong py-10 last:border-b sm:py-14 lg:py-20"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 lg:mb-8">
        <SystemLabel>{`Archive ${recordNumber} / ${project.kind}`}</SystemLabel>
        <div className="flex items-center gap-3">
          <StatusIndicator
            tone={project.status === "Live" ? "active" : "info"}
          >
            {project.status}
          </StatusIndicator>
          {project.grade ? (
            <span className="border border-border-strong bg-surface px-2.5 py-1 font-mono text-xs font-bold text-primary">
              Grade {project.grade}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid items-start gap-8 md:grid-cols-2 lg:gap-14 xl:gap-20">
        <div className={cn(isEven && "md:order-2")}>
          <ProjectMedia project={project} />
        </div>

        <div className={cn("min-w-0", isEven && "md:order-1")}>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-ink-faint">
            {`Mission record // ${recordNumber}`}
          </p>
          <h3
            id={`mission-${project.id}-title`}
            className="text-balance mt-3 text-3xl font-semibold leading-[1.02] tracking-[-0.035em] text-foreground lg:text-5xl"
          >
            {project.title}
          </h3>
          <p className="text-pretty mt-4 text-base leading-7 text-ink-muted lg:text-lg lg:leading-8">
            {project.summary}
          </p>

          <div className="mt-6">
            <MissionLinks project={project} />
          </div>

          <details className="group/details mt-7 border-y border-border bg-surface/60 open:bg-surface">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-3 font-mono text-xs font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:text-primary focus-visible:outline-offset-[-2px] [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2.5">
                <Layers3 aria-hidden="true" className="h-4 w-4 text-primary" />
                Inspect case study
              </span>
              <ArrowDown
                aria-hidden="true"
                className="h-4 w-4 text-primary transition-transform duration-200 group-open/details:rotate-180 motion-reduce:transition-none"
              />
            </summary>

            <div className="grid gap-6 border-t border-border pb-6 pt-5 sm:grid-cols-2">
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
          </details>
        </div>
      </div>
    </article>
  );
}

export function ProjectsSection() {
  return (
    <section id="projects" aria-labelledby="projects-title" className="relative py-24 sm:py-32">
      <div className="site-grid pointer-events-none absolute inset-0 -z-20 opacity-35" />
      <div className="section-shell">
        <SectionHeading
          label={archiveChapter.gameLabel}
          index={archiveChapter.index}
          headingId="projects-title"
          title={archiveChapter.title}
          description={archiveChapter.summary}
        />

        <div className="mt-14 sm:mt-20">
          {portfolioProjects.map((project, index) => (
            <MissionRecord key={project.id} project={project} index={index} />
          ))}
        </div>

        {githubProfile ? (
          <div className="mt-12 flex flex-col items-start justify-between gap-5 border-l-2 border-primary bg-surface px-5 py-5 sm:flex-row sm:items-center sm:px-6">
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
