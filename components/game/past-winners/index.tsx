"use client";

import { useApiQuery } from "@/hooks/use-api-query";
import { WinnerCardSkeleton } from "@/components/ui/skeletons";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

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

interface UserInfo {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
}

interface BulkUsersResponse {
  success: boolean;
  data: {
    users: Record<string, UserInfo>;
  };
}

export default function PastWinners() {
  const { data, isLoading, error } = useApiQuery<RoundsData>({
    queryKey: ["past-winners"],
    url: "/api/game/rounds",
    isProtected: false,
  });

  const rounds = data?.data?.rounds || [];
  const winnerFids = rounds.map((r) => r.winner_fid).filter(Boolean);

  // Fetch user info for all winner FIDs
  const { data: usersData } = useQuery<BulkUsersResponse>({
    queryKey: ["winner-users", winnerFids.join(",")],
    queryFn: async () => {
      if (winnerFids.length === 0) return { success: true, data: { users: {} } };
      const response = await fetch(`/api/users/bulk?fids=${winnerFids.join(",")}`);
      return response.json();
    },
    enabled: winnerFids.length > 0,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const users = usersData?.data?.users || {};

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
      <div className="bg-brutal-red border-3 border-black shadow-brutal p-4">
        <p className="font-mono text-sm text-white uppercase tracking-wide">
          ERROR: FAILED TO LOAD PAST WINNERS
        </p>
      </div>
    );
  }

  if (rounds.length === 0) {
    return (
      <div className="bg-white border-3 border-black border-dashed p-8 text-center">
        <div className="w-16 h-16 bg-black mx-auto mb-4 flex items-center justify-center transform rotate-6">
          <span className="font-bebas text-3xl text-white">?</span>
        </div>
        <p className="font-bebas text-2xl uppercase mb-1">NO COMPLETED ROUNDS</p>
        <p className="font-mono text-xs text-black/60 uppercase tracking-wide">CHECK BACK TOMORROW!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-bebas text-2xl uppercase tracking-wider">PAST WINS</h2>
        <span className="bg-black text-white px-3 py-1 font-mono text-xs uppercase tracking-wider">
          {rounds.length} ROUNDS
        </span>
      </div>

      {/* Winners List */}
      <div className="space-y-3">
        {rounds.map((round, index) => {
          const rotations = ['-rotate-1', 'rotate-1', '-rotate-0.5', 'rotate-0.5'];
          const rotation = rotations[index % rotations.length];
          const user = users[round.winner_fid];
          const username = user?.username || `fid:${round.winner_fid}`;
          const displayName = user?.display_name || username;
          const pfpUrl = user?.pfp_url;
          
          return (
            <div
              key={round.id}
              className={cn(
                "bg-white border-3 border-black shadow-brutal transition-all duration-75 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg transform",
                rotation
              )}
            >
              <div className="flex items-center gap-3 p-4">
                {/* User Avatar */}
                <div className="flex-shrink-0 w-14 h-14 bg-black border-2 border-black overflow-hidden">
                  {pfpUrl ? (
                    <Image
                      src={pfpUrl}
                      alt={displayName}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bebas text-md">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Winner Info */}
                <div className="flex-1 min-w-0">
                  {round.winner_cast_hash ? (
                    <a
                      href={`https://warpcast.com/${username}/${round.winner_cast_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs uppercase tracking-wide truncate block hover:text-brutal-red transition-colors"
                    >
                      @{username}
                    </a>
                  ) : (
                    <span className="font-mono text-xs uppercase tracking-wide truncate block">
                      @{username}
                    </span>
                  )}
                  <p className="font-mono text-xs text-black/60 uppercase tracking-wider">
                    {new Date(round.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).toUpperCase()}
                  </p>
                </div>

                {/* Prize Amount */}
                <div className="text-right">
                  <p className="font-bebas text-xl text-brutal-red">
                    {round.pot_amount.toFixed(1)}
                  </p>
                  <p className="font-mono text-[10px] text-black/60 uppercase tracking-wider">USDC WON</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
