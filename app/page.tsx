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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-secondary-600/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-glow-orange animate-float">
              <Trophy className="w-5 h-5 sm:w-7 sm:h-7 drop-shadow-lg" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-md">Daily Dunk</h1>
              <p className="text-xs sm:text-sm text-white/90">Today&apos;s Competition</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 sm:mt-6">
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-2 sm:p-3 border border-white/30 shadow-soft hover:bg-white/20 transition-all duration-200">
              <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 drop-shadow-sm" />
                <span className="text-[10px] sm:text-xs font-semibold opacity-95">Entry Fee</span>
              </div>
              <p className="text-sm sm:text-lg font-bold drop-shadow-sm">1 USDC</p>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-2 sm:p-3 border border-white/30 shadow-soft hover:bg-white/20 transition-all duration-200">
              <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4 drop-shadow-sm" />
                <span className="text-[10px] sm:text-xs font-semibold opacity-95">To Winner</span>
              </div>
              <p className="text-sm sm:text-lg font-bold drop-shadow-sm">90%</p>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-2 sm:p-3 border border-white/30 shadow-soft hover:bg-white/20 transition-all duration-200">
              <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                <Target className="w-3 h-3 sm:w-4 sm:h-4 drop-shadow-sm" />
                <span className="text-[10px] sm:text-xs font-semibold opacity-95">Fee</span>
              </div>
              <p className="text-sm sm:text-lg font-bold drop-shadow-sm">10%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Round Status Card */}
        <RoundStatus />

        {/* How It Works */}
        <div className="card card-hover">
          <h2 className="text-lg sm:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">How It Works</h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-primary text-white flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-glow-orange">
                1
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">Pay 1 USDC to enter and submit your dunk cast</p>
            </div>
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-secondary text-white flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-glow-purple">
                2
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">Get engagement on your cast (likes, recasts, replies)</p>
            </div>
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-accent text-white flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-glow-pink">
                3
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">Highest engagement score at midnight UTC wins 90% of the pot!</p>
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
