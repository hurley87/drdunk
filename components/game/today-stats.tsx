"use client";

import { useApiQuery } from "@/hooks/use-api-query";
import { formatTimeRemaining, getTimeRemaining } from "@/lib/game-utils";
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
        {[...Array(3)].map((_, i) => {
          const rotation = i === 0 ? "-rotate-2" : i === 1 ? "rotate-1" : "-rotate-1";
          return (
            <div
              key={i}
              className={`text-center p-4 bg-white border-3 border-black shadow-brutal-sm ${rotation}`}
            >
              <div className="h-3 w-16 mx-auto mb-2 bg-black/20 animate-pulse" />
              <div className="h-8 w-14 mx-auto bg-black/20 animate-pulse" />
              <div className="h-3 w-12 mx-auto mt-1 bg-black/20 animate-pulse" />
            </div>
          );
        })}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-4 bg-white border-3 border-black shadow-brutal-sm -rotate-2">
          <p className="font-mono text-[10px] text-black/60 mb-1 uppercase tracking-widest">POT SIZE</p>
          <p className="font-brutal text-3xl text-black leading-none">—</p>
          <p className="font-mono text-[10px] text-black/60 uppercase tracking-wider">USDC</p>
        </div>
        <div className="text-center p-4 bg-black border-3 border-black shadow-brutal-red rotate-1">
          <p className="font-mono text-[10px] text-white/60 mb-1 uppercase tracking-widest">ENTRIES</p>
          <p className="font-brutal text-3xl text-white leading-none">—</p>
          <p className="font-mono text-[10px] text-white/60 uppercase tracking-wider">PLAYERS</p>
        </div>
        <div className="text-center p-4 bg-red-500 border-3 border-black shadow-brutal -rotate-1">
          <p className="font-mono text-[10px] text-white/80 mb-1 uppercase tracking-widest">TIME LEFT</p>
          <p className="font-brutal text-2xl text-white leading-none">—</p>
          <p className="font-mono text-[10px] text-white/80 uppercase tracking-wider">REMAINING</p>
        </div>
      </div>
    );
  }

  const round = data?.data?.round;
  const entryCount = data?.data?.entryCount || 0;
  const potAmount = round?.pot_amount || 0;

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Pot Size */}
      <div className="text-center p-4 bg-white border-3 border-black shadow-brutal-sm transition-all duration-100 transform -rotate-2 hover:rotate-0 hover:shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px]">
        <p className="font-mono text-[10px] text-black/60 mb-1 uppercase tracking-widest">POT SIZE</p>
        <p className="font-brutal text-3xl text-black leading-none">
          {potAmount.toFixed(1)}
        </p>
        <p className="font-mono text-[10px] text-black/60 uppercase tracking-wider">USDC</p>
      </div>

      {/* Entries */}
      <div className="text-center p-4 bg-black border-3 border-black shadow-brutal-red transition-all duration-100 transform rotate-1 hover:rotate-0 hover:translate-x-[-2px] hover:translate-y-[-2px]">
        <p className="font-mono text-[10px] text-white/60 mb-1 uppercase tracking-widest">ENTRIES</p>
        <p className="font-brutal text-3xl text-white leading-none">{entryCount}</p>
        <p className="font-mono text-[10px] text-white/60 uppercase tracking-wider">PLAYERS</p>
      </div>

      {/* Time Left */}
      <div className="text-center p-4 bg-red-500 border-3 border-black shadow-brutal transition-all duration-100 transform -rotate-1 hover:rotate-0 hover:translate-x-[-2px] hover:translate-y-[-2px]">
        <p className="font-mono text-[10px] text-white/80 mb-1 uppercase tracking-widest">TIME LEFT</p>
        <p className="font-mono text-xl text-white leading-none font-bold tabular-nums">{timeRemaining}</p>
        <p className="font-mono text-[10px] text-white/80 uppercase tracking-wider">REMAINING</p>
      </div>
    </div>
  );
}
