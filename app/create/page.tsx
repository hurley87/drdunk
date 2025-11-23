import { Metadata } from "next";
import EntryForm from "@/components/game/entry-form";
import { Sparkles, DollarSign, TrendingUp, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Dunk - Doctor Dunk",
  description: "Submit your dunk and compete for the daily prize pool!",
};

export default function CreateDunkPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Create Your Dunk</h1>
              <p className="text-orange-100">Submit your entry to compete</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Entry Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <EntryForm />
        </div>

        {/* Tips Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Pro Tips for Winning
          </h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                <strong>Timing matters:</strong> Post during peak hours for maximum visibility
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                <strong>Be creative:</strong> Unique and funny dunks get more engagement
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                <strong>Engage back:</strong> Reply to comments to boost your engagement score
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                <strong>Share widely:</strong> Promote your dunk in relevant channels
              </p>
            </div>
          </div>
        </div>

        {/* Scoring Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Engagement Scoring</h2>
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
          <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-xs text-orange-800">
              <strong>Formula:</strong> Score = (Likes × 1) + (Recasts × 2) + (Replies × 3)
            </p>
          </div>
        </div>

        {/* Important Info */}
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
          <h3 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
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

