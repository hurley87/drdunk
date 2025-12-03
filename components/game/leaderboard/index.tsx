"use client";

import { useApiQuery } from "@/hooks/use-api-query";
import { formatTimeRemaining, getTimeRemaining } from "@/lib/game-utils";
import { useEffect, useState } from "react";
import { LeaderboardSkeleton } from "@/components/ui/skeletons";
import { Eye } from "lucide-react";
import { sdk } from "@farcaster/miniapp-sdk";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  fid: number;
  castHash: string;
  castUrl: string;
  dunkText: string;
  engagementScore: number;
  likes: number;
  recasts: number;
  replies: number;
  createdAt: string;
}

interface LeaderboardData {
  success: boolean;
  data: {
    roundId: number;
    leaderboard: LeaderboardEntry[];
  };
}

export default function Leaderboard() {
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  const { data, isLoading, error } = useApiQuery<LeaderboardData>({
    queryKey: ["leaderboard"],
    url: "/api/game/leaderboard",
    isProtected: false,
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (data?.data?.roundId) {
      const updateTime = () => {
        const remaining = getTimeRemaining(data.data.roundId);
        setTimeRemaining(formatTimeRemaining(remaining));
      };
      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [data?.data?.roundId]);

  if (isLoading) {
    return <LeaderboardSkeleton />;
  }

  if (error) {
    return (
      <div className="border-3 border-black bg-red-500 p-4 shadow-brutal">
        <p className="font-mono text-sm text-white uppercase tracking-wide">
          FAILED TO LOAD LEADERBOARD. PLEASE TRY AGAIN.
        </p>
      </div>
    );
  }

  const leaderboard = data?.data?.leaderboard || [];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-brutal text-2xl md:text-3xl uppercase">TODAY&apos;S BOARD</h2>
        {timeRemaining && (
          <span className="font-mono text-xs uppercase bg-black text-white px-3 py-1">
            {timeRemaining}
          </span>
        )}
      </div>

      {leaderboard.length === 0 ? (
        <div className="bg-white border-3 border-black border-dashed p-8 text-center">
          <div className="w-16 h-16 bg-black mx-auto mb-4 flex items-center justify-center rotate-3">
            <span className="font-brutal text-3xl text-white">?</span>
          </div>
          <p className="font-brutal text-xl uppercase mb-1">NO ENTRIES YET</p>
          <p className="font-mono text-xs text-black/60 uppercase">Be the first to claim the pot!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => {
            const isWinning = entry.rank === 1;
            const rotation = index % 2 === 0 ? "rotate-[0.5deg]" : "rotate-[-0.5deg]";

            return (
              <div
                key={entry.castHash}
                className={cn(
                  "border-3 border-black transition-all duration-100",
                  rotation,
                  isWinning
                    ? "bg-red-500 text-white shadow-brutal-lg scale-[1.02] -rotate-1"
                    : "bg-white shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-3 p-4">
                  {/* Rank Badge */}
                  <div
                    className={cn(
                      "flex-shrink-0 w-10 h-10 flex items-center justify-center font-brutal text-2xl border-3",
                      isWinning
                        ? "bg-white text-red-500 border-white"
                        : "bg-black text-white border-black"
                    )}
                  >
                    {entry.rank}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "font-mono text-[10px] uppercase tracking-wider",
                        isWinning ? "text-white/70" : "text-black/60"
                      )}>
                        FID {entry.fid}
                      </span>
                      {isWinning && (
                        <span className="bg-white text-red-500 px-2 py-0.5 font-mono text-[10px] uppercase font-bold">
                          LEADING
                        </span>
                      )}
                    </div>
                    <p className={cn(
                      "font-mono text-sm mb-2 line-clamp-2",
                      isWinning ? "text-white" : "text-black"
                    )}>
                      {entry.dunkText}
                    </p>

                    {/* Stats */}
                    <div className={cn(
                      "flex items-center gap-3 font-mono text-[10px] uppercase",
                      isWinning ? "text-white/70" : "text-black/60"
                    )}>
                      <span>
                        <span className={cn("font-bold", isWinning ? "text-white" : "text-black")}>{entry.likes}</span> LIKES
                      </span>
                      <span>
                        <span className={cn("font-bold", isWinning ? "text-white" : "text-black")}>{entry.recasts}</span> RECASTS
                      </span>
                      <span>
                        <span className={cn("font-bold", isWinning ? "text-white" : "text-black")}>{entry.replies}</span> REPLIES
                      </span>
                      <span className={cn(
                        "ml-auto font-bold",
                        isWinning ? "text-white" : "text-red-500"
                      )}>
                        {entry.engagementScore.toFixed(0)} PTS
                      </span>
                    </div>
                  </div>

                  {/* View Cast Button */}
                  {entry.castHash && (
                    <button
                      type="button"
                      onClick={() => {
                        sdk.actions.viewCast({ hash: entry.castHash });
                      }}
                      className={cn(
                        "flex-shrink-0 w-10 h-10 flex items-center justify-center border-3 transition-all duration-100 cursor-pointer",
                        isWinning
                          ? "border-white text-white hover:bg-white hover:text-red-500"
                          : "border-black text-black hover:bg-black hover:text-white"
                      )}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
