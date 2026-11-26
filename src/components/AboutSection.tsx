import { experience, type ExperienceEntry } from "@/data/portfolio";
import { SkillsSection } from "@/components/SkillsSection";

function ExperienceRecord({ entry }: { entry: ExperienceEntry }) {
  return (
    <li
      id={`field-log-${entry.id}`}
      data-experience-record={entry.id}
      data-current={entry.current || undefined}
      className="pq-role-row"
    >
      <span className="pq-role-dates">
        <time dateTime={entry.startMonth}>{entry.start}</time> –{" "}
        {entry.endMonth ? <time dateTime={entry.endMonth}>{entry.end}</time> : entry.end}
      </span>
      <div
        id={entry.id === "skaltek-founder" ? "project-skaltek" : undefined}
        className="pq-role-body"
      >
        <span
          id={entry.id === "skaltek-founder" ? "project-skaltek-title" : undefined}
          className="pq-role-org"
        >
          {entry.organisation}
        </span>
        <h3 id={`field-log-${entry.id}-title`}>{entry.role}</h3>
        <p>{entry.summary}</p>
        {entry.link && (
          <a href={entry.link.href} className="pq-work-link">
            {entry.link.label} <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </li>
  );
}

export function AboutSection() {
  return (
    <>
      <section
        id="about"
        data-chapter="03"
        aria-labelledby="field-log-title"
        className="pq-chapter pq-browse-section"
      >
        <header className="pq-browse-heading" data-motion="section">
          <span className="pq-kicker" aria-hidden="true">
            03
          </span>
          <h2 id="field-log-title">Experience</h2>
        </header>
        <ol className="pq-role-list">
          {experience.map((entry) => (
            <ExperienceRecord key={entry.id} entry={entry} />
          ))}
        </ol>
      </section>
      <SkillsSection />
    </>
  );
}
