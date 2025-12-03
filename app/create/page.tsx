import { Metadata } from "next";
import EntryForm from "@/components/game/entry-form";
import { Zap, Clock, Trophy, TrendingUp, MessageCircle, Heart, Repeat } from "lucide-react";

export const metadata: Metadata = {
  title: "CREATE DUNK - DOCTOR DUNK",
  description: "SUBMIT YOUR DUNK AND COMPETE FOR THE DAILY PRIZE POOL!",
};

export default function CreateDunkPage() {
  return (
    <div className="min-h-screen pb-24 bg-white bg-stripes">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute top-12 right-4 w-16 h-16 bg-red-500 border-3 border-black rotate-45 opacity-20" />
      <div className="pointer-events-none absolute top-64 left-0 w-12 h-24 bg-black -rotate-12 opacity-10" />

      {/* Header Section - Brutalist */}
      <div className="border-b-3 border-black bg-white">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-red-500 border-3 border-black shadow-brutal flex items-center justify-center transform rotate-3">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="font-brutal text-4xl md:text-5xl tracking-wider text-black leading-none transform -rotate-1">
                CREATE YOUR DUNK
              </h1>
              <p className="font-mono text-xs uppercase tracking-widest text-black/60 mt-1">
                SUBMIT YOUR ENTRY TO COMPETE
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Brutalist Chaos */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Entry Form Card - Main Focus */}
        <div className="bg-white border-3 border-black shadow-brutal p-6">
          <EntryForm />
        </div>

        {/* Scoring Card - Rotated */}
        <div className="bg-white border-3 border-black shadow-brutal p-6 transform -rotate-1 hover:rotate-0 transition-transform duration-75">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-black border-3 border-black flex items-center justify-center transform rotate-6">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-brutal text-2xl tracking-wider text-black uppercase">
              ENGAGEMENT SCORING
            </h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border-3 border-black bg-white transform translate-x-2">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="font-mono text-sm uppercase tracking-wide text-black">LIKES</span>
              </div>
              <span className="font-brutal text-xl bg-black text-white px-3 py-1">1 PT</span>
            </div>
            <div className="flex items-center justify-between p-4 border-3 border-black bg-white transform -translate-x-1">
              <div className="flex items-center gap-3">
                <Repeat className="w-5 h-5 text-black" />
                <span className="font-mono text-sm uppercase tracking-wide text-black">RECASTS</span>
              </div>
              <span className="font-brutal text-xl bg-black text-white px-3 py-1">2 PTS</span>
            </div>
            <div className="flex items-center justify-between p-4 border-3 border-black bg-white transform translate-x-3">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-black" />
                <span className="font-mono text-sm uppercase tracking-wide text-black">REPLIES</span>
              </div>
              <span className="font-brutal text-xl bg-red-500 text-white px-3 py-1">3 PTS</span>
            </div>
          </div>
        </div>

        {/* Tips Card - Offset */}
        <div className="bg-white border-3 border-black shadow-brutal p-6 transform rotate-1 hover:rotate-0 transition-transform duration-75">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-500 border-3 border-black flex items-center justify-center transform -rotate-6">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-brutal text-2xl tracking-wider text-black uppercase">
              TIPS FOR WINNING
            </h2>
          </div>
          
          <div className="grid gap-4">
            <div className="flex gap-4 p-4 border-3 border-black bg-white transform -rotate-1">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center flex-shrink-0 font-brutal text-lg">
                ⏰
              </div>
              <div>
                <p className="font-brutal text-lg uppercase tracking-wide text-black">TIMING IS EVERYTHING</p>
                <p className="font-mono text-xs uppercase tracking-wide text-black/60">POST DURING PEAK HOURS</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 border-3 border-black bg-white transform rotate-1 translate-x-2">
              <div className="w-10 h-10 bg-red-500 text-white flex items-center justify-center flex-shrink-0 font-brutal text-lg">
                ✨
              </div>
              <div>
                <p className="font-brutal text-lg uppercase tracking-wide text-black">BE CREATIVE</p>
                <p className="font-mono text-xs uppercase tracking-wide text-black/60">UNIQUE CONTENT WINS</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 border-3 border-black bg-white transform -rotate-1 -translate-x-1">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center flex-shrink-0 font-brutal text-lg">
                💬
              </div>
              <div>
                <p className="font-brutal text-lg uppercase tracking-wide text-black">ENGAGE BACK</p>
                <p className="font-mono text-xs uppercase tracking-wide text-black/60">REPLY TO COMMENTS</p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Info - Warning Style */}
        <div className="bg-red-500 border-3 border-black shadow-brutal p-5 transform -rotate-1">
          <h3 className="font-brutal text-xl text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Clock className="w-5 h-5" />
            IMPORTANT INFORMATION
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 font-mono text-xs text-white uppercase tracking-wide">
              <div className="w-2 h-2 bg-white transform rotate-45" />
              ONE ENTRY PER DAY
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-white uppercase tracking-wide">
              <div className="w-2 h-2 bg-white transform rotate-45" />
              WINNERS AT MIDNIGHT UTC
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-white uppercase tracking-wide">
              <div className="w-2 h-2 bg-white transform rotate-45" />
              ENTRY FEE: 1 USDC
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-white uppercase tracking-wide">
              <div className="w-2 h-2 bg-white transform rotate-45" />
              TIES: EARLIEST ENTRY WINS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
