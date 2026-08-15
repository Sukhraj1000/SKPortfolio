"use client";

import * as React from "react";
import {
  BookOpen,
  Check,
  LockKeyhole,
  LogOut,
  Play,
  RotateCcw,
  Trophy,
  X,
} from "lucide-react";
import {
  chronicleChapters,
  chronicleRecords,
  type ChronicleRecordId,
} from "@/components/game/chronicle-story";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { SystemLabel } from "@/components/ui/system-label";
import styles from "./GameExperience.module.css";

type StoryOverlayMode = "story-log" | "complete";

interface StoryLogDialogProps {
  mode: StoryOverlayMode;
  recoveredRecords: readonly ChronicleRecordId[];
  score: number;
  highScore: number;
  runCompleted: boolean;
  onClose: () => void;
  onResume: () => void;
  onReplay: () => void;
  onShowLog: () => void;
  onShowRecap: () => void;
  onExit: () => void;
}

export function StoryLogDialog({
  mode,
  recoveredRecords,
  score,
  highScore,
  runCompleted,
  onClose,
  onResume,
  onReplay,
  onShowLog,
  onShowRecap,
  onExit,
}: StoryLogDialogProps) {
  const dialogRef = React.useRef<HTMLElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const recoveredSet = React.useMemo(
    () => new Set(recoveredRecords),
    [recoveredRecords],
  );

  React.useEffect(() => {
    closeButtonRef.current?.focus();
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = [
        ...dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((element) => !element.hasAttribute("aria-hidden"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    dialog.addEventListener("keydown", handleKeyDown);
    return () => dialog.removeEventListener("keydown", handleKeyDown);
  }, [mode, onClose]);

  const titleId = `chronicle-${mode}-title`;
  const descriptionId = `chronicle-${mode}-description`;

  return (
    <div className={styles.storyBackdrop}>
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={styles.storyDialog}
        data-story-overlay={mode}
      >
        <div className={styles.storyDialogHeader}>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {mode === "complete" ? (
              <Trophy
                aria-hidden="true"
                className="h-4 w-4 text-signal-yellow max-sm:hidden"
              />
            ) : (
              <BookOpen
                aria-hidden="true"
                className="h-4 w-4 text-primary max-sm:hidden"
              />
            )}
            <StatusIndicator tone={mode === "complete" ? "active" : "info"}>
              Gameplay paused
            </StatusIndicator>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label={mode === "complete" ? "Close recap" : "Close Story Log"}
            title="Close and remain paused"
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </button>
        </div>

        {mode === "complete" ? (
          <div className={styles.recapBody}>
            <SystemLabel tone="green">Chapter 04 // Present Day</SystemLabel>
            <h2 id={titleId}>Run complete. The next chapter is open.</h2>
            <p id={descriptionId}>
              You reached Present Day through five chapters of real work. Replay
              for a cleaner route, inspect the records you recovered, or return
              to the complete recruiter-facing portfolio.
            </p>

            <dl className={styles.recapStats}>
              <div>
                <dt>Run score</dt>
                <dd>{score.toLocaleString()}</dd>
              </div>
              <div>
                <dt>High score</dt>
                <dd>{Math.max(score, highScore).toLocaleString()}</dd>
              </div>
              <div>
                <dt>Records</dt>
                <dd>{`${recoveredRecords.length} / ${chronicleRecords.length}`}</dd>
              </div>
              <div>
                <dt>Chapters</dt>
                <dd>{`${chronicleChapters.length} / ${chronicleChapters.length}`}</dd>
              </div>
            </dl>

            <div className={styles.recapSignal}>
              <Check aria-hidden="true" />
              <span>
                Completion and recovered records are stored locally on this
                device. Portfolio mode remains complete without them.
              </span>
            </div>

            <div className={styles.storyActions}>
              <Button className={styles.storyAction} onClick={onReplay}>
                <RotateCcw aria-hidden="true" />
                Replay run
              </Button>
              <Button
                className={styles.storyAction}
                variant="outline"
                onClick={onShowLog}
              >
                <BookOpen aria-hidden="true" />
                Open Story Log
              </Button>
              <Button
                className={styles.storyAction}
                variant="ghost"
                onClick={onExit}
              >
                <LogOut aria-hidden="true" />
                Exit to Portfolio
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.storyLogBody}>
            <SystemLabel tone="cyan">Chronicle Run // Story Log</SystemLabel>
            <h2 id={titleId}>Recovered milestones.</h2>
            <p id={descriptionId}>
              {recoveredRecords.length === 0
                ? "No records recovered yet. Continue the route and cross a glowing story pickup to add the first milestone."
                : `${recoveredRecords.length} of ${chronicleRecords.length} factual records recovered. Locked positions remain visible so progress is clear without revealing invented content.`}
            </p>

            <div
              className={styles.storyProgress}
              role="progressbar"
              aria-label="Story records recovered"
              aria-valuemin={0}
              aria-valuemax={chronicleRecords.length}
              aria-valuenow={recoveredRecords.length}
            >
              <span
                style={{
                  width: `${(recoveredRecords.length / chronicleRecords.length) * 100}%`,
                }}
              />
            </div>

            <ol className={styles.storyRecords}>
              {chronicleRecords.map((record, index) => {
                const recovered = recoveredSet.has(record.id);
                const chapter = chronicleChapters.find(
                  (candidate) => candidate.id === record.chapterId,
                );
                return (
                  <li key={record.id} data-record-state={recovered ? "recovered" : "locked"}>
                    <div className={styles.recordIndex}>
                      {recovered ? (
                        <Check aria-hidden="true" />
                      ) : (
                        <LockKeyhole aria-hidden="true" />
                      )}
                      <span>{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <div>
                      <p>{`${chapter?.title ?? "Chapter"} // ${recovered ? record.kind : "locked"}`}</p>
                      <h3>{recovered ? record.title : "Undiscovered record"}</h3>
                      {recovered ? (
                        <>
                          <strong>{`${record.context} · ${record.period}`}</strong>
                          <p>{record.summary}</p>
                        </>
                      ) : (
                        <p>Continue the run to recover this milestone.</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className={styles.storyActions}>
              {!runCompleted ? (
                <Button className={styles.storyAction} onClick={onResume}>
                  <Play aria-hidden="true" />
                  Resume run
                </Button>
              ) : null}
              <Button
                className={styles.storyAction}
                variant="outline"
                onClick={runCompleted ? onShowRecap : onClose}
              >
                {runCompleted ? "Back to recap" : "Close and remain paused"}
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
