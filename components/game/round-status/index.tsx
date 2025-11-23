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
    <div className="card">
      <h3 className="text-base sm:text-lg font-bold bg-gradient-primary bg-clip-text text-transparent mb-3 sm:mb-4">Round Status</h3>
      
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
        <div className="text-center p-2.5 sm:p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200 shadow-soft hover:shadow-glow-orange transition-all duration-200">
          <p className="text-[10px] sm:text-xs text-primary-700 mb-0.5 sm:mb-1 font-semibold">Pot Size</p>
          <p className="text-base sm:text-xl font-bold text-primary-600">
            {potAmount.toFixed(1)}
          </p>
          <p className="text-[10px] sm:text-xs text-primary-600">USDC</p>
        </div>

        <div className="text-center p-2.5 sm:p-4 bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl border border-secondary-200 shadow-soft hover:shadow-glow-purple transition-all duration-200">
          <p className="text-[10px] sm:text-xs text-secondary-700 mb-0.5 sm:mb-1 font-semibold">Entries</p>
          <p className="text-base sm:text-xl font-bold text-secondary-600">{entryCount}</p>
          <p className="text-[10px] sm:text-xs text-secondary-600">Players</p>
        </div>

        <div className="text-center p-2.5 sm:p-4 bg-gradient-to-br from-accent-50 to-accent-100 rounded-xl border border-accent-200 shadow-soft hover:shadow-glow-pink transition-all duration-200">
          <p className="text-[10px] sm:text-xs text-accent-700 mb-0.5 sm:mb-1 font-semibold">Time Left</p>
          <p className="text-xs sm:text-sm font-bold text-accent-600">{timeRemaining}</p>
        </div>
      </div>

      {hasEntered && (
        <div className="p-3 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 rounded-xl flex items-center gap-2 shadow-soft">
          <div className="w-5 h-5 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow-orange">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-primary-800 font-semibold">
            You&apos;re in! Good luck! 🎯
          </p>
        </div>
      )}
    </div>
  );
}

