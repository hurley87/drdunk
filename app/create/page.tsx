import { Metadata } from "next";
import EntryForm from "@/components/game/entry-form";
import { Sparkles, DollarSign, TrendingUp, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Dunk - Doctor Dunk",
  description: "Submit your dunk and compete for the daily prize pool!",
};

export default function CreateDunkPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-accent-600/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-glow-pink animate-float">
              <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 drop-shadow-lg" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-md">Create Your Dunk</h1>
              <p className="text-xs sm:text-sm text-white/90">Submit your entry to compete</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Entry Form Card */}
        <div className="card shadow-soft-lg">
          <EntryForm />
        </div>

        {/* Tips Card */}
        <div className="card-gradient border-secondary-200">
          <h2 className="text-lg sm:text-xl font-bold bg-gradient-secondary bg-clip-text text-transparent mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-secondary-600" />
            Pro Tips for Winning
          </h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-secondary mt-1.5 flex-shrink-0 shadow-sm" />
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong className="text-secondary-700">Timing matters:</strong> Post during peak hours for maximum visibility
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-accent mt-1.5 flex-shrink-0 shadow-sm" />
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong className="text-accent-700">Be creative:</strong> Unique and funny dunks get more engagement
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-primary mt-1.5 flex-shrink-0 shadow-sm" />
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong className="text-primary-700">Engage back:</strong> Reply to comments to boost your engagement score
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-secondary mt-1.5 flex-shrink-0 shadow-sm" />
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong className="text-secondary-700">Share widely:</strong> Promote your dunk in relevant channels
              </p>
            </div>
          </div>
        </div>

        {/* Scoring Card */}
        <div className="card">
          <h2 className="text-lg sm:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">Engagement Scoring</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-700">👍 Likes</span>
              <span className="text-sm font-bold text-gray-900">1 point each</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-700">🔄 Recasts</span>
              <span className="text-sm font-bold text-gray-900">2 points each</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">💬 Replies</span>
              <span className="text-sm font-bold text-gray-900">3 points each</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gradient-primary/10 rounded-lg border border-primary-200">
            <p className="text-xs text-primary-800 font-medium">
              <strong>Formula:</strong> Score = (Likes × 1) + (Recasts × 2) + (Replies × 3)
            </p>
          </div>
        </div>

        {/* Important Info */}
        <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl border border-primary-200 p-4 sm:p-6 shadow-soft">
          <h3 className="text-sm font-bold bg-gradient-primary bg-clip-text text-transparent mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-600" />
            Important Information
          </h3>
          <ul className="space-y-2 text-xs text-amber-800">
            <li className="flex gap-2">
              <span>•</span>
              <span>One entry per day per player</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Winners are calculated at midnight UTC</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Entry fee: 1 USDC (90% to pot, 10% fee)</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>In case of ties, earliest entry wins</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

