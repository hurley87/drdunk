"use client";

import { useApiQuery } from "@/hooks/use-api-query";

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
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            Failed to load past winners. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const rounds = data?.data?.rounds || [];

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Past Winners</h2>

      {rounds.length === 0 ? (
        <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl text-center">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🏆</span>
          </div>
          <p className="text-sm text-gray-600">No completed rounds yet.</p>
          <p className="text-xs text-gray-500 mt-1">Come back tomorrow to see winners!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rounds.map((round, index) => (
            <div
              key={round.id}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:border-yellow-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                {/* Winner Badge */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-md">
                  <span className="text-lg">🏆</span>
                </div>

                {/* Winner Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-900">
                      Round #{round.id}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(round.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-gray-600">
                      Winner: <span className="font-semibold text-gray-900">FID {round.winner_fid}</span>
                    </span>
                    <span className="text-yellow-600 font-bold">
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
                    className="flex-shrink-0 px-3 py-2 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
                  >
                    View
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

