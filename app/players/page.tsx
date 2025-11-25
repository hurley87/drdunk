import { Metadata } from "next";
import PastWinners from "@/components/game/past-winners";
import { Users, Award, TrendingUp, Crown } from "lucide-react";

export const metadata: Metadata = {
  title: "Player Leaderboard - Doctor Dunk",
  description: "View top players and past winners in the Doctor Dunk game",
};

export default function PlayersPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header Section */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Player Leaderboard</h1>
              <p className="text-sm text-gray-500">Hall of Fame & Stats</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Crown className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-500 font-medium">Winners</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">-</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-500 font-medium">Entries</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">-</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Award className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-500 font-medium">Prizes</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">-</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Past Winners */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-900">Past Winners</h2>
          </div>
          <PastWinners />
        </div>

        {/* Coming Soon Card */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All-Time Leaderboard Coming Soon</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            We&apos;re working on a comprehensive leaderboard showing top players by wins,
            total earnings, and engagement stats.
          </p>
        </div>

        {/* Stats Legend */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Understanding the Stats</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Crown className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Total Wins</p>
                  <p className="text-xs text-gray-500">Number of daily competitions won</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Participation</p>
                  <p className="text-xs text-gray-500">Total number of entries submitted</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Award className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Total Winnings</p>
                  <p className="text-xs text-gray-500">Cumulative prize money earned</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Win Rate</p>
                  <p className="text-xs text-gray-500">Percentage of entries that won</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
