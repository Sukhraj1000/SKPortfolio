import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function QuestLabel({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("pq-kicker", className)} {...props} />;
}

type QuestLinkVariant = "primary" | "secondary" | "quiet";

interface QuestLinkProps extends React.ComponentProps<typeof Link> {
  variant?: QuestLinkVariant;
}

export function QuestLink({ className, variant = "secondary", ...props }: QuestLinkProps) {
  return <Link className={cn("pq-button", className)} data-variant={variant} {...props} />;
}

type OperatorSize = "small" | "large";

interface OperatorSpriteProps extends Omit<React.ComponentProps<"span">, "children"> {
  size?: OperatorSize;
}

export function OperatorSprite({ className, size = "small", ...props }: OperatorSpriteProps) {
  return (
    <span {...props} aria-hidden="true" className={cn("pq-operator", className)} data-size={size} />
  );
}
