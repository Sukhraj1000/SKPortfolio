import * as React from "react";
import { cn } from "@/lib/utils";

type StatusTone = "idle" | "active" | "info" | "warning";

const toneClasses: Record<StatusTone, string> = {
  idle: "text-ink-muted",
  active: "text-signal-green",
  info: "text-signal-cyan",
  warning: "text-sun",
};

interface StatusIndicatorProps extends React.ComponentProps<"span"> {
  tone?: StatusTone;
  pulse?: boolean;
}

export function StatusIndicator({
  className,
  tone = "active",
  pulse = false,
  children,
  ...props
}: StatusIndicatorProps) {
  return (
    <span
      data-slot="status-indicator"
      className={cn(
        "inline-flex items-center gap-2 font-mono text-sm font-medium uppercase leading-5",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn("h-2 w-2 bg-current", pulse && "status-pulse")}
      />
      {children}
    </span>
  );
}
