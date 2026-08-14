import Link from "next/link";
import { storyChapters } from "@/data/portfolio";

export function StoryRail() {
  return (
    <nav
      aria-label="Portfolio sections"
      className="border-y border-border bg-surface"
    >
      <div className="section-shell">
        <ol className="grid grid-cols-2 gap-px border-x border-border bg-border sm:grid-cols-5">
          {storyChapters.map((chapter) => (
            <li
              key={chapter.id}
              className="bg-surface last:col-span-2 sm:last:col-span-1"
            >
              <Link
                href={chapter.href}
                className="group flex min-h-14 items-center gap-2 px-3 py-2 transition-colors hover:bg-surface-raised focus-visible:outline-offset-[-3px] sm:min-h-16 sm:px-4"
              >
                <span className="font-mono text-xs text-primary">
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
