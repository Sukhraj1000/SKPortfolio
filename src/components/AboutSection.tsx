import { BriefcaseBusiness, CalendarDays, Check, Layers3 } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { SystemLabel } from "@/components/ui/system-label";
import {
  capabilityGroups,
  experience,
  storyChapters,
  type CapabilityGroup,
  type ExperienceEntry,
} from "@/data/portfolio";

const fieldLogChapter = storyChapters[2];
const loadoutChapter = storyChapters[3];
const experienceOrder = [
  "northrop-software-engineer",
  "endeavour-data",
  "northrop-intern",
] as const;

const chronologicalExperience = experienceOrder.flatMap((id) => {
  const entry = experience.find((item) => item.id === id);
  return entry ? [entry] : [];
});

// capabilityGroups is the authoritative current loadout. The former scrolling
// ticker duplicated these entries and included unsubstantiated legacy labels,
// so it is deliberately retired rather than implying that every old label is current.

function CapabilityTags({
  technologies,
  label,
}: {
  technologies: readonly string[];
  label: string;
}) {
  return (
    <ul aria-label={label} className="mt-5 flex flex-wrap gap-1.5">
      {technologies.map((technology) => (
        <li
          key={technology}
          className="border border-border bg-surface px-2 py-1 font-mono text-[0.625rem] text-foreground"
        >
          {technology}
        </li>
      ))}
    </ul>
  );
}

function ExperienceRecord({
  entry,
  index,
}: {
  entry: ExperienceEntry;
  index: number;
}) {
  const recordNumber = String(index + 1).padStart(2, "0");

  return (
    <li
      id={`field-log-${entry.id}`}
      data-experience-record={entry.id}
      className="relative grid scroll-mt-24 gap-5 border-t border-border-strong py-8 last:border-b sm:py-10 md:grid-cols-[10rem_minmax(0,1fr)] lg:grid-cols-[13rem_minmax(0,1fr)]"
    >
      <div>
        <span className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-ink-faint">
          Record {recordNumber}
        </span>
        <p className="mt-2 flex items-center gap-2 font-mono text-xs font-semibold text-primary">
          <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
          <time>{entry.start}</time>
          <span aria-hidden="true">—</span>
          <time>{entry.end}</time>
        </p>
      </div>

      <article aria-labelledby={`field-log-${entry.id}-title`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3
              id={`field-log-${entry.id}-title`}
              className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl"
            >
              {entry.role}
            </h3>
            <p className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-primary sm:text-base">
              <BriefcaseBusiness aria-hidden="true" className="h-4 w-4" />
              {entry.organisation}
            </p>
          </div>
          {entry.current ? (
            <StatusIndicator pulse>Current</StatusIndicator>
          ) : (
            <StatusIndicator tone="idle">Completed</StatusIndicator>
          )}
        </div>

        <p className="text-pretty mt-4 max-w-3xl text-sm leading-6 text-ink-muted sm:text-base sm:leading-7">
          {entry.summary}
        </p>

        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {entry.highlights.map((highlight) => (
            <li
              key={highlight}
              className="flex items-start gap-2.5 border-l border-border pl-3 text-sm leading-6 text-foreground"
            >
              <Check
                aria-hidden="true"
                className="mt-1 h-3.5 w-3.5 shrink-0 text-signal-green"
              />
              {highlight}
            </li>
          ))}
        </ul>

        <CapabilityTags
          technologies={entry.technologies}
          label={`${entry.role} capability tags`}
        />
      </article>
    </li>
  );
}

function CapabilityRecord({
  group,
  index,
}: {
  group: CapabilityGroup;
  index: number;
}) {
  const recordNumber = String(index + 1).padStart(2, "0");
  const primaryItems = group.items.filter((item) => item.level === "primary");
  const supportingItems = group.items.filter(
    (item) => item.level === "supporting",
  );

  return (
    <article
      id={`loadout-${group.id}`}
      data-capability-record={group.id}
      aria-labelledby={`loadout-${group.id}-title`}
      className="border-t border-border-strong py-7 last:border-b sm:py-8"
    >
      <div className="grid gap-5 lg:grid-cols-[3rem_minmax(12rem,0.8fr)_minmax(0,1.2fr)] lg:gap-8">
        <span className="font-mono text-xs text-ink-faint">{recordNumber}</span>
        <div>
          <h3
            id={`loadout-${group.id}-title`}
            className="text-xl font-semibold text-foreground sm:text-2xl"
          >
            {group.title}
          </h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">
            {group.summary}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <h4 className="flex items-center gap-2 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-primary">
              <span aria-hidden="true" className="h-2 w-2 bg-primary" />
              Primary methods
            </h4>
            <ul className="mt-3 grid gap-1.5">
              {primaryItems.map((item) => (
                <li
                  key={item.name}
                  className="border border-primary bg-primary px-2.5 py-1.5 font-mono text-[0.6875rem] font-semibold text-primary-foreground"
                >
                  {item.name}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="flex items-center gap-2 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              <span
                aria-hidden="true"
                className="h-2 w-2 border border-border-strong bg-surface"
              />
              Supporting tools
            </h4>
            <ul className="mt-3 grid gap-1.5">
              {supportingItems.map((item) => (
                <li
                  key={item.name}
                  className="border border-border bg-surface px-2.5 py-1.5 font-mono text-[0.6875rem] text-foreground"
                >
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}

export function AboutSection() {
  return (
    <>
      <section
        id="about"
        data-game-checkpoint="field-log"
        aria-labelledby="field-log-title"
        className="relative py-24 sm:py-32"
      >
        <div className="site-grid pointer-events-none absolute inset-0 -z-20 opacity-35" />
        <div className="section-shell">
          <SectionHeading
            label={fieldLogChapter.gameLabel}
            index={fieldLogChapter.index}
            headingId="field-log-title"
            title={fieldLogChapter.title}
            description={fieldLogChapter.summary}
          />

          <ol className="mt-14 sm:mt-20">
            {chronologicalExperience.map((entry, index) => (
              <ExperienceRecord key={entry.id} entry={entry} index={index} />
            ))}
          </ol>
        </div>
      </section>

      <section
        id="loadout"
        data-game-checkpoint="loadout"
        aria-labelledby="loadout-title"
        className="relative border-y border-border bg-surface py-24 sm:py-32"
      >
        <div className="micro-grid pointer-events-none absolute inset-0 -z-10 opacity-45" />
        <div className="section-shell">
          <SectionHeading
            label={loadoutChapter.gameLabel}
            index={loadoutChapter.index}
            headingId="loadout-title"
            title={loadoutChapter.title}
            description={loadoutChapter.summary}
          />

          <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-l-2 border-primary bg-background px-4 py-3 sm:mt-14">
            <SystemLabel tone="neutral" marker={false}>
              Loadout key
            </SystemLabel>
            <span className="flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.08em] text-foreground">
              <span aria-hidden="true" className="h-2 w-2 bg-primary" />
              Primary capability
            </span>
            <span className="flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.08em] text-ink-muted">
              <span
                aria-hidden="true"
                className="h-2 w-2 border border-border-strong bg-surface"
              />
              Supporting tool
            </span>
          </div>

          <div className="mt-8">
            {capabilityGroups.map((group, index) => (
              <CapabilityRecord key={group.id} group={group} index={index} />
            ))}
          </div>

          <div className="mt-10 flex items-start gap-3 border-l border-border-strong pl-4 text-sm leading-6 text-ink-muted">
            <Layers3
              aria-hidden="true"
              className="mt-1 h-4 w-4 shrink-0 text-primary"
            />
            <p className="max-w-3xl">
              Primary marks the technologies used most directly to deliver the
              capability. Supporting tools remain part of the working method without
              implying a percentage or artificial proficiency score.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
