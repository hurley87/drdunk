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
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Today&apos;s Leaderboard</h2>
        {timeRemaining && (
          <p className="text-sm text-gray-600">
            Round ends in: <span className="font-semibold">{timeRemaining}</span>
          </p>
        )}
      </div>

      {leaderboard.length === 0 ? (
        <div className="p-8 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-gray-600">No entries yet. Be the first to enter!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaderboard.map((entry) => (
            <div
              key={entry.castHash}
              className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold">
                      #{entry.rank}
                    </span>
                    <span className="text-sm text-gray-600">FID: {entry.fid}</span>
                  </div>
                  <p className="text-gray-800 mb-3">{entry.dunkText}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <span className="font-semibold">{entry.likes}</span> likes
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-semibold">{entry.recasts}</span> recasts
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-semibold">{entry.replies}</span> replies
                    </span>
                    <span className="flex items-center gap-1 font-bold text-purple-600">
                      Score: {entry.engagementScore.toFixed(1)}
                    </span>
                  </div>
                </div>
                {entry.castUrl && (
                  <a
                    href={entry.castUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    View Cast
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

