import { Metadata } from "next";
import Leaderboard from "@/components/game/leaderboard";

export const metadata: Metadata = {
  title: "Daily Leaderboard - Doctor Dunk",
  description: "Today's dunk competition leaderboard",
};

export default function LeaderboardPage() {
  return (
    <div className="bg-gradient-to-b from-purple-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Daily Dunk Leaderboard
          </h1>
          <p className="text-gray-600">
            See who&apos;s leading today&apos;s competition
          </p>
        </div>
        <Leaderboard />
      </div>
    </div>
  );
}

