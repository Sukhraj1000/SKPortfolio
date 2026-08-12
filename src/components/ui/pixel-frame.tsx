import * as React from "react";
import { cn } from "@/lib/utils";

type FrameTone = "neutral" | "orange" | "green" | "cyan";

const toneClasses: Record<FrameTone, string> = {
  neutral: "[--frame-signal:var(--steel-500)]",
  orange: "[--frame-signal:var(--signal-orange)]",
  green: "[--frame-signal:var(--signal-green)]",
  cyan: "[--frame-signal:var(--signal-cyan)]",
};

interface PixelFrameProps extends React.ComponentProps<"div"> {
  tone?: FrameTone;
  raised?: boolean;
}

export function PixelFrame({
  className,
  tone = "neutral",
  raised = false,
  ...props
}: PixelFrameProps) {
  return (
    <div
      data-slot="pixel-frame"
      className={cn(
        "pixel-frame relative border bg-surface text-foreground",
        raised && "pixel-frame-raised",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
