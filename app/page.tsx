import { Metadata } from "next";
import Leaderboard from "@/components/game/leaderboard";
import TodayStats from "@/components/game/today-stats";
import Link from "next/link";
import { Rocket, Flame, Trophy, Zap, Star } from "lucide-react";
import { HeroSection } from "@/components/game/hero-section";

export const metadata: Metadata = {
  title: "Doctor Dunk - Daily Leaderboard",
  description: "Compete in the daily dunk competition. Highest engagement wins!",
};

export default function DailyLeaderboardPage() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Background */}
      <div className="bg-mesh">
        {/* Header Section */}
        <div className="border-b border-gray-200/50">
          <div className="max-w-3xl mx-auto px-4 py-6">
            <HeroSection formattedDate={formattedDate} />
            
            {/* Today's Stats */}
            <div className="mt-6">
              <TodayStats />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* How It Works - Compact */}
        <div className="card-glow">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-amber-100 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">How It Works</h2>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100">
              <div className="w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-lg shadow-primary-500/30">
                1
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Pay & Enter</p>
                <p className="text-xs text-gray-500">1 USDC to join</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100">
              <div className="w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-lg shadow-primary-500/30">
                2
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Get Engagement</p>
                <p className="text-xs text-gray-500">Likes, recasts, replies</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100">
              <div className="w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-lg shadow-primary-500/30">
                3
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Win the Pot</p>
                <p className="text-xs text-gray-500">90% to winner</p>
              </div>
            </div>
          </div>
          
          <Link
            href="/create"
            className="btn-game w-full flex items-center justify-center gap-2 h-12"
          >
            <Rocket className="w-5 h-5" />
            <span>Submit Your Dunk</span>
          </Link>
        </div>

        {/* Leaderboard */}
        <div className="card">
          <Leaderboard />
        </div>
        
        {/* Pro Tips */}
        <div className="rounded-xl bg-gradient-to-br from-primary-50 via-white to-amber-50 border border-primary-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-primary-500" />
            <h3 className="font-bold text-gray-900">Pro Tips</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <Flame className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-600">Post during peak hours for max visibility</p>
            </div>
            <div className="flex items-start gap-2">
              <Flame className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-600">Reply to comments to boost engagement</p>
            </div>
            <div className="flex items-start gap-2">
              <Flame className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-600">Be creative and unique for more likes</p>
            </div>
            <div className="flex items-start gap-2">
              <Flame className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-600">Replies are worth 3x more than likes!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
