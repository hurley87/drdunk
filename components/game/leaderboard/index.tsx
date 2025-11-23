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
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Today&apos;s Leaderboard</h2>
        {timeRemaining && (
          <p className="text-sm text-gray-600 mt-1">
            Round ends in: <span className="font-semibold text-orange-600">{timeRemaining}</span>
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
        <div className="space-y-3">
          {leaderboard.map((entry, index) => {
            const isWinning = entry.rank === 1;
            const isTop3 = entry.rank <= 3;
            
            return (
              <div
                key={entry.castHash}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isWinning
                    ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-300 shadow-md"
                    : isTop3
                    ? "bg-gradient-to-br from-blue-50 to-purple-50 border-purple-200"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Rank Badge */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    isWinning
                      ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg"
                      : isTop3
                      ? "bg-gradient-to-br from-blue-400 to-purple-500 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {isWinning ? "👑" : `#${entry.rank}`}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-gray-500">FID {entry.fid}</span>
                      {isWinning && (
                        <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                          Leading!
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800 mb-3 line-clamp-3">{entry.dunkText}</p>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1 text-gray-600">
                        <span className="font-semibold text-gray-900">{entry.likes}</span> 👍
                      </span>
                      <span className="flex items-center gap-1 text-gray-600">
                        <span className="font-semibold text-gray-900">{entry.recasts}</span> 🔄
                      </span>
                      <span className="flex items-center gap-1 text-gray-600">
                        <span className="font-semibold text-gray-900">{entry.replies}</span> 💬
                      </span>
                      <span className="flex items-center gap-1 font-bold text-orange-600 ml-auto">
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
                      className={`flex-shrink-0 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        isWinning
                          ? "bg-orange-600 text-white hover:bg-orange-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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

