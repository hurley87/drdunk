"use client";

import { useCallback, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Flame, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameAudio } from "@/hooks/use-game-audio";

type ConfettiPiece = {
  id: number;
  left: number;
  delay: number;
  color: string;
};

const CONFETTI_COLORS = ["#f97316", "#facc15", "#38bdf8", "#c084fc", "#f472b6"];

export default function HypeCTA() {
  const router = useRouter();
  const { isEnabled, toggleFx, playClick, prime } = useGameAudio();
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  const handleEnter = useCallback(async () => {
    await prime();
    playClick();
    triggerConfetti();
    router.push("/create");
  }, [playClick, prime, router]);

  const triggerConfetti = useCallback(() => {
    const pieces = Array.from({ length: 12 }).map((_, index) => ({
      id: Date.now() + index,
      left: Math.random() * 100,
      delay: Math.random() * 0.35,
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 1200);
  }, []);

  const perks = useMemo(
    () => [
      { label: "90% Pot", value: "Winner takes all" },
      { label: "Live Scoring", value: "Updates every 30s" },
      { label: "Bonus Hype", value: "+2x recasts, +3x replies" },
    ],
    []
  );

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/60 p-6 text-white shadow-[0_25px_80px_rgba(12,6,20,0.65)] backdrop-blur-xl">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.35),_transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-orange-500/40 blur-3xl"
      />

      <div className="relative z-10 space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/80">
          <Flame className="h-3 w-3 text-orange-300" />
          Arena Entry
        </div>

        <div>
          <h3 className="text-2xl font-semibold tracking-tight">
            Drop your dunk before the buzzer
          </h3>
          <p className="mt-2 text-sm text-white/80">
            Pay 1&nbsp;USDC to enter today&apos;s round and watch the live scoreboard react to your cast.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {perks.map((perk) => (
            <div
              key={perk.label}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm shadow-inner shadow-black/20"
            >
              <p className="text-xs text-white/70">{perk.label}</p>
              <p className="text-sm font-semibold text-white">{perk.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            className="group relative flex-1 overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-violet-500 text-base font-semibold shadow-[0_15px_45px_rgba(249,115,22,0.45)] transition hover:scale-[1.01] focus-visible:ring-offset-0"
            onClick={handleEnter}
          >
            Launch Entry
            <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.25),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </Button>

          <button
            type="button"
            aria-pressed={isEnabled}
            onClick={toggleFx}
            className="rounded-2xl border border-white/15 bg-white/5 p-3 text-white transition hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            {isEnabled ? (
              <Volume2 className="h-5 w-5" aria-hidden="true" />
            ) : (
              <VolumeX className="h-5 w-5" aria-hidden="true" />
            )}
            <span className="sr-only">
              Toggle game sounds {isEnabled ? "off" : "on"}
            </span>
          </button>
        </div>
      </div>

      <div aria-hidden="true" className="pointer-events-none">
        {confetti.map((piece) => (
          <span
            key={piece.id}
            className="absolute top-1/3 h-2 w-2 rounded-sm animate-confetti"
            style={
              {
                left: `${piece.left}%`,
                animationDelay: `${piece.delay}s`,
                backgroundColor: piece.color,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}

