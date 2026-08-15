"use client";

import * as React from "react";
import type { ChronicleRecordId } from "@/components/game/chronicle-story";
import type {
  ChronicleGameCallbacks,
  ChronicleGameHandle,
  GameControlsState,
} from "@/components/game/game-types";
import styles from "./GameExperience.module.css";

export function GameCanvas({
  controls,
  callbacks,
  onReady,
  recoveredRecords,
}: {
  controls: React.MutableRefObject<GameControlsState>;
  callbacks: ChronicleGameCallbacks;
  onReady: (handle: ChronicleGameHandle | null) => void;
  recoveredRecords: readonly ChronicleRecordId[];
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const initialRecoveredRecordsRef = React.useRef(recoveredRecords);
  const callbacksRef = React.useRef(callbacks);
  callbacksRef.current = callbacks;

  React.useEffect(() => {
    let disposed = false;
    let handle: ChronicleGameHandle | null = null;

    const boot = async () => {
      if (!containerRef.current) return;
      const { createChronicleGame } = await import(
        "@/components/game/phaser/createChronicleGame"
      );
      if (disposed || !containerRef.current) return;

      handle = createChronicleGame({
        parent: containerRef.current,
        controls,
        recoveredRecords: initialRecoveredRecordsRef.current,
        callbacks: {
          onSnapshot: (snapshot) => callbacksRef.current.onSnapshot(snapshot),
          onUnlock: (recordId) => callbacksRef.current.onUnlock(recordId),
          onNotice: (message, tone) => callbacksRef.current.onNotice(message, tone),
        },
      });
      onReady(handle);
    };

    void boot();

    return () => {
      disposed = true;
      onReady(null);
      handle?.destroy();
    };
  }, [controls, onReady]);

  return (
    <div
      ref={containerRef}
      className={styles.canvasHost}
      role="application"
      aria-label="Chronicle Run auto-runner. Use Space or Up to jump, Shift or D to dash, and S or Down to fast-drop."
      tabIndex={0}
    />
  );
}
