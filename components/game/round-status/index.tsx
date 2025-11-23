"use client";

import { useApiQuery } from "@/hooks/use-api-query";
import { useUser } from "@/contexts/user-context";
import { formatTimeRemaining, getTimeRemaining, getCurrentRoundId } from "@/lib/game-utils";
import { useEffect, useState } from "react";

interface RoundData {
  success: boolean;
  data: {
    round: {
      id: number;
      date: string;
      pot_amount: number;
      status: string;
    };
    entryCount: number;
  };
}

export default function RoundStatus() {
  const { user } = useUser();
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  const { data, isLoading, error } = useApiQuery<RoundData>({
    queryKey: ["round-status"],
    url: "/api/game/rounds?current=true",
    isProtected: false,
    refetchInterval: 60000, // Refetch every minute
  });

  // Check if user has entered
  const { data: userEntry } = useApiQuery<{ success: boolean; data: any }>({
    queryKey: ["user-entry", user?.data?.fid, getCurrentRoundId()],
    url: `/api/game/entries?roundId=${getCurrentRoundId()}`,
    isProtected: true,
    enabled: !!user?.data?.fid,
  });

  useEffect(() => {
    if (data?.data?.round?.id) {
      const updateTime = () => {
        const remaining = getTimeRemaining(data.data.round.id);
        setTimeRemaining(formatTimeRemaining(remaining));
      };
      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [data?.data?.round?.id]);

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            Failed to load round status. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const round = data?.data?.round;
  const entryCount = data?.data?.entryCount || 0;
  const potAmount = round?.pot_amount || 0;
  const hasEntered = !!userEntry?.data;

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Current Round</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Pot Size:</span>
            <span className="text-2xl font-bold text-purple-600">
              {potAmount.toFixed(1)} USDC
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Entries:</span>
            <span className="text-xl font-semibold">{entryCount}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Time Remaining:</span>
            <span className="text-lg font-semibold">{timeRemaining}</span>
          </div>

          {hasEntered && (
            <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-sm text-green-800 font-medium">
                ✓ You&apos;ve entered this round!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

