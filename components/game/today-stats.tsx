"use client";

import { useApiQuery } from "@/hooks/use-api-query";
import { formatTimeRemaining, getTimeRemaining } from "@/lib/game-utils";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

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

export default function TodayStats() {
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  const { data, isLoading, error } = useApiQuery<RoundData>({
    queryKey: ["today-stats"],
    url: "/api/game/rounds?current=true",
    isProtected: false,
    refetchInterval: 60000,
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
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100"
          >
            <div className="h-3 w-20 mx-auto mb-2 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-16 mx-auto bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Pot Size USDC</p>
          <p className="text-lg font-semibold text-gray-900">-</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Entries</p>
          <p className="text-lg font-semibold text-gray-900">-</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Time Left</p>
          <p className="text-sm font-semibold text-primary-600">-</p>
        </div>
      </div>
    );
  }

  const round = data?.data?.round;
  const entryCount = data?.data?.entryCount || 0;
  const potAmount = round?.pot_amount || 0;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className={cn(
        "text-center p-3 bg-gray-50 rounded-lg border border-gray-100 transition-all hover:scale-105 hover:shadow-sm hover:border-primary-200",
        "animate-in zoom-in-95 duration-300"
      )}>
        <p className="text-xs text-gray-500 mb-1">Pot Size USDC</p>
        <p className="text-lg font-semibold text-gray-900">
          {potAmount.toFixed(1)}
        </p>
      </div>

      <div className={cn(
        "text-center p-3 bg-gray-50 rounded-lg border border-gray-100 transition-all hover:scale-105 hover:shadow-sm hover:border-primary-200",
        "animate-in zoom-in-95 duration-300 delay-75"
      )}>
        <p className="text-xs text-gray-500 mb-1">Entries</p>
        <p className="text-lg font-semibold text-gray-900">{entryCount}</p>
      </div>

      <div className={cn(
        "text-center p-3 bg-gray-50 rounded-lg border border-gray-100 transition-all hover:scale-105 hover:shadow-sm hover:border-primary-200",
        "animate-in zoom-in-95 duration-300 delay-150"
      )}>
        <p className="text-xs text-gray-500 mb-1">Time Left</p>
        <p className="text-sm font-semibold text-primary-600 tabular-nums">{timeRemaining}</p>
      </div>
    </div>
  );
}
