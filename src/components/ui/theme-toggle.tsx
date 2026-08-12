"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sunPixels = [
  "0010100",
  "0001000",
  "1011101",
  "0111110",
  "1011101",
  "0001000",
  "0010100",
] as const;

const moonPixels = [
  "0011100",
  "0110000",
  "1110000",
  "1110000",
  "1111000",
  "0111110",
  "0011100",
] as const;

function PixelCelestialIcon({
  pixels,
  className,
}: {
  pixels: readonly string[];
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("grid h-[21px] w-[21px] grid-cols-7", className)}
    >
      {pixels.flatMap((row, rowIndex) =>
        [...row].map((pixel, columnIndex) => (
          <span
            key={`${rowIndex}-${columnIndex}`}
            className={pixel === "1" ? "bg-current" : "bg-transparent"}
          />
        )),
      )}
    </span>
  );
}

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const isNight = mounted && resolvedTheme === "dark";
  const destination = isNight ? "day" : "night";
  const label = mounted ? `Switch to ${destination} theme` : "Toggle color theme";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn("group h-11 w-11 overflow-hidden", className)}
      aria-label={label}
      title={label}
      onClick={() => setTheme(isNight ? "light" : "dark")}
    >
      <PixelCelestialIcon
        pixels={moonPixels}
        className="theme-icon-night text-moon transition-transform duration-200 group-hover:-translate-y-0.5"
      />
      <PixelCelestialIcon
        pixels={sunPixels}
        className="theme-icon-day text-sun transition-transform duration-200 group-hover:rotate-12"
      />
    </Button>
  );
}
