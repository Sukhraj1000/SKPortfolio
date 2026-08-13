import Link from "next/link";
import { storyChapters } from "@/data/portfolio";

export function StoryRail() {
  return (
    <nav
      aria-label="Portfolio story"
      className="border-y border-border bg-surface"
    >
      <div className="section-shell overflow-x-auto">
        <ol className="grid min-w-[42rem] grid-cols-5">
          {storyChapters.map((chapter) => (
            <li key={chapter.id} className="border-r border-border first:border-l">
              <Link
                href={chapter.href}
                className="group flex min-h-14 items-center gap-2 px-3 py-2 transition-colors hover:bg-surface-raised focus-visible:outline-offset-[-3px] sm:min-h-16 sm:px-4"
              >
                <span className="font-mono text-[0.625rem] text-primary">
                  {chapter.index}
                </span>
                <span className="text-xs font-semibold text-foreground transition-colors group-hover:text-primary sm:text-sm">
                  {chapter.portfolioLabel}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
