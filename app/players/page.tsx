import { Metadata } from "next";
import PastWinners from "@/components/game/past-winners";
import { Users, Award, TrendingUp, Crown, Star, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Player Leaderboard - Doctor Dunk",
  description: "View top players and past winners in the Doctor Dunk game",
};

export default function PlayersPage() {
  return (
    <div className="min-h-screen pb-20">
      {/* Header Section */}
      <div className="bg-mesh border-b border-gray-200/50">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 blur-lg opacity-30 -z-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Hall of Fame
              </h1>
              <p className="text-sm text-gray-500">Top players & past winners</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="stat-card relative overflow-hidden">
              <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-amber-200 to-yellow-300 rounded-bl-xl opacity-50" />
              <div className="flex items-center gap-1.5 mb-1">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs text-gray-500 font-medium">Winners</span>
              </div>
              <p className="text-lg font-bold text-gray-900">Coming</p>
            </div>
            <div className="stat-card relative overflow-hidden">
              <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-green-200 to-emerald-300 rounded-bl-xl opacity-50" />
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs text-gray-500 font-medium">Entries</span>
              </div>
              <p className="text-lg font-bold text-gray-900">Soon</p>
            </div>
            <div className="stat-card relative overflow-hidden">
              <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-purple-200 to-violet-300 rounded-bl-xl opacity-50" />
              <div className="flex items-center gap-1.5 mb-1">
                <Award className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-xs text-gray-500 font-medium">Prizes</span>
              </div>
              <p className="text-lg font-bold text-gray-900">TBD</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Past Winners */}
        <div className="card-glow">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
              <Crown className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Past Winners</h2>
          </div>
          <PastWinners />
        </div>

        {/* Coming Soon Card */}
        <div className="relative rounded-2xl bg-gradient-to-br from-gray-50 via-white to-gray-50 border border-gray-200 p-8 text-center overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-br from-primary-100 to-amber-100 rounded-full blur-2xl opacity-50" />
          <div className="absolute bottom-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full blur-2xl opacity-50" />
          
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">All-Time Leaderboard</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">
              We&apos;re building a comprehensive leaderboard with all-time stats,
              win streaks, and more!
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-600 text-sm font-medium">
              <Star className="w-4 h-4" />
              Coming Soon
            </div>
          </div>
        </div>

        {/* Stats Legend */}
        <div className="card">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Understanding the Stats</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100">
              <Crown className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Total Wins</p>
                <p className="text-xs text-gray-500">Daily competitions won</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
              <TrendingUp className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Participation</p>
                <p className="text-xs text-gray-500">Total entries submitted</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100">
              <Award className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Total Winnings</p>
                <p className="text-xs text-gray-500">Prize money earned</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <Users className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Win Rate</p>
                <p className="text-xs text-gray-500">Percentage of wins</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
