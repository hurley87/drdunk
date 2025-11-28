import { Metadata } from "next";
import EntryForm from "@/components/game/entry-form";
import { Sparkles, Clock, Trophy, TrendingUp, MessageCircle, Heart, Repeat } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Dunk - Doctor Dunk",
  description: "Submit your dunk and compete for the daily prize pool!",
};

export default function CreateDunkPage() {
  return (
    <div className="min-h-screen pb-20">
      {/* Header Section */}
      <div className="bg-mesh border-b border-gray-200/50">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-amber-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500 to-amber-500 blur-lg opacity-30 -z-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient-orange">Create Your Dunk</h1>
              <p className="text-sm text-gray-500">Submit your entry to compete</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Entry Form Card */}
        <div className="card-glow">
          <EntryForm />
        </div>

        {/* Scoring Card - Enhanced */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Engagement Scoring</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-medium text-gray-700">Likes</span>
              </div>
              <span className="text-sm font-bold text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full">1 point</span>
            </div>
            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Recasts</span>
              </div>
              <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">2 points</span>
            </div>
            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Replies</span>
              </div>
              <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">3 points</span>
            </div>
          </div>
          
        </div>

        {/* Tips Card - Enhanced */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Tips for Winning</h2>
          </div>
          
          <div className="grid gap-3">
            <div className="flex gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100">
              <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center flex-shrink-0 text-sm">
                ⏰
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Timing is Everything</p>
                <p className="text-xs text-gray-500">Post during peak hours for maximum visibility</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100">
              <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0 text-sm">
                ✨
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Be Creative</p>
                <p className="text-xs text-gray-500">Unique content gets more engagement</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100">
              <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center flex-shrink-0 text-sm">
                💬
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Engage Back</p>
                <p className="text-xs text-gray-500">Reply to comments to boost your score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Info - Enhanced */}
        <div className="rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 p-5 shadow-lg shadow-amber-500/10">
          <h3 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Important Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-xs text-amber-800">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              One entry per day per player
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-800">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Winners calculated at midnight UTC
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-800">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Entry fee: 1 USDC (90% to pot)
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-800">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              In case of ties, earliest entry wins
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
