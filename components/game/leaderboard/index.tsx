"use client";

import { useApiQuery } from "@/hooks/use-api-query";
import { formatTimeRemaining, getTimeRemaining } from "@/lib/game-utils";
import { useEffect, useState } from "react";
import { LeaderboardSkeleton } from "@/components/ui/skeletons";
import { ExternalLink, Crown } from "lucide-react";
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
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 animate-in fade-in slide-in-from-bottom-2">
        <p className="text-sm text-red-800">
          Failed to load leaderboard. Please try again.
        </p>
      </div>
    );
  }

  const leaderboard = data?.data?.leaderboard || [];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Leaderboard</h2>
        {timeRemaining && (
          <span className="text-xs text-gray-500 animate-in fade-in duration-500">
            Ends in <span className="font-medium text-primary-600 tabular-nums">{timeRemaining}</span>
          </span>
        )}
      </div>

      {leaderboard.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-lg animate-in fade-in zoom-in-95 duration-500">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 animate-bounce">
            <Crown className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">No entries yet</p>
          <p className="text-xs text-gray-500">Be the first to enter and claim the pot!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry, index) => {
            const isWinning = entry.rank === 1;

            return (
              <div
                key={entry.castHash}
                className={cn(
                  "p-4 rounded-lg border transition-all duration-200 animate-in slide-in-from-bottom-2 fade-in fill-mode-backwards",
                  isWinning
                    ? "bg-primary-50 border-primary-200 shadow-sm scale-[1.02]"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm hover:translate-x-1"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  {/* Rank Badge */}
                  <div
                    className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-transform",
                      isWinning
                        ? "bg-primary-500 text-white animate-pop"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {isWinning ? <Crown className="w-4 h-4" /> : `#${entry.rank}`}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">FID {entry.fid}</span>
                      {isWinning && (
                        <span className="badge badge-primary animate-pulse">Leading</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800 mb-2 line-clamp-2">{entry.dunkText}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="transition-colors hover:text-gray-900">
                        <span className="font-medium text-gray-700">{entry.likes}</span> likes
                      </span>
                      <span className="transition-colors hover:text-gray-900">
                        <span className="font-medium text-gray-700">{entry.recasts}</span> recasts
                      </span>
                      <span className="transition-colors hover:text-gray-900">
                        <span className="font-medium text-gray-700">{entry.replies}</span> replies
                      </span>
                      <span className="ml-auto font-semibold text-primary-600">
                        {entry.engagementScore.toFixed(0)} pts
                      </span>
                    </div>
                  </div>

                  {/* View Cast Button */}
                  {entry.castUrl && (
                    <a
                      href={entry.castUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-primary-600 transition-colors hover:scale-110 active:scale-95"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
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
