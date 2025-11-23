import { Metadata } from "next";
import PastWinners from "@/components/game/past-winners";
import { Users, Award, TrendingUp, Crown } from "lucide-react";

export const metadata: Metadata = {
  title: "Player Leaderboard - Doctor Dunk",
  description: "View top players and past winners in the Doctor Dunk game",
};

export default function PlayersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Player Leaderboard</h1>
              <p className="text-purple-100">Hall of Fame & Stats</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4" />
                <span className="text-xs font-medium opacity-90">Winners</span>
              </div>
              <p className="text-lg font-bold">-</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium opacity-90">Entries</span>
              </div>
              <p className="text-lg font-bold">-</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4" />
                <span className="text-xs font-medium opacity-90">Prizes</span>
              </div>
              <p className="text-lg font-bold">-</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Past Winners */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-900">Past Winners</h2>
          </div>
          <PastWinners />
        </div>

        {/* Coming Soon Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">All-Time Leaderboard Coming Soon</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            We&apos;re working on a comprehensive leaderboard showing top players by wins, 
            total earnings, engagement, and more. Stay tuned!
          </p>
        </div>

        {/* Stats Legend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Understanding the Stats</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Crown className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Total Wins</p>
                  <p className="text-xs text-gray-600">Number of daily competitions won</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Participation</p>
                  <p className="text-xs text-gray-600">Total number of entries submitted</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Award className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Total Winnings</p>
                  <p className="text-xs text-gray-600">Cumulative prize money earned</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Win Rate</p>
                  <p className="text-xs text-gray-600">Percentage of entries that won</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

