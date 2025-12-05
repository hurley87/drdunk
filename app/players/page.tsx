import { Metadata } from "next";
import PastWinners from "@/components/game/past-winners";
import { Users, Crown } from "lucide-react";

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
      </div>
    </div>
  );
}
