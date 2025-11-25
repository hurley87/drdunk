"use client";

import { useApiQuery } from "@/hooks/use-api-query";
import { PastWinnersSkeleton } from "@/components/ui/skeletons";
import { Trophy, ExternalLink } from "lucide-react";

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
    return <PastWinnersSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4">
        <p className="text-sm text-red-800">
          Failed to load past winners. Please try again.
        </p>
      </div>
    );
  }

  const rounds = data?.data?.rounds || [];

  if (rounds.length === 0) {
    return (
      <div className="py-8 text-center border-2 border-dashed border-gray-200 rounded-lg">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
          <Trophy className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-900 mb-1">No completed rounds yet</p>
        <p className="text-xs text-gray-500">Come back tomorrow to see winners!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rounds.map((round) => (
        <div
          key={round.id}
          className="p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
        >
          <div className="flex items-center gap-3">
            {/* Winner Badge */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>

            {/* Winner Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium text-gray-900">
                  Round #{round.id}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(round.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-gray-500">
                  FID <span className="font-medium text-gray-700">{round.winner_fid}</span>
                </span>
                <span className="font-semibold text-primary-600">
                  {round.pot_amount.toFixed(1)} USDC
                </span>
              </div>
            </div>

            {/* View Button */}
            {round.winner_cast_hash && (
              <a
                href={`https://warpcast.com/${round.winner_fid}/${round.winner_cast_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 p-2 text-gray-400 hover:text-primary-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
