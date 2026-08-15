"use client";

import * as React from "react";
import type { ChronicleRecordId } from "@/components/game/chronicle-story";
import type {
  GameControlsState,
  SignalGameCallbacks,
  SignalGameHandle,
} from "@/components/game/game-types";
import styles from "./GameExperience.module.css";

export function GameCanvas({
  controls,
  callbacks,
  onReady,
  skipTutorial,
  recoveredRecords,
}: {
  controls: React.MutableRefObject<GameControlsState>;
  callbacks: SignalGameCallbacks;
  onReady: (handle: SignalGameHandle | null) => void;
  skipTutorial: boolean;
  recoveredRecords: readonly ChronicleRecordId[];
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const initialRecoveredRecordsRef = React.useRef(recoveredRecords);
  const callbacksRef = React.useRef(callbacks);
  callbacksRef.current = callbacks;

  React.useEffect(() => {
    let disposed = false;
    let handle: SignalGameHandle | null = null;

    const boot = async () => {
      if (!containerRef.current) return;
      const { createSignalGame } = await import(
        "@/components/game/phaser/createSignalGame"
      );
      if (disposed || !containerRef.current) return;

      handle = createSignalGame({
        parent: containerRef.current,
        controls,
        skipTutorial,
        recoveredRecords: initialRecoveredRecordsRef.current,
        callbacks: {
          onSnapshot: (snapshot) => callbacksRef.current.onSnapshot(snapshot),
          onOpenPanel: (panelId) => callbacksRef.current.onOpenPanel(panelId),
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
  }, [controls, onReady, skipTutorial]);

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
