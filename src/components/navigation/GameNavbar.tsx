"use client";

import * as React from "react";
import Link from "next/link";
import { portfolioProfile } from "@/data/portfolio";
import { defaultPortfolioHref, readPortfolioReturnHref } from "@/lib/game-mode";

function GameModeControl({ portfolioReturnHref }: { portfolioReturnHref: string }) {
  return (
    <div role="group" aria-label="Portfolio experience mode" className="pq-game-mode-control">
      <Link
        href={portfolioReturnHref}
        className="pq-game-mode-tab"
        aria-label="Return to Portfolio mode"
        title="Return to Portfolio mode"
      >
        <span aria-hidden="true" className="pq-game-mode-full">
          Portfolio
        </span>
        <span aria-hidden="true" className="pq-game-mode-short">
          Port.
        </span>
      </Link>
      <span className="pq-game-mode-tab is-current" aria-current="page" title="Game mode selected">
        Game<span className="sr-only"> mode selected</span>
      </span>
    </div>
  );
}

export function GameNavbar() {
  const [portfolioReturnHref, setPortfolioReturnHref] = React.useState(defaultPortfolioHref);

  React.useEffect(() => {
    setPortfolioReturnHref(readPortfolioReturnHref());
  }, []);

  return (
    <header className="pq-header pq-scope pq-game-header" data-game-header>
      <div className="pq-header-inner">
        <Link
          href={portfolioReturnHref}
          className="pq-brand"
          aria-label={`${portfolioProfile.name}, exit Game mode`}
        >
          <span className="pq-brand-pixel" aria-hidden="true">
            {portfolioProfile.initials}
          </span>
          <span className="pq-brand-copy">
            <strong>{portfolioProfile.name}</strong>
            <small>{portfolioProfile.role}</small>
          </span>
        </Link>

        <p className="pq-game-runtime-label">
          <i aria-hidden="true" /> Game route // isolated runtime
        </p>

        <GameModeControl portfolioReturnHref={portfolioReturnHref} />
      </div>
    </header>
  );
}
