import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function QuestLabel({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return <p className={cn("pq-kicker", className)} {...props} />;
}

type QuestLinkVariant = "primary" | "secondary" | "quiet";

interface QuestLinkProps extends React.ComponentProps<typeof Link> {
  variant?: QuestLinkVariant;
}

export function QuestLink({
  className,
  variant = "secondary",
  ...props
}: QuestLinkProps) {
  return (
    <Link
      className={cn("pq-button", className)}
      data-variant={variant}
      {...props}
    />
  );
}

export function QuestChip({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return <li className={cn("pq-chip", className)} {...props} />;
}

export function QuestFrame({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("pq-frame", className)} {...props} />;
}

interface QuestChapterHeadingProps extends React.ComponentProps<"header"> {
  index: string;
  label: string;
  title: string;
  description: string;
  headingId: string;
}

export function QuestChapterHeading({
  className,
  index,
  label,
  title,
  description,
  headingId,
  ...props
}: QuestChapterHeadingProps) {
  return (
    <header
      {...props}
      className={cn("pq-chapter-heading", className)}
      data-motion="section"
    >
      <QuestLabel>
        Chapter {index} / {label}
      </QuestLabel>
      <h2 id={headingId}>{title}</h2>
      <p>{description}</p>
    </header>
  );
}

type OperatorPose = "idle" | "run" | "interact" | "arrive";
type OperatorSize = "small" | "medium" | "large";

interface OperatorSpriteProps extends Omit<React.ComponentProps<"span">, "children"> {
  pose?: OperatorPose;
  size?: OperatorSize;
}

export function OperatorSprite({
  className,
  pose = "idle",
  size = "small",
  ...props
}: OperatorSpriteProps) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={cn("pq-operator", className)}
      data-pose={pose}
      data-size={size}
    />
  );
}
