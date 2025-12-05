import { Metadata } from "next";
import Leaderboard from "@/components/game/leaderboard";
import TodayStats from "@/components/game/today-stats";
import ClaimReward from "@/components/game/claim-reward";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Doctor Dunk - Daily Leaderboard",
  description: "Compete in the daily dunk competition. Highest engagement wins!",
};

export default function DailyLeaderboardPage() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-white pb-20 bg-stripes">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute top-0 left-8 w-20 h-20 bg-red-500 border-3 border-black -rotate-12 opacity-30" />
      <div className="pointer-events-none absolute top-40 right-0 w-16 h-32 bg-black rotate-6 opacity-10" />

      {/* Header Section */}
      <div className="border-b-3 border-black bg-white relative">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-red-500 border-3 border-black shadow-brutal flex items-center justify-center -rotate-3">
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
              <h1 className="font-brutal text-3xl md:text-4xl uppercase">DAILY DUNK</h1>
              <p className="font-mono text-xs text-black/60 uppercase tracking-wider">{formattedDate}</p>
            </div>
          </div>

          {/* Today's Stats */}
          <div className="rotate-[0.3deg]">
            <TodayStats />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 relative">
        {/* Claimable Rewards */}
        <ClaimReward />

        {/* How It Works */}
        <div className="bg-white border-3 border-black shadow-brutal -rotate-[0.5deg]">
          <div className="p-4 border-b-3 border-black bg-black text-white">
            <h2 className="font-brutal text-2xl uppercase">HOW IT WORKS</h2>
          </div>
          <div className="p-5 space-y-4">
            {[
              {
                step: 1,
                text: "PAY 1 USDC TO ENTER AND SUBMIT YOUR DUNK CAST",
              },
              {
                step: 2,
                text: "GET ENGAGEMENT ON YOUR CAST (LIKES, RECASTS, REPLIES)",
              },
              {
                step: 3,
                text: "HIGHEST ENGAGEMENT SCORE AT MIDNIGHT UTC WINS 90% OF THE POT",
              },
            ].map((item, index) => {
              const rotation = index === 0 ? "rotate-[0.3deg]" : index === 1 ? "-rotate-[0.2deg]" : "rotate-[0.1deg]";
              return (
                <div 
                  key={item.step} 
                  className={`flex gap-4 items-start ${rotation}`}
                >
                  <div className="w-8 h-8 bg-red-500 text-white border-3 border-black shadow-brutal-sm flex items-center justify-center flex-shrink-0 font-brutal text-lg">
                    {item.step}
                  </div>
                  <p className="font-mono text-sm text-black/80 uppercase leading-relaxed pt-1">{item.text}</p>
                </div>
              );
            })}
          </div>
          <div className="p-5 pt-0">
            <Button asChild className="w-full" size="lg">
              <Link href="/create">
                <span className="flex items-center justify-center gap-2">
                  SUBMIT YOUR CAST 
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white border-3 border-black shadow-brutal p-5 rotate-[0.3deg]">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}
