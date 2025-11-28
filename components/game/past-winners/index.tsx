"use client";

import { useApiQuery } from "@/hooks/use-api-query";
import { WinnerCardSkeleton } from "@/components/ui/skeletons";
import { Trophy, ExternalLink, Crown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Round {
  id: number;
  date: string;
  pot_amount: number;
  winner_fid: number;
  winner_cast_hash: string;
  status: string;
}

interface RoundsData {
  success: boolean;
  data: {
    rounds: Round[];
  };
}

export default function PastWinners() {
  const { data, isLoading, error } = useApiQuery<RoundsData>({
    queryKey: ["past-winners"],
    url: "/api/game/rounds",
    isProtected: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <WinnerCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl bg-red-50 border border-red-200 p-4"
      >
        <p className="text-sm text-red-800">
          Failed to load past winners. Please try again.
        </p>
      </motion.div>
    );
  }

  const rounds = data?.data?.rounds || [];

  if (rounds.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="py-10 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white"
      >
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center mx-auto mb-4"
        >
          <Crown className="w-8 h-8 text-amber-500" />
        </motion.div>
        <p className="text-sm font-medium text-gray-900 mb-1">No completed rounds yet</p>
        <p className="text-xs text-gray-500">Come back tomorrow to see winners!</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {rounds.map((round, index) => (
          <motion.div
            key={round.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.01, y: -2 }}
            className="p-4 bg-gradient-to-r from-white to-amber-50/30 border border-gray-200 rounded-xl hover:border-amber-200 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {/* Winner Badge */}
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/30"
              >
                <Trophy className="w-6 h-6 text-white" />
              </motion.div>

              {/* Winner Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-900">
                    Round #{round.id}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {new Date(round.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-gray-500">
                    Winner: <span className="font-medium text-gray-700">FID {round.winner_fid}</span>
                  </span>
                </div>
              </div>

              {/* Prize Amount */}
              <div className="text-right">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                  className="flex items-center gap-1 text-lg font-bold text-primary-600"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  {round.pot_amount.toFixed(1)}
                </motion.div>
                <span className="text-xs text-gray-500">USDC won</span>
              </div>

              {/* View Button */}
              {round.winner_cast_hash && (
                <motion.a
                  href={`https://warpcast.com/${round.winner_fid}/${round.winner_cast_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </motion.a>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
