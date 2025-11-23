"use client";

import { useApiQuery } from "@/hooks/use-api-query";
import { formatTimeRemaining, getTimeRemaining } from "@/lib/game-utils";
import { useEffect, useState } from "react";

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

  const { data, isLoading, error, refetch } = useApiQuery<LeaderboardData>({
    queryKey: ["leaderboard"],
    url: "/api/game/leaderboard",
    isProtected: false,
    refetchInterval: 30000, // Refetch every 30 seconds
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
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            Failed to load leaderboard. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const leaderboard = data?.data?.leaderboard || [];

  return (
    <div className="w-full">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">Today&apos;s Leaderboard</h2>
        {timeRemaining && (
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Round ends in: <span className="font-semibold bg-gradient-accent bg-clip-text text-transparent">{timeRemaining}</span>
          </p>
        )}
      </div>

      {leaderboard.length === 0 ? (
        <div className="p-12 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl text-center">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium mb-2">No entries yet</p>
          <p className="text-sm text-gray-500">Be the first to enter and claim the pot!</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {leaderboard.map((entry, index) => {
            const isWinning = entry.rank === 1;
            const isTop3 = entry.rank <= 3;
            
            return (
              <div
                key={entry.castHash}
                className={`p-3 sm:p-4 rounded-xl border-2 transition-all active:scale-[0.98] ${
                  isWinning
                    ? "bg-gradient-to-br from-primary-50 to-accent-50 border-primary-300 shadow-glow-orange"
                    : isTop3
                    ? "bg-gradient-to-br from-secondary-50 to-primary-50 border-secondary-200 shadow-soft"
                    : "bg-white border-gray-200 active:border-primary-200 shadow-soft"
                }`}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  {/* Rank Badge */}
                  <div className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${
                    isWinning
                      ? "bg-gradient-primary text-white shadow-glow-orange"
                      : isTop3
                      ? "bg-gradient-secondary text-white shadow-glow-purple"
                      : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 border border-gray-200"
                  }`}>
                    {isWinning ? "👑" : `#${entry.rank}`}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                      <span className="text-[10px] sm:text-xs font-medium text-gray-500">FID {entry.fid}</span>
                      {isWinning && (
                        <span className="badge badge-primary text-[10px] sm:text-xs">
                          Leading! 👑
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-800 mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-3">{entry.dunkText}</p>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs flex-wrap">
                      <span className="flex items-center gap-1 text-gray-600">
                        <span className="font-semibold text-gray-900">{entry.likes}</span> 👍
                      </span>
                      <span className="flex items-center gap-1 text-gray-600">
                        <span className="font-semibold text-gray-900">{entry.recasts}</span> 🔄
                      </span>
                      <span className="flex items-center gap-1 text-gray-600">
                        <span className="font-semibold text-gray-900">{entry.replies}</span> 💬
                      </span>
                      <span className="flex items-center gap-1 font-bold bg-gradient-primary bg-clip-text text-transparent ml-auto">
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
                      className={`flex-shrink-0 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium rounded-lg transition-all active:scale-95 min-h-[32px] flex items-center ${
                        isWinning
                          ? "bg-gradient-primary text-white shadow-glow-orange active:shadow-none"
                          : "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-200 active:bg-gray-200"
                      }`}
                    >
                      View
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

