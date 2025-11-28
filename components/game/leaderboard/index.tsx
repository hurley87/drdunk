"use client";

import { useApiQuery } from "@/hooks/use-api-query";
import { formatTimeRemaining, getTimeRemaining } from "@/lib/game-utils";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LeaderboardSkeleton } from "@/components/ui/skeletons";
import { useGameSounds } from "@/hooks/use-game-sounds";
import { ExternalLink, Crown, Trophy, Medal, Flame, TrendingUp } from "lucide-react";

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

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-4 h-4" />;
    case 2:
      return <Medal className="w-4 h-4" />;
    case 3:
      return <Trophy className="w-4 h-4" />;
    default:
      return null;
  }
};

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return "rank-badge-1";
    case 2:
      return "rank-badge-2";
    case 3:
      return "rank-badge-3";
    default:
      return "rank-badge-default";
  }
};

export default function Leaderboard() {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [prevLeaderboard, setPrevLeaderboard] = useState<LeaderboardEntry[]>([]);
  const { playScoreUp, playSwoosh } = useGameSounds();
  const initialLoadRef = useRef(true);

  const { data, isLoading, error } = useApiQuery<LeaderboardData>({
    queryKey: ["leaderboard"],
    url: "/api/game/leaderboard",
    isProtected: false,
    refetchInterval: 30000,
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

  // Track rank changes and play sounds
  useEffect(() => {
    if (!data?.data?.leaderboard || initialLoadRef.current) {
      initialLoadRef.current = false;
      setPrevLeaderboard(data?.data?.leaderboard || []);
      return;
    }

    const newLeaderboard = data.data.leaderboard;
    
    // Check for rank changes
    newLeaderboard.forEach((entry) => {
      const prevEntry = prevLeaderboard.find((p) => p.castHash === entry.castHash);
      if (prevEntry && prevEntry.rank > entry.rank) {
        // Player moved up!
        playSwoosh();
      } else if (prevEntry && entry.engagementScore > prevEntry.engagementScore) {
        // Score increased
        playScoreUp();
      }
    });

    setPrevLeaderboard(newLeaderboard);
  }, [data?.data?.leaderboard, playSwoosh, playScoreUp, prevLeaderboard]);

  if (isLoading) {
    return <LeaderboardSkeleton />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-lg bg-red-50 border border-red-200 p-4"
      >
        <p className="text-sm text-red-800">
          Failed to load leaderboard. Please try again.
        </p>
      </motion.div>
    );
  }

  const leaderboard = data?.data?.leaderboard || [];

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
          >
            <Trophy className="w-5 h-5 text-primary-500" />
          </motion.div>
          <h2 className="text-lg font-semibold text-gray-900">Leaderboard</h2>
        </div>
        {timeRemaining && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-gray-500 flex items-center gap-1"
          >
            <Flame className="w-3 h-3 text-primary-400" />
            Ends in{" "}
            <span className="font-semibold text-primary-600 tabular-nums">{timeRemaining}</span>
          </motion.span>
        )}
      </motion.div>

      {leaderboard.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-amber-100 flex items-center justify-center mx-auto mb-4"
          >
            <Crown className="w-8 h-8 text-primary-500" />
          </motion.div>
          <p className="text-sm font-medium text-gray-900 mb-1">No entries yet</p>
          <p className="text-xs text-gray-500">Be the first to enter and claim the pot!</p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {leaderboard.map((entry, index) => {
              const isWinning = entry.rank === 1;
              const prevEntry = prevLeaderboard.find((p) => p.castHash === entry.castHash);
              const rankChanged = prevEntry && prevEntry.rank !== entry.rank;
              const scoreIncreased = prevEntry && entry.engagementScore > prevEntry.engagementScore;

              return (
                <motion.div
                  key={entry.castHash}
                  layout
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0, 
                    scale: 1,
                    backgroundColor: rankChanged 
                      ? "rgba(249, 115, 22, 0.1)" 
                      : isWinning 
                      ? "rgb(255 247 237)" 
                      : "rgb(255 255 255)",
                  }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 40,
                    delay: index * 0.05,
                  }}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    isWinning
                      ? "card-winner border-primary-200"
                      : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Rank Badge */}
                    <motion.div
                      animate={rankChanged ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 0.3 }}
                      className={`flex-shrink-0 ${getRankStyle(entry.rank)}`}
                    >
                      {getRankIcon(entry.rank) || `#${entry.rank}`}
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">FID {entry.fid}</span>
                        {isWinning && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="badge badge-animated"
                          >
                            <Flame className="w-3 h-3 mr-0.5" />
                            Leading
                          </motion.span>
                        )}
                      </div>
                      <p className="text-sm text-gray-800 mb-2 line-clamp-2">{entry.dunkText}</p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <motion.span
                          animate={scoreIncreased ? { scale: [1, 1.2, 1] } : {}}
                          className="flex items-center gap-1"
                        >
                          <span className="font-medium text-gray-700">{entry.likes}</span> likes
                        </motion.span>
                        <span>
                          <span className="font-medium text-gray-700">{entry.recasts}</span> recasts
                        </span>
                        <span>
                          <span className="font-medium text-gray-700">{entry.replies}</span> replies
                        </span>
                        <motion.span
                          animate={scoreIncreased ? { 
                            scale: [1, 1.3, 1],
                            color: ["#f97316", "#ea580c", "#f97316"],
                          } : {}}
                          className="ml-auto font-bold text-primary-600 flex items-center gap-1"
                        >
                          {scoreIncreased && (
                            <TrendingUp className="w-3 h-3 text-green-500" />
                          )}
                          {entry.engagementScore.toFixed(0)} pts
                        </motion.span>
                      </div>
                    </div>

                    {/* View Cast Button */}
                    {entry.castUrl && (
                      <motion.a
                        href={entry.castUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </motion.a>
                    )}
                  </div>

                  {/* Winner shimmer effect */}
                  {isWinning && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{
                          background: "linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.1), transparent)",
                          animation: "shimmer 3s ease-in-out infinite",
                        }}
                      />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
