import { Metadata } from "next";
import Leaderboard from "@/components/game/leaderboard";

export const metadata: Metadata = {
  title: "DAILY LEADERBOARD - DOCTOR DUNK",
  description: "TODAY'S DUNK COMPETITION LEADERBOARD",
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-white pb-20 bg-stripes">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute top-0 right-8 w-20 h-20 bg-red-500 border-3 border-black rotate-12 opacity-20" />
      <div className="pointer-events-none absolute top-48 left-0 w-12 h-32 bg-black -rotate-6 opacity-10" />

      {/* Header Section */}
      <div className="border-b-3 border-black bg-white relative">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-500 border-3 border-black shadow-brutal flex items-center justify-center rotate-3">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter">
                <path d="M8 4h8" />
                <path d="M10 4v2a2 2 0 0 0 2 2v0a2 2 0 0 0 2-2V4" />
                <path d="M5 8V6a2 2 0 0 1 2-2h0" />
                <path d="M19 8V6a2 2 0 0 0-2-2h0" />
                <path d="M4 8h3" />
                <path d="M20 8h-3" />
                <path d="M7 17a5 5 0 0 0 10 0" />
                <path d="M8 21h8" />
              </svg>
            </div>
            <div>
              <h1 className="font-brutal text-3xl md:text-4xl uppercase -rotate-1">DAILY LEADERBOARD</h1>
              <p className="font-mono text-xs text-black/60 uppercase tracking-wider">SEE WHO&apos;S LEADING TODAY</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white border-3 border-black shadow-brutal p-5 rotate-[0.3deg]">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}
