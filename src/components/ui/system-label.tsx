import * as React from "react";
import { cn } from "@/lib/utils";

type SystemTone = "neutral" | "primary" | "green" | "cyan";

const toneClasses: Record<SystemTone, string> = {
  neutral: "text-ink-muted",
  primary: "text-primary",
  green: "text-signal-green",
  cyan: "text-signal-cyan",
};

interface SystemLabelProps extends React.ComponentProps<"span"> {
  tone?: SystemTone;
  marker?: boolean;
}

export function SystemLabel({
  className,
  tone = "primary",
  marker = true,
  children,
  ...props
}: SystemLabelProps) {
  return (
    <span
      data-slot="system-label"
      className={cn(
        "inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase leading-4 tracking-[0.1em]",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {marker ? <span aria-hidden="true" className="h-1.5 w-1.5 bg-current" /> : null}
      {children}
    </span>
  );
}
