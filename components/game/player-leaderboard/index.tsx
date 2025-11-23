"use client";

import { useApiQuery } from "@/hooks/use-api-query";

interface Round {
  id: number;
  date: string;
  pot_amount: number;
  winner_fid: number | null;
}

interface RoundsData {
  success: boolean;
  data: {
    rounds: Round[];
  };
}

type PlayerStat = {
  fid: number;
  wins: number;
  totalPot: number;
  lastWinDate: string | null;
};

export default function PlayerLeaderboard() {
  const { data, isLoading, error } = useApiQuery<RoundsData>({
    queryKey: ["player-leaderboard"],
    url: "/api/game/rounds",
    isProtected: false,
  });

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-purple-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">
            Failed to load player leaderboard. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const rounds = data?.data?.rounds ?? [];

  const playerStats = rounds.reduce<Record<number, PlayerStat>>((acc, round) => {
    if (!round.winner_fid) {
      return acc;
    }

    const current = acc[round.winner_fid] || {
      fid: round.winner_fid,
      wins: 0,
      totalPot: 0,
      lastWinDate: null,
    };

    const potAmount = Number(round.pot_amount || 0);

    acc[round.winner_fid] = {
      fid: current.fid,
      wins: current.wins + 1,
      totalPot: current.totalPot + potAmount,
      lastWinDate:
        !current.lastWinDate ||
        new Date(round.date) > new Date(current.lastWinDate)
          ? round.date
          : current.lastWinDate,
    };

    return acc;
  }, {});

  const leaderboard = Object.values(playerStats)
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.totalPot !== a.totalPot) return b.totalPot - a.totalPot;
      return (
        new Date(b.lastWinDate || 0).getTime() -
        new Date(a.lastWinDate || 0).getTime()
      );
    })
    .slice(0, 8);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Player Leaderboard</h2>
          <p className="text-sm text-gray-600">
            Legends ranked by total wins and pot earnings
          </p>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
          <p className="text-gray-600">No winners yet. Be the first legend!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaderboard.map((player, index) => (
            <div
              key={player.fid}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-lg font-bold text-purple-700">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      Player FID {player.fid}
                    </p>
                    <p className="text-sm text-gray-500">
                      Last win:{" "}
                      {player.lastWinDate
                        ? new Date(player.lastWinDate).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-600">
                    {player.wins} {player.wins === 1 ? "win" : "wins"}
                  </p>
                  <p className="text-lg font-bold text-purple-600">
                    {player.totalPot.toFixed(1)} USDC
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


