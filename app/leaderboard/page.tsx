import { Metadata } from "next";
import Leaderboard from "@/components/game/leaderboard";
import { Trophy } from "lucide-react";

export const metadata: Metadata = {
  title: "Daily Leaderboard - Doctor Dunk",
  description: "Today's dunk competition leaderboard",
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header Section */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Daily Leaderboard</h1>
              <p className="text-sm text-gray-500">See who&apos;s leading today&apos;s competition</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="card">
          <Leaderboard theme="light" />
        </div>
      </div>
    </div>
  );
}
