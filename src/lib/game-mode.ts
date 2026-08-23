import { portfolioStoryAnchors, type PortfolioStoryAnchor } from "@/data/portfolio";

const gameReturnKey = "iron-signal:portfolio-return";
export const gameSoundKey = "iron-signal:game-sound";
export const gameProgressKey = "iron-signal:game-progress";

export { portfolioStoryAnchors, type PortfolioStoryAnchor };

export const defaultPortfolioHref = "/#home";

function isPortfolioStoryAnchor(value: string | null): value is PortfolioStoryAnchor {
  return portfolioStoryAnchors.includes(value as PortfolioStoryAnchor);
}

function portfolioHref(anchor: string | null) {
  return isPortfolioStoryAnchor(anchor) ? `/#${anchor}` : defaultPortfolioHref;
}

export function readPortfolioReturnHref() {
  if (typeof window === "undefined") return defaultPortfolioHref;

  try {
    return portfolioHref(window.sessionStorage.getItem(gameReturnKey));
  } catch {
    return defaultPortfolioHref;
  }
}

export function rememberPortfolioAnchor(anchor: string) {
  if (typeof window === "undefined" || !isPortfolioStoryAnchor(anchor)) return;

  try {
    window.sessionStorage.setItem(gameReturnKey, anchor);
  } catch {
    // A blocked storage API must never prevent route navigation.
  }
}
