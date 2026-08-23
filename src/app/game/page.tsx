import type { Metadata } from "next";
import { GameRoute } from "@/components/game/GameRoute";
import { GameNavbar } from "@/components/navigation/GameNavbar";

const gameTitle = "Chronicle Run | Sukhraj Kalon";
const gameDescription =
  "Play a short auto-running journey through Sukhraj Kalon's real education, experience, and project milestones.";

export const metadata: Metadata = {
  title: gameTitle,
  description: gameDescription,
  alternates: { canonical: "/game/" },
  openGraph: {
    type: "website",
    url: "/game/",
    title: gameTitle,
    description: gameDescription,
    images: ["/sk-icon.png"],
  },
};

export default function GamePage() {
  return (
    <>
      <GameNavbar />
      <main>
        <GameRoute />
      </main>
    </>
  );
}
