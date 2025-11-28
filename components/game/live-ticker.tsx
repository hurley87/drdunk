"use client";

import { useMemo } from "react";
import { Sparkles } from "lucide-react";

export default function LiveTicker() {
  const items = useMemo(
    () => [
      "Recasts worth 2x points",
      "Replies worth 3x points",
      "90% of pot goes to winner",
      "1 USDC entry fee",
      "Leaderboard refreshes every 30 seconds",
      "Tie breaker favors earliest entrant",
    ],
    []
  );

  return (
    <div className="relative overflow-hidden rounded-full border border-white/10 bg-white/5 py-3 pl-4 pr-8 text-xs uppercase tracking-[0.3em] text-white/70">
      <Sparkles className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-300" />
      <div
        aria-live="polite"
        className="ml-10 flex gap-10 whitespace-nowrap text-[0.7rem] font-semibold animate-ticker"
      >
        {[...items, ...items].map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-3">
            <span className="h-1 w-1 rounded-full bg-orange-300" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

