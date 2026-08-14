import {
  ArrowDown,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Layers3,
} from "lucide-react";
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

const experienceChapter = storyChapters[2];
const skillsChapter = storyChapters[3];
const experienceOrder = [
  "northrop-software-engineer",
  "endeavour-data",
  "northrop-intern",
  "techfront-led-technician",
] as const;

const chronologicalExperience = experienceOrder.flatMap((id) => {
  const entry = experience.find((item) => item.id === id);
  return entry ? [entry] : [];
});

// capabilityGroups is the authoritative current skills list. The former scrolling
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
          className="border border-border bg-surface px-2 py-1 font-mono text-sm text-foreground"
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
      className="scroll-mt-24 border-t border-border-strong last:border-b"
    >
      <details
        name="field-log"
        open={index === 0}
        className="story-disclosure group/experience bg-background open:bg-surface/70"
      >
        <summary className="grid min-h-28 cursor-pointer items-center gap-4 px-3 py-5 transition-colors hover:bg-surface-raised focus-visible:outline-offset-[-3px] sm:grid-cols-[10rem_minmax(0,1fr)_auto] sm:px-5 lg:grid-cols-[13rem_minmax(0,1fr)_auto] lg:gap-7">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.08em] text-ink-faint">
              Position {recordNumber}
            </span>
            <p className="mt-2 flex items-center gap-2 font-mono text-sm font-semibold text-primary">
              <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
              <time>{entry.start}</time>
              <span aria-hidden="true">—</span>
              <time>{entry.end}</time>
            </p>
          </div>

          <div className="min-w-0">
            <h3
              id={`field-log-${entry.id}-title`}
              className="text-xl font-semibold leading-tight text-foreground transition-colors group-hover/experience:text-primary sm:text-2xl"
            >
              {entry.role}
            </h3>
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-primary">
              <BriefcaseBusiness aria-hidden="true" className="h-3.5 w-3.5" />
              {entry.organisation}
            </p>
            <p className="text-pretty mt-2 max-w-3xl text-base leading-7 text-ink-muted">
              {entry.summary}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
            {entry.current ? (
              <StatusIndicator pulse>Current</StatusIndicator>
            ) : (
              <StatusIndicator tone="idle">Completed</StatusIndicator>
            )}
            <span
              data-disclosure-action
              className="font-mono text-sm font-semibold text-foreground"
            >
              <span className="group-open/experience:hidden">View details</span>
              <span className="hidden group-open/experience:inline">Hide details</span>
            </span>
            <ArrowDown
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-primary transition-transform duration-200 group-open/experience:rotate-180 motion-reduce:transition-none"
            />
          </div>
        </summary>

        <div className="story-disclosure-panel border-t border-border px-3 py-5 sm:px-5 sm:py-6 md:pl-[12.25rem] lg:pl-[16.75rem]">
          <SystemLabel marker={false}>Responsibilities and impact</SystemLabel>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {entry.highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex items-start gap-2.5 border-l border-border pl-3 text-base leading-7 text-foreground"
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
        </div>
      </details>
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
    <details
      id={`loadout-${group.id}`}
      name="loadout"
      data-capability-record={group.id}
      className="story-disclosure group/loadout border-t border-border-strong bg-background last:border-b open:bg-surface/75"
    >
      <summary className="grid min-h-24 cursor-pointer grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-4 px-3 py-5 transition-colors hover:bg-surface-raised focus-visible:outline-offset-[-3px] sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:px-5 sm:py-6 lg:grid-cols-[3rem_minmax(12rem,0.8fr)_minmax(0,1.2fr)_auto_auto] lg:gap-8">
        <span className="font-mono text-xs font-semibold text-primary">
          {recordNumber}
        </span>
        <div className="min-w-0">
          <h3
            id={`loadout-${group.id}-title`}
            className="text-xl font-semibold text-foreground transition-colors group-hover/loadout:text-primary sm:text-2xl"
          >
            {group.title}
          </h3>
          <p className="mt-2 max-w-xl text-base leading-7 text-ink-muted">
            {group.summary}
          </p>
        </div>

        <div className="col-span-2 col-start-2 flex flex-wrap gap-2 lg:col-span-1 lg:col-start-auto">
          <span className="border border-primary bg-primary px-2 py-1 font-mono text-sm font-semibold text-primary-foreground">
            {primaryItems.length} primary
          </span>
          <span className="border border-border bg-surface px-2 py-1 font-mono text-sm text-foreground">
            {supportingItems.length} supporting
          </span>
        </div>

        <span
          data-disclosure-action
          className="col-span-2 col-start-2 font-mono text-sm font-semibold text-foreground lg:col-span-1 lg:col-start-auto"
        >
          <span className="group-open/loadout:hidden">View skills</span>
          <span className="hidden group-open/loadout:inline">Hide skills</span>
        </span>

        <ArrowDown
          aria-hidden="true"
          className="col-start-3 row-start-1 h-4 w-4 shrink-0 text-primary transition-transform duration-200 group-open/loadout:rotate-180 motion-reduce:transition-none lg:col-start-auto lg:row-start-auto"
        />
      </summary>

      <div className="story-disclosure-panel border-t border-border px-3 py-5 sm:px-5 sm:py-6 lg:pl-[8rem]">
        <div className="grid gap-5 sm:grid-cols-2 lg:max-w-4xl">
          <div>
            <h4 className="flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.04em] text-primary">
              <span aria-hidden="true" className="h-2 w-2 bg-primary" />
              Core skills
            </h4>
            <ul className="mt-3 grid gap-1.5">
              {primaryItems.map((item) => (
                <li
                  key={item.name}
                  className="border border-primary bg-primary px-2.5 py-1.5 font-mono text-sm font-semibold text-primary-foreground"
                >
                  {item.name}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.04em] text-ink-muted">
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
                  className="border border-border bg-surface px-2.5 py-1.5 font-mono text-sm text-foreground"
                >
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </details>
  );
}

export function AboutSection() {
  return (
    <>
      <section
        id="about"
        data-game-checkpoint="field-log"
        aria-labelledby="field-log-title"
        className="relative py-16 sm:py-20 lg:py-24"
      >
        <div className="site-grid pointer-events-none absolute inset-0 -z-20 opacity-35" />
        <div className="section-shell">
          <SectionHeading
            label={experienceChapter.portfolioLabel}
            index={experienceChapter.index}
            headingId="field-log-title"
            title={experienceChapter.title}
            description={experienceChapter.summary}
          />

          <ol className="mt-10 sm:mt-12">
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
        className="relative border-y border-border bg-surface py-16 sm:py-20 lg:py-24"
      >
        <div className="micro-grid pointer-events-none absolute inset-0 -z-10 opacity-45" />
        <div className="section-shell">
          <SectionHeading
            label={skillsChapter.portfolioLabel}
            index={skillsChapter.index}
            headingId="loadout-title"
            title={skillsChapter.title}
            description={skillsChapter.summary}
          />

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-l-2 border-primary bg-background px-4 py-3 sm:mt-10">
            <SystemLabel tone="neutral" marker={false}>
              Skills key
            </SystemLabel>
            <span className="flex items-center gap-2 font-mono text-sm font-medium text-foreground">
              <span aria-hidden="true" className="h-2 w-2 bg-primary" />
              Primary capability
            </span>
            <span className="flex items-center gap-2 font-mono text-sm font-medium text-ink-muted">
              <span
                aria-hidden="true"
                className="h-2 w-2 border border-border-strong bg-surface"
              />
              Supporting tool
            </span>
          </div>

          <div className="mt-6">
            {capabilityGroups.map((group, index) => (
              <CapabilityRecord key={group.id} group={group} index={index} />
            ))}
          </div>

          <div className="mt-7 flex items-start gap-3 border-l border-border-strong pl-4 text-base leading-7 text-ink-muted">
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
