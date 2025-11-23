import { Metadata } from "next";
import EntryForm from "@/components/game/entry-form";
import RoundStatus from "@/components/game/round-status";
import Leaderboard from "@/components/game/leaderboard";
import PastWinners from "@/components/game/past-winners";

export const metadata: Metadata = {
  title: "Doctor Dunk Game",
  description: "Enter the daily dunk competition. Pay 1 USDC to submit your dunk. Highest engagement wins the pot!",
};

export default function DunkPage() {
  return (
    <div className="bg-white text-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Doctor Dunk Game</h1>
          <p className="text-lg text-gray-600">
            Pay 1 USDC to enter (10% fee, 90% to pot). Highest engagement wins the pot at the end of each day!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Entry Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Enter Game</h2>
              <EntryForm />
            </div>

            {/* Leaderboard */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <Leaderboard />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Round Status */}
            <RoundStatus />

            {/* Past Winners */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <PastWinners />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

