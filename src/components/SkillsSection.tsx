import { Fragment } from "react";
import { capabilityGroups } from "@/data/portfolio";
import { SkillStudy } from "@/components/SkillStudy";
import styles from "./SkillsSection.module.css";

export function SkillsSection() {
  return (
    <section
      id="loadout"
      data-chapter="04"
      aria-labelledby="loadout-title"
      className="pq-chapter pq-browse-section"
    >
      <header className="pq-browse-heading" data-motion="section">
        <span className="pq-kicker" aria-hidden="true">
          04
        </span>
        <h2 id="loadout-title">Skills</h2>
      </header>
      <div className={styles.index}>
        {capabilityGroups.map((group, i) => (
          <article
            className={styles.entry}
            data-capability-record={group.id}
            data-motion="skill-study"
            id={`loadout-${group.id}`}
            key={group.id}
            aria-labelledby={`loadout-${group.id}-title`}
          >
            <div className={styles.entryHead}>
              <div>
                <span className={styles.number} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 id={`loadout-${group.id}-title`}>{group.title}</h3>
              </div>
              <SkillStudy kind={group.id} />
            </div>
            <ul className={styles.terms} role="list" aria-labelledby={`loadout-${group.id}-title`}>
              {group.items.map((skill, index) => (
                <Fragment key={skill}>
                  {index > 0 && " "}
                  <li data-skill>{skill}</li>
                </Fragment>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
