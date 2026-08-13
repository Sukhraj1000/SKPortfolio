import type { Metadata } from "next";
import { GameRoute } from "@/components/game/GameRoute";

export const metadata: Metadata = {
  title: "Game Mode | Sukhraj Kalon",
  description:
    "Enter the optional IRON//SIGNAL interactive portfolio experience.",
};

export default function GamePage() {
  return <GameRoute />;
}
