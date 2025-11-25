"use client";

import { useApiQuery } from "@/hooks/use-api-query";
import { useUser } from "@/contexts/user-context";
import { formatTimeRemaining, getTimeRemaining, getCurrentRoundId } from "@/lib/game-utils";
import { useEffect, useState } from "react";
import { RoundStatusSkeleton } from "@/components/ui/skeletons";
import { Check } from "lucide-react";

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
    refetchInterval: 60000,
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
    return <RoundStatusSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4">
        <p className="text-sm text-red-800">
          Failed to load round status. Please try again.
        </p>
      </div>
    );
  }

  const round = data?.data?.round;
  const entryCount = data?.data?.entryCount || 0;
  const potAmount = round?.pot_amount || 0;
  const hasEntered = !!userEntry?.data;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Round Status</h3>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Pot Size</p>
          <p className="text-lg font-semibold text-gray-900">
            {potAmount.toFixed(1)}
          </p>
          <p className="text-xs text-gray-500">USDC</p>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Entries</p>
          <p className="text-lg font-semibold text-gray-900">{entryCount}</p>
          <p className="text-xs text-gray-500">Players</p>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Time Left</p>
          <p className="text-sm font-semibold text-primary-600">{timeRemaining}</p>
        </div>
      </div>

      {hasEntered && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <Check className="w-3 h-3 text-white" />
          </div>
          <p className="text-sm text-green-800 font-medium">
            You&apos;re in! Good luck!
          </p>
        </div>
      )}
    </div>
  );
}
