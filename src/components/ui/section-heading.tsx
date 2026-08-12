import * as React from "react";
import { cn } from "@/lib/utils";
import { SystemLabel } from "@/components/ui/system-label";

interface SectionHeadingProps extends React.ComponentProps<"div"> {
  label: string;
  title: string;
  description?: string;
  index?: string;
  headingId?: string;
}

export function SectionHeading({
  className,
  label,
  title,
  description,
  index,
  headingId,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      data-slot="section-heading"
      className={cn("grid gap-4 md:grid-cols-[10rem_minmax(0,1fr)]", className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-4 md:block">
        <SystemLabel>{label}</SystemLabel>
        {index ? (
          <span className="font-mono text-xs text-ink-faint md:mt-5 md:block">
            {index}
          </span>
        ) : null}
      </div>
      <div className="max-w-3xl">
        <h2
          id={headingId}
          className="text-balance text-3xl font-semibold leading-[1.05] md:text-5xl"
        >
          {title}
        </h2>
        {description ? (
          <p className="text-pretty mt-4 max-w-2xl text-base leading-7 text-ink-muted md:text-lg">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
