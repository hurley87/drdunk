import { Metadata } from "next";
import RoundStatus from "@/components/game/round-status";
import Leaderboard from "@/components/game/leaderboard";
import { Trophy, Zap, Target } from "lucide-react";

export const metadata: Metadata = {
  title: "Doctor Dunk - Daily Leaderboard",
  description: "Compete in the daily dunk competition. Highest engagement wins!",
};

export default function DailyLeaderboardPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header Section */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Daily Dunk</h1>
              <p className="text-sm text-gray-500">Today&apos;s Competition</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-500 font-medium">Entry Fee</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">1 USDC</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Trophy className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-500 font-medium">To Winner</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">90%</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Target className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-500 font-medium">Fee</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">10%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Round Status Card */}
        <RoundStatus />

        {/* How It Works */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-medium">
                1
              </div>
              <p className="text-sm text-gray-600">Pay 1 USDC to enter and submit your dunk cast</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-medium">
                2
              </div>
              <p className="text-sm text-gray-600">Get engagement on your cast (likes, recasts, replies)</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-medium">
                3
              </div>
              <p className="text-sm text-gray-600">Highest engagement score at midnight UTC wins 90% of the pot</p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="card">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}
