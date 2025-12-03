"use client";

import { useApiQuery } from "@/hooks/use-api-query";
import { useUser } from "@/contexts/user-context";
import { formatTimeRemaining, getTimeRemaining, getCurrentRoundId } from "@/lib/game-utils";
import { useEffect, useState } from "react";
import { RoundStatusSkeleton } from "@/components/ui/skeletons";

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
      <div className="bg-red-500 border-3 border-black shadow-brutal p-4">
        <p className="font-mono text-sm text-white uppercase">
          ERROR: FAILED TO LOAD ROUND STATUS
        </p>
      </div>
    );
  }

  const round = data?.data?.round;
  const entryCount = data?.data?.entryCount || 0;
  const potAmount = round?.pot_amount || 0;
  const hasEntered = !!userEntry?.data;

  return (
    <div className="bg-white border-3 border-black shadow-brutal">
      {/* Header */}
      <div className="border-b-3 border-black p-4 bg-black text-white">
        <h3 className="font-brutal text-2xl uppercase">Round Status</h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 divide-x-3 divide-black">
        {/* Pot Size */}
        <div className="p-4 text-center bg-stripes-red">
          <p className="font-mono text-[10px] uppercase tracking-widest text-black/60">Pot</p>
          <p className="font-brutal text-3xl md:text-4xl mt-1">
            {potAmount.toFixed(1)}
          </p>
          <p className="font-mono text-xs text-black/60 uppercase">USDC</p>
        </div>

        {/* Entries */}
        <div className="p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-black/60">Entries</p>
          <p className="font-brutal text-3xl md:text-4xl mt-1">{entryCount}</p>
          <p className="font-mono text-xs text-black/60 uppercase">DUNKS</p>
        </div>

        {/* Time Left */}
        <div className="p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-black/60">Ends In</p>
          <p className="font-mono text-lg md:text-xl font-bold mt-1 text-red-500">
            {timeRemaining}
          </p>
        </div>
      </div>

      {/* Entry Status */}
      {hasEntered && (
        <div className="border-t-3 border-black p-4 bg-black text-white flex items-center gap-3">
          <div className="w-6 h-6 bg-red-500 border-2 border-white flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-mono text-sm uppercase tracking-wider">
            YOU&apos;RE IN — GOOD LUCK!
          </p>
        </div>
      )}
    </div>
  );
}
