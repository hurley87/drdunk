"use client";

import { useApiQuery } from "@/hooks/use-api-query";
import { formatTimeRemaining, getTimeRemaining } from "@/lib/game-utils";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { CountUp } from "@/components/ui/animated-number";
import { useGameSounds } from "@/hooks/use-game-sounds";
import { Coins, Users, Timer, Flame } from "lucide-react";

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
  const [isUrgent, setIsUrgent] = useState(false);
  const prevPotRef = useRef<number>(0);
  const prevEntriesRef = useRef<number>(0);
  const { playCoin, playScoreUp } = useGameSounds();

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
        setIsUrgent(remaining < 3600000);
      };
      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [data?.data?.round?.id]);

  useEffect(() => {
    if (!data?.data) return;
    
    const currentPot = data.data.round?.pot_amount || 0;
    const currentEntries = data.data.entryCount || 0;

    if (prevPotRef.current > 0 && currentPot > prevPotRef.current) {
      playCoin();
    }
    if (prevEntriesRef.current > 0 && currentEntries > prevEntriesRef.current) {
      playScoreUp();
    }

    prevPotRef.current = currentPot;
    prevEntriesRef.current = currentEntries;
  }, [data?.data?.round?.pot_amount, data?.data?.entryCount, playCoin, playScoreUp]);

  const round = data?.data?.round;
  const entryCount = data?.data?.entryCount || 0;
  const potAmount = round?.pot_amount || 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100"
          >
            <div className="h-4 w-20 mb-2 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
          </motion.div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {["Prize Pool", "Entries", "Time Left"].map((label, i) => (
          <div key={i} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-sm font-bold text-gray-300">--</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {/* Prize Pool */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0, type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100"
      >
        <div className="flex items-center gap-1.5 text-gray-500 mb-1">
          <Coins className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Prize Pool</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold text-primary-600 tabular-nums">
            <CountUp end={potAmount} duration={1.5} decimals={1} />
          </span>
          <span className="text-xs text-primary-500">USDC</span>
        </div>
      </motion.div>

      {/* Entries */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100"
      >
        <div className="flex items-center gap-1.5 text-gray-500 mb-1">
          <Users className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Entries</span>
        </div>
        <span className="text-sm font-bold text-primary-600 tabular-nums">
          <CountUp end={entryCount} duration={1.5} decimals={0} />
        </span>
      </motion.div>

      {/* Time Left */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100"
      >
        <div className="flex items-center gap-1.5 text-gray-500 mb-1">
          {isUrgent ? (
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}>
              <Flame className="w-3.5 h-3.5 text-red-500" />
            </motion.div>
          ) : (
            <Timer className="w-3.5 h-3.5" />
          )}
          <span className="text-xs font-medium">Time Left</span>
        </div>
        <motion.span
          key={timeRemaining}
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          className={`text-sm font-bold tabular-nums ${isUrgent ? "text-red-500" : "text-primary-600"}`}
        >
          {timeRemaining || "--:--:--"}
        </motion.span>
      </motion.div>
    </div>
  );
}
