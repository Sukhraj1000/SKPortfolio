import Link from "next/link";
import { storyChapters } from "@/data/portfolio";

export function StoryRail() {
  return (
    <nav
      aria-label="Portfolio story"
      className="border-y border-border bg-surface"
    >
      <div className="section-shell overflow-x-auto">
        <ol className="grid min-w-[46rem] grid-cols-5">
          {storyChapters.map((chapter) => (
            <li key={chapter.id} className="border-r border-border first:border-l">
              <Link
                href={chapter.href}
                className="group flex min-h-24 flex-col justify-between gap-3 px-4 py-4 transition-colors hover:bg-surface-raised focus-visible:outline-offset-[-3px]"
              >
                <span className="font-mono text-[0.6875rem] text-ink-faint">
                  {chapter.index}
                </span>
                <span className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
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
