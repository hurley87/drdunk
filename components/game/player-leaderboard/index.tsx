"use client";

import { useApiQuery } from "@/hooks/use-api-query";
import { cn } from "@/lib/utils";

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
      <div className="w-full">
        <div className="bg-white border-3 border-black shadow-brutal p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-black border-t-red-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="bg-red-500 border-3 border-black shadow-brutal p-4">
          <p className="font-mono text-sm text-white uppercase">
            ERROR: FAILED TO LOAD PLAYER LEADERBOARD
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
    <div className="w-full">
      {/* Header */}
      <div className="mb-4">
        <h2 className="font-brutal text-3xl md:text-4xl uppercase">
          HALL OF<br/>
          <span className="text-red-500">LEGENDS</span>
        </h2>
        <p className="font-mono text-xs text-black/60 uppercase mt-1">
          Ranked by wins & earnings
        </p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="bg-white border-3 border-black border-dashed p-8 text-center">
          <div className="w-16 h-16 bg-red-500 mx-auto mb-4 flex items-center justify-center -rotate-3">
            <span className="font-brutal text-3xl text-white">0</span>
          </div>
          <p className="font-brutal text-xl uppercase mb-1">NO WINNERS YET</p>
          <p className="font-mono text-xs text-black/60 uppercase">Be the first legend!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((player, index) => {
            const isTop = index === 0;
            const rotation = index % 3 === 0 ? "rotate-[0.5deg]" : index % 3 === 1 ? "rotate-[-0.3deg]" : "rotate-[0.2deg]";
            
            return (
              <div
                key={player.fid}
                className={cn(
                  "border-3 border-black transition-all duration-100",
                  rotation,
                  isTop
                    ? "bg-red-500 text-white shadow-brutal-lg"
                    : "bg-white shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg"
                )}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className={cn(
                      "w-12 h-12 flex items-center justify-center font-brutal text-2xl border-3",
                      isTop
                        ? "bg-white text-red-500 border-white"
                        : "bg-black text-white border-black"
                    )}>
                      #{index + 1}
                    </div>
                    
                    {/* Player Info */}
                    <div>
                      <p className={cn(
                        "font-brutal text-xl uppercase",
                        isTop ? "text-white" : "text-black"
                      )}>
                        FID {player.fid}
                      </p>
                      <p className={cn(
                        "font-mono text-xs uppercase",
                        isTop ? "text-white/70" : "text-black/60"
                      )}>
                        Last win: {player.lastWinDate
                          ? new Date(player.lastWinDate).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <p className={cn(
                      "font-mono text-sm uppercase",
                      isTop ? "text-white/70" : "text-black/60"
                    )}>
                      {player.wins} {player.wins === 1 ? "WIN" : "WINS"}
                    </p>
                    <p className={cn(
                      "font-brutal text-2xl",
                      isTop ? "text-white" : "text-red-500"
                    )}>
                      {player.totalPot.toFixed(1)} <span className="text-sm">USDC</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
