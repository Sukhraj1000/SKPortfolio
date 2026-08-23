import { QuestChapterHeading, QuestChip } from "@/components/pixel-quest/QuestPrimitives";
import {
  capabilityGroups,
  experience,
  storyChapters,
  type CapabilityGroup,
  type ExperienceEntry,
} from "@/data/portfolio";

const experienceChapter = storyChapters[2];
const skillsChapter = storyChapters[3];
const orderedExperience = experience;

// capabilityGroups is the authoritative current skills list. The former scrolling
// ticker duplicated these entries and included unsubstantiated legacy labels,
// so it is deliberately retired rather than implying that every old label is current.

function ExperienceRecord({ entry, index }: { entry: ExperienceEntry; index: number }) {
  const levelNumber = String(orderedExperience.length - index).padStart(2, "0");

  return (
    <li
      id={`field-log-${entry.id}`}
      data-experience-record={entry.id}
      data-motion="record"
      className="pq-level-record"
    >
      <span className="pq-level-node" aria-hidden="true">
        {levelNumber}
      </span>
      <time className="pq-level-date">
        {entry.start} — {entry.end}
      </time>
      <div className="pq-level-body">
        {entry.current ? (
          <p className="pq-level-status">{index === 0 ? "Current role" : "Concurrent role"}</p>
        ) : null}
        <h3 id={`field-log-${entry.id}-title`}>{entry.role}</h3>
        <strong>{entry.organisation}</strong>
        <p>{entry.summary}</p>

        <details
          name="experience-path"
          open={index === 0}
          className="pq-level-details"
          data-disclosure-kind="timeline"
        >
          <summary
            data-disclosure-action
            aria-label={`View ${entry.role} at ${entry.organisation} responsibilities and stack`}
          >
            <span className="when-closed">View responsibilities and stack</span>
            <span className="when-open">Hide responsibilities and stack</span>
          </summary>
          <div className="pq-level-details-panel">
            <i className="pq-timeline-scan" aria-hidden="true" />
            <h4>Responsibilities &amp; delivery evidence</h4>
            <ul aria-label={`${entry.role} responsibilities and impact`}>
              {entry.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
            <ul className="pq-tech-list" aria-label={`${entry.role} technologies`}>
              {entry.technologies.map((technology) => (
                <QuestChip key={technology}>{technology}</QuestChip>
              ))}
            </ul>
          </div>
        </details>
      </div>
    </li>
  );
}

const inventoryIcons = ["</>", "DB", "☁", "AI", "SYS"] as const;
const inventorySlots = ["A1", "B2", "C3", "D4", "E5"] as const;

function CapabilityRecord({ group, index }: { group: CapabilityGroup; index: number }) {
  const primaryItems = group.items.filter((item) => item.level === "primary");
  const supportingItems = group.items.filter((item) => item.level === "supporting");

  return (
    <article
      id={`loadout-${group.id}`}
      data-capability-record={group.id}
      data-motion="record"
      className="pq-inventory-card"
      aria-labelledby={`loadout-${group.id}-title`}
    >
      <span className="pq-slot-id">{inventorySlots[index]}</span>
      <span className="pq-slot-icon" aria-hidden="true">
        {inventoryIcons[index]}
      </span>
      <h3 id={`loadout-${group.id}-title`}>{group.title}</h3>
      <p>{group.summary}</p>
      <p className="pq-inventory-counts">
        <span>{primaryItems.length} primary</span>
        <span>{supportingItems.length} supporting</span>
      </p>

      <details
        name="capability-inventory"
        className="pq-inventory-details"
        data-disclosure-kind="toolkit"
        open={group.id === "ai-automation"}
      >
        <summary data-disclosure-action aria-label={`Open ${group.title} inventory`}>
          <span className="when-closed">Open inventory</span>
          <span className="when-open">Close inventory</span>
        </summary>
        <div className="pq-inventory-lists">
          <div>
            <h4>Primary capabilities</h4>
            <ul>
              {primaryItems.map((item) => (
                <QuestChip key={item.name} data-level="primary">
                  {item.name}
                </QuestChip>
              ))}
            </ul>
          </div>
          <div>
            <h4>Supporting tools</h4>
            <ul>
              {supportingItems.map((item) => (
                <QuestChip key={item.name} data-level="supporting">
                  {item.name}
                </QuestChip>
              ))}
            </ul>
          </div>
        </div>
      </details>
      <span className="pq-slot-state">
        {index < 2 ? "Primary loadout" : index === 3 ? "Active research" : "Working toolkit"}
      </span>
    </article>
  );
}

export function AboutSection() {
  return (
    <>
      <section
        id="about"
        data-chapter="03"
        aria-labelledby="field-log-title"
        className="pq-chapter pq-experience-chapter"
      >
        <QuestChapterHeading
          index={experienceChapter.index}
          label="Experience"
          headingId="field-log-title"
          title={
            <>
              <span>Engineering under</span> <em>real constraints.</em>
            </>
          }
          description="Secure delivery, business operations, product work, and live systems shaped how I build."
        />

        <ol className="pq-level-path">
          {orderedExperience.map((entry, index) => (
            <ExperienceRecord key={entry.id} entry={entry} index={index} />
          ))}
        </ol>
      </section>

      <section
        id="loadout"
        data-chapter="04"
        aria-labelledby="loadout-title"
        className="pq-chapter pq-skills-chapter"
      >
        <QuestChapterHeading
          index={skillsChapter.index}
          label="Skills"
          headingId="loadout-title"
          title={
            <>
              <span>A working systems</span> <em>constellation.</em>
            </>
          }
          description="Capabilities are grouped by how they support delivery—not artificial percentage scores."
        />

        <div className="pq-inventory-grid">
          {capabilityGroups.map((group, index) => (
            <CapabilityRecord key={group.id} group={group} index={index} />
          ))}
        </div>

        <p className="pq-inventory-note">
          Primary marks the technologies used most directly to deliver each capability. Supporting
          tools remain part of the working method without implying a percentage or artificial
          proficiency score.
        </p>
      </section>
    </>
  );
}
