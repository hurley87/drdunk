import { Metadata } from "next";
import EntryForm from "@/components/game/entry-form";
import RoundStatus from "@/components/game/round-status";
import Leaderboard from "@/components/game/leaderboard";
import PastWinners from "@/components/game/past-winners";
import ClaimReward from "@/components/game/claim-reward";
import { Trophy } from "lucide-react";

export const metadata: Metadata = {
  title: "Doctor Dunk Game",
  description: "Enter the daily dunk competition. Pay 1 USDC to submit your dunk. Highest engagement wins the pot!",
};

export default function DunkPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header Section */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Doctor Dunk Game</h1>
              <p className="text-sm text-gray-500">
                Pay 1 USDC to enter. Highest engagement wins the pot!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Claimable Rewards */}
        <ClaimReward />

        {/* Entry Form Card */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Enter Game</h2>
          <EntryForm />
        </div>

        {/* Round Status */}
        <RoundStatus />

        {/* Leaderboard */}
        <div className="card">
          <Leaderboard />
        </div>

        {/* Past Winners */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Winners</h2>
          <PastWinners />
        </div>
      </div>
    </div>
  );
}
