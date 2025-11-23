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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Daily Dunk</h1>
              <p className="text-orange-100">Today&apos;s Competition</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-medium opacity-90">Entry Fee</span>
              </div>
              <p className="text-lg font-bold">1 USDC</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4" />
                <span className="text-xs font-medium opacity-90">To Winner</span>
              </div>
              <p className="text-lg font-bold">90%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4" />
                <span className="text-xs font-medium opacity-90">Fee</span>
              </div>
              <p className="text-lg font-bold">10%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Round Status Card */}
        <RoundStatus />

        {/* How It Works */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">How It Works</h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                1
              </div>
              <p className="text-sm text-gray-700">Pay 1 USDC to enter and submit your dunk cast</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                2
              </div>
              <p className="text-sm text-gray-700">Get engagement on your cast (likes, recasts, replies)</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                3
              </div>
              <p className="text-sm text-gray-700">Highest engagement score at midnight UTC wins 90% of the pot!</p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}
