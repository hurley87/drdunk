import { Metadata } from "next";
import PastWinners from "@/components/game/past-winners";
import { Users, Award, TrendingUp, Crown } from "lucide-react";

export const metadata: Metadata = {
  title: "Player Leaderboard - Doctor Dunk",
  description: "View top players and past winners in the Doctor Dunk game",
};

export default function PlayersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-secondary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-600/20 to-primary-600/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-glow-purple animate-float">
              <Users className="w-5 h-5 sm:w-7 sm:h-7 drop-shadow-lg" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-md">Player Leaderboard</h1>
              <p className="text-xs sm:text-sm text-white/90">Hall of Fame & Stats</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 sm:mt-6">
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-2 sm:p-3 border border-white/30 shadow-soft hover:bg-white/20 transition-all duration-200">
              <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                <Crown className="w-3 h-3 sm:w-4 sm:h-4 drop-shadow-sm" />
                <span className="text-[10px] sm:text-xs font-semibold opacity-95">Winners</span>
              </div>
              <p className="text-sm sm:text-lg font-bold drop-shadow-sm">-</p>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-2 sm:p-3 border border-white/30 shadow-soft hover:bg-white/20 transition-all duration-200">
              <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 drop-shadow-sm" />
                <span className="text-[10px] sm:text-xs font-semibold opacity-95">Entries</span>
              </div>
              <p className="text-sm sm:text-lg font-bold drop-shadow-sm">-</p>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-2 sm:p-3 border border-white/30 shadow-soft hover:bg-white/20 transition-all duration-200">
              <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                <Award className="w-3 h-3 sm:w-4 sm:h-4 drop-shadow-sm" />
                <span className="text-[10px] sm:text-xs font-semibold opacity-95">Prizes</span>
              </div>
              <p className="text-sm sm:text-lg font-bold drop-shadow-sm">-</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Past Winners */}
        <div className="card shadow-soft-lg">
          <div className="flex items-center gap-2 mb-6">
            <Crown className="w-6 h-6 text-primary-500 drop-shadow-sm" />
            <h2 className="text-xl font-bold bg-gradient-secondary bg-clip-text text-transparent">Past Winners</h2>
          </div>
          <PastWinners />
        </div>

        {/* Coming Soon Card */}
        <div className="card-gradient border-secondary-200 p-6 sm:p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-secondary/20 flex items-center justify-center mx-auto mb-4 shadow-soft">
            <TrendingUp className="w-8 h-8 text-secondary-600" />
          </div>
          <h3 className="text-lg font-bold bg-gradient-secondary bg-clip-text text-transparent mb-2">All-Time Leaderboard Coming Soon</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
            We&apos;re working on a comprehensive leaderboard showing top players by wins, 
            total earnings, engagement, and more. Stay tuned!
          </p>
        </div>

        {/* Stats Legend */}
        <div className="card">
          <h3 className="text-sm font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">Understanding the Stats</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Crown className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Total Wins</p>
                  <p className="text-xs text-gray-600 leading-relaxed">Number of daily competitions won</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-secondary-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Participation</p>
                  <p className="text-xs text-gray-600 leading-relaxed">Total number of entries submitted</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Award className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Total Winnings</p>
                  <p className="text-xs text-gray-600 leading-relaxed">Cumulative prize money earned</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Win Rate</p>
                  <p className="text-xs text-gray-600 leading-relaxed">Percentage of entries that won</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

