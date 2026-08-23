"use client";

import { X } from "lucide-react";
import { getChronicleRecord, type ChronicleRecordId } from "@/components/game/chronicle-story";
import styles from "./GameExperience.module.css";

const kindLabels = {
  education: "Education unlocked",
  experience: "Experience unlocked",
  project: "Project unlocked",
} as const;

export function StoryUnlockCard({
  recordId,
  onDismiss,
}: {
  recordId: ChronicleRecordId;
  onDismiss: () => void;
}) {
  const record = getChronicleRecord(recordId);
  const titleId = `story-unlock-${recordId.replaceAll(":", "-")}`;

  return (
    <aside
      className={styles.unlockCard}
      aria-labelledby={titleId}
      data-unlock-card
      data-record-id={record.id}
    >
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {`${kindLabels[record.kind]}: ${record.title}`}
      </p>
      <div className={styles.unlockStripe} aria-hidden="true" />
      <div className={styles.unlockHeader}>
        <span>New story record</span>
        <button
          type="button"
          aria-label={`Dismiss ${record.title} unlock card`}
          title="Dismiss unlock card"
          onClick={onDismiss}
        >
          <X aria-hidden="true" />
        </button>
      </div>
      <div className={styles.unlockBody}>
        <p>{`${kindLabels[record.kind]} // ${record.period}`}</p>
        <h2 id={titleId}>{record.title}</h2>
        <strong>{record.context}</strong>
        <p>{record.summary}</p>
        <ul aria-label={`${record.title} technologies`}>
          {record.technologies.map((technology) => (
            <li key={technology}>{technology}</li>
          ))}
        </ul>
      </div>
      <footer>
        <span>Run continues behind this card</span>
        <span>Saved to Story Log</span>
      </footer>
    </aside>
  );
}
