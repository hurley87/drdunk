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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Round Status</h3>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
          <p className="text-xs text-orange-700 mb-1">Pot Size</p>
          <p className="text-xl font-bold text-orange-600">
            {potAmount.toFixed(1)}
          </p>
          <p className="text-xs text-orange-600">USDC</p>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700 mb-1">Entries</p>
          <p className="text-xl font-bold text-blue-600">{entryCount}</p>
          <p className="text-xs text-blue-600">Players</p>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
          <p className="text-xs text-purple-700 mb-1">Time Left</p>
          <p className="text-sm font-bold text-purple-600">{timeRemaining}</p>
        </div>
      </div>

      {hasEntered && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-green-800 font-medium">
            You&apos;re in! Good luck!
          </p>
        </div>
      )}
    </div>
  );
}

