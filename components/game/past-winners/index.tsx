"use client";

import { useApiQuery } from "@/hooks/use-api-query";
import { WinnerCardSkeleton } from "@/components/ui/skeletons";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface Round {
  id: number;
  date: string;
  pot_amount: number;
  winner_fid: number;
  winner_cast_hash: string;
  status: string;
}

interface RoundsData {
  success: boolean;
  data: {
    rounds: Round[];
  };
}

export default function PastWinners() {
  const { data, isLoading, error } = useApiQuery<RoundsData>({
    queryKey: ["past-winners"],
    url: "/api/game/rounds",
    isProtected: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <WinnerCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-brutal-red border-3 border-black shadow-brutal p-4">
        <p className="font-mono text-sm text-white uppercase tracking-wide">
          ERROR: FAILED TO LOAD PAST WINNERS
        </p>
      </div>
    );
  }

  const rounds = data?.data?.rounds || [];

  if (rounds.length === 0) {
    return (
      <div className="bg-white border-3 border-black border-dashed p-8 text-center">
        <div className="w-16 h-16 bg-black mx-auto mb-4 flex items-center justify-center transform rotate-6">
          <span className="font-bebas text-3xl text-white">?</span>
        </div>
        <p className="font-bebas text-2xl uppercase mb-1">NO COMPLETED ROUNDS</p>
        <p className="font-mono text-xs text-black/60 uppercase tracking-wide">CHECK BACK TOMORROW!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-bebas text-2xl uppercase tracking-wider">PAST WINS</h2>
        <span className="bg-black text-white px-3 py-1 font-mono text-xs uppercase tracking-wider">
          {rounds.length} ROUNDS
        </span>
      </div>

      {/* Winners List */}
      <div className="space-y-3">
        {rounds.map((round, index) => {
          const rotations = ['-rotate-1', 'rotate-1', '-rotate-0.5', 'rotate-0.5'];
          const rotation = rotations[index % rotations.length];
          
          return (
            <div
              key={round.id}
              className={cn(
                "bg-white border-3 border-black shadow-brutal transition-all duration-75 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg transform",
                rotation
              )}
            >
              <div className="flex items-center gap-3 p-4">
                {/* Round Badge */}
                <div className="flex-shrink-0 w-14 h-14 bg-black text-white flex flex-col items-center justify-center transform -rotate-3">
                  <span className="font-mono text-[10px] uppercase tracking-wider">RND</span>
                  <span className="font-bebas text-xl leading-none">#{round.id}</span>
                </div>

                {/* Winner Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bebas text-lg uppercase tracking-wide">
                      FID {round.winner_fid}
                    </span>
                    <span className="bg-brutal-red text-white px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider">
                      WINNER
                    </span>
                  </div>
                  <p className="font-mono text-xs text-black/60 uppercase tracking-wider">
                    {new Date(round.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).toUpperCase()}
                  </p>
                </div>

                {/* Prize Amount */}
                <div className="text-right">
                  <p className="font-bebas text-2xl text-brutal-red">
                    {round.pot_amount.toFixed(1)}
                  </p>
                  <p className="font-mono text-[10px] text-black/60 uppercase tracking-wider">USDC WON</p>
                </div>

                {/* View Button */}
                {round.winner_cast_hash && (
                  <a
                    href={`https://warpcast.com/${round.winner_fid}/${round.winner_cast_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center border-3 border-black text-black hover:bg-black hover:text-white transition-colors duration-75"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
