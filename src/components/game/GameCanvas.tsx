"use client";

import * as React from "react";
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
}: {
  controls: React.MutableRefObject<GameControlsState>;
  callbacks: SignalGameCallbacks;
  onReady: (handle: SignalGameHandle | null) => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
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
        callbacks: {
          onSnapshot: (snapshot) => callbacksRef.current.onSnapshot(snapshot),
          onOpenPanel: (panelId) => callbacksRef.current.onOpenPanel(panelId),
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
      aria-label="IRON SIGNAL platformer. Use WASD or arrow keys to move, Space to jump, and E or Enter to interact."
      tabIndex={0}
    />
  );
}
