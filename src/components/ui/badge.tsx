import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "destructive";
}

function Badge({ 
  className, 
  variant = "default", 
  ...props 
}: BadgeProps) {
  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-input bg-transparent",
    destructive: "bg-destructive text-destructive-foreground",
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center border px-2.5 py-1 font-mono text-[0.6875rem] font-semibold uppercase leading-none transition-colors",
        variantClasses[variant],
        className
      )} 
      {...props} 
    />
  );
}

export { Badge };
