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
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Past Winners</h2>

      {rounds.length === 0 ? (
        <div className="p-8 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-gray-600">No completed rounds yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rounds.map((round) => (
            <div
              key={round.id}
              className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold text-purple-600">
                      Round #{round.id}
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Date(round.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-700">
                      <span className="font-semibold">Winner:</span> FID {round.winner_fid}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Prize:</span>{" "}
                      <span className="text-purple-600 font-bold">
                        {round.pot_amount.toFixed(1)} USDC
                      </span>
                    </p>
                  </div>
                </div>
                {round.winner_cast_hash && (
                  <a
                    href={`https://warpcast.com/${round.winner_fid}/${round.winner_cast_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    View Winning Cast
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

