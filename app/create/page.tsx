import { Metadata } from "next";
import EntryForm from "@/components/game/entry-form";
import { Sparkles, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Dunk - Doctor Dunk",
  description: "Submit your dunk and compete for the daily prize pool!",
};

export default function CreateDunkPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header Section */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Create Your Dunk</h1>
              <p className="text-sm text-gray-500">Submit your entry to compete</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Entry Form Card */}
        <div className="card">
          <EntryForm />
        </div>

        {/* Scoring Card */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Engagement Scoring</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Likes</span>
              <span className="text-sm font-medium text-gray-900">1 point each</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Recasts</span>
              <span className="text-sm font-medium text-gray-900">2 points each</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Replies</span>
              <span className="text-sm font-medium text-gray-900">3 points each</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <span className="font-medium">Formula:</span> Score = (Likes × 1) + (Recasts × 2) + (Replies × 3)
            </p>
          </div>
        </div>

        {/* Tips Card */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tips for Winning</h2>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="text-primary-500">•</span>
              <span><strong className="text-gray-900">Timing:</strong> Post during peak hours for maximum visibility</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary-500">•</span>
              <span><strong className="text-gray-900">Be creative:</strong> Unique content gets more engagement</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary-500">•</span>
              <span><strong className="text-gray-900">Engage back:</strong> Reply to comments to boost your score</span>
            </li>
          </ul>
        </div>

        {/* Important Info */}
        <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
          <h3 className="text-sm font-medium text-amber-900 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Important Information
          </h3>
          <ul className="space-y-1.5 text-xs text-amber-800">
            <li>• One entry per day per player</li>
            <li>• Winners calculated at midnight UTC</li>
            <li>• Entry fee: 1 USDC (90% to pot, 10% fee)</li>
            <li>• In case of ties, earliest entry wins</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
