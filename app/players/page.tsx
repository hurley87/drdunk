import { Metadata } from "next";
import PastWinners from "@/components/game/past-winners";
import { Users, Award, TrendingUp, Crown, Star, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "PLAYER LEADERBOARD - DOCTOR DUNK",
  description: "VIEW TOP PLAYERS AND PAST WINNERS IN THE DOCTOR DUNK GAME",
};

export default function PlayersPage() {
  return (
    <div className="min-h-screen pb-24 bg-white bg-stripes">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute top-8 left-4 w-20 h-20 bg-red-500 border-3 border-black -rotate-12 opacity-20" />
      <div className="pointer-events-none absolute top-56 right-0 w-16 h-32 bg-black rotate-6 opacity-10" />

      {/* Header Section - Brutalist */}
      <div className="border-b-3 border-black bg-white">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-black border-3 border-black shadow-brutal-red flex items-center justify-center transform -rotate-3">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="font-brutal text-4xl md:text-5xl tracking-wider text-black leading-none transform rotate-1">
                PLAYERS
              </h1>
              <p className="font-mono text-xs uppercase tracking-widest text-black/60 mt-1 transform -rotate-1">
                HALL OF CHAMPIONS
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Past Winners - Main Card */}
        <div className="bg-white border-3 border-black shadow-brutal p-6 transform -rotate-[0.5deg] hover:rotate-0 transition-transform duration-75">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-500 border-3 border-black flex items-center justify-center transform rotate-6">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-brutal text-2xl tracking-wider text-black uppercase">
              PAST WINNERS
            </h2>
          </div>
          <PastWinners />
        </div>

        {/* Coming Soon Card - Brutalist */}
        <div className="relative bg-white border-3 border-black shadow-brutal p-8 text-center transform rotate-[0.5deg] hover:rotate-0 transition-transform duration-75 overflow-hidden">
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-12 h-12 bg-black transform -translate-x-6 -translate-y-6 rotate-45" />
          <div className="absolute bottom-0 right-0 w-12 h-12 bg-red-500 transform translate-x-6 translate-y-6 rotate-45" />
          
          <div className="relative">
            <div className="w-16 h-16 bg-black border-3 border-black flex items-center justify-center mx-auto mb-4 transform -rotate-6">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-brutal text-3xl tracking-wider text-black mb-2 uppercase">
              ALL-TIME LEADERBOARD
            </h3>
            <p className="font-mono text-xs uppercase tracking-wide text-black/60 max-w-sm mx-auto mb-6">
              WE&apos;RE BUILDING A COMPREHENSIVE LEADERBOARD WITH ALL-TIME STATS, WIN STREAKS, AND MORE!
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white border-3 border-black shadow-brutal font-brutal text-lg uppercase tracking-wider transform -rotate-2">
              <Star className="w-5 h-5" />
              COMING SOON
            </div>
          </div>
        </div>

        {/* Stats Legend - Offset Grid */}
        <div className="bg-white border-3 border-black shadow-brutal p-6 transform -rotate-[0.5deg] hover:rotate-0 transition-transform duration-75">
          <h3 className="font-brutal text-2xl tracking-wider text-black mb-6 uppercase">
            UNDERSTANDING THE STATS
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 border-3 border-black bg-white transform translate-x-1">
              <Crown className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-brutal text-lg uppercase tracking-wide text-black">TOTAL WINS</p>
                <p className="font-mono text-xs uppercase tracking-wide text-black/60">DAILY COMPETITIONS WON</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border-3 border-black bg-white transform -translate-x-2 translate-y-1">
              <TrendingUp className="w-6 h-6 text-black mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-brutal text-lg uppercase tracking-wide text-black">PARTICIPATION</p>
                <p className="font-mono text-xs uppercase tracking-wide text-black/60">TOTAL ENTRIES SUBMITTED</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border-3 border-black bg-white transform -translate-x-1">
              <Award className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-brutal text-lg uppercase tracking-wide text-black">TOTAL WINNINGS</p>
                <p className="font-mono text-xs uppercase tracking-wide text-black/60">PRIZE MONEY EARNED</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border-3 border-black bg-white transform translate-x-2 -translate-y-1">
              <Users className="w-6 h-6 text-black mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-brutal text-lg uppercase tracking-wide text-black">WIN RATE</p>
                <p className="font-mono text-xs uppercase tracking-wide text-black/60">PERCENTAGE OF WINS</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
