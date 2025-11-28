import HypeCTA from "@/components/game/hype-cta";
import TodayStats from "@/components/game/today-stats";
import LiveTicker from "@/components/game/live-ticker";

const highlights = [
  "Daily pot resets at 00:00 UTC",
  "Cast any dunk-ready take",
  "Engagement score is weighted",
];

export default function ArenaHero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0b071f] via-[#1c0f2a] to-[#130922] p-6 text-white shadow-[0_25px_120px_rgba(6,5,20,0.8)] sm:p-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.35),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.25),transparent_55%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-fuchsia-500/30 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-orange-400/30 blur-[110px]"
      />

      <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.5em] text-white/70">
            <span className="rounded-full border border-white/20 px-3 py-1">
              Season 01
            </span>
            <span className="rounded-full border border-white/20 px-3 py-1">
              Daily Dunk Arena
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Turn your hottest dunk into onchain glory.
            </h1>
            <p className="text-base text-white/80 sm:text-lg">
              Pay&nbsp;1&nbsp;USDC, drop your dunk cast, then grind engagement.
              Likes, recasts, and replies fuel your score until the midnight
              buzzer.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {highlights.map((item) => (
              <span
                key={item}
                className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 shadow-inner shadow-black/30"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-1.5 pl-6 pr-3">
            <LiveTicker />
          </div>
        </div>

        <div className="space-y-4">
          <HypeCTA />
          <div className="rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              Live round
            </p>
            <p className="text-lg font-semibold text-white">
              Track pot, entries, and time remaining
            </p>
            <div className="mt-4">
              <TodayStats />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

