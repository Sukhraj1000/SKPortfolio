import type { Metadata } from "next";
import { GameRoute } from "@/components/game/GameRoute";

export const metadata: Metadata = {
  title: "Chronicle Run | Sukhraj Kalon",
  description:
    "Play a short auto-running journey through Sukhraj Kalon's real education, experience, and project milestones.",
};

export default function GamePage() {
  return <GameRoute />;
}
