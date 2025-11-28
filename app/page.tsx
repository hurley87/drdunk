import { Metadata } from "next";
import Leaderboard from "@/components/game/leaderboard";
import { Trophy, ArrowRight } from "lucide-react";
import TodayStats from "@/components/game/today-stats";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen bg-white pb-20">
      {/* Header Section */}
      <div className="border-b border-gray-200 bg-white animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center animate-pop">
              <Trophy className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Daily Dunk</h1>
              <p className="text-sm text-gray-500">{formattedDate}</p>
            </div>
          </div>

          {/* Today's Stats */}
          <div className="animate-in fade-in zoom-in-95 duration-500 delay-100">
            <TodayStats />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* How It Works */}
        <div className="card animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h2>
          <div className="space-y-4 mb-6">
            {[
              {
                step: 1,
                text: "Pay 1 USDC to enter and submit your dunk cast",
              },
              {
                step: 2,
                text: "Get engagement on your cast (likes, recasts, replies)",
              },
              {
                step: 3,
                text: "Highest engagement score at midnight UTC wins 90% of the pot",
              },
            ].map((item, index) => (
              <div 
                key={item.step} 
                className={cn(
                  "flex gap-3 animate-in slide-in-from-left-4 fade-in duration-500 fill-mode-backwards",
                  index === 0 ? "delay-300" : index === 1 ? "delay-400" : "delay-500"
                )}
              >
                <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-medium shadow-sm">
                  {item.step}
                </div>
                <p className="text-sm text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
          <Button asChild className="w-full group relative overflow-hidden" size="lg">
            <Link href="/create">
              <span className="relative z-10 flex items-center justify-center gap-2">
                Submit your cast <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </Button>
        </div>

        {/* Leaderboard */}
        <div className="card animate-in slide-in-from-bottom-4 fade-in duration-500 delay-500">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}
