"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useMiniApp } from "@/contexts/miniapp-context";
import { useUser } from "@/contexts/user-context";
import { env } from "@/lib/env";
import RoundStatus from "@/components/game/round-status";
import Leaderboard from "@/components/game/leaderboard";
import PastWinners from "@/components/game/past-winners";
import DunkForm from "@/components/dunk-form";
import PlayerLeaderboard from "@/components/game/player-leaderboard";

type NavKey = "daily" | "create" | "players";

type NavItem = {
  key: NavKey;
  label: string;
  blurb: string;
  icon: (props: { isActive: boolean }) => JSX.Element;
};

const TrophyIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    className={`h-5 w-5 ${isActive ? "text-amber-300" : "text-white/70"}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 4h8" />
    <path d="M10 4v2a2 2 0 0 0 2 2v0a2 2 0 0 0 2-2V4" />
    <path d="M5 8V6a2 2 0 0 1 2-2h0" />
    <path d="M19 8V6a2 2 0 0 0-2-2h0" />
    <path d="M4 8h3" />
    <path d="M20 8h-3" />
    <path d="M7 17a5 5 0 0 0 10 0" />
    <path d="M8 21h8" />
  </svg>
);

const SparkIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    className={`h-5 w-5 ${isActive ? "text-pink-300" : "text-white/70"}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2v4" />
    <path d="M12 18v4" />
    <path d="M4.93 4.93l2.83 2.83" />
    <path d="M16.24 16.24l2.83 2.83" />
    <path d="M2 12h4" />
    <path d="M18 12h4" />
    <path d="M4.93 19.07l2.83-2.83" />
    <path d="M16.24 7.76l2.83-2.83" />
  </svg>
);

const MedalIcon = ({ isActive }: { isActive: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    className={`h-5 w-5 ${isActive ? "text-cyan-300" : "text-white/70"}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="13" r="4" />
    <path d="M5 3h4l3 4 3-4h4l-3 6" />
  </svg>
);

const NAV_ITEMS: NavItem[] = [
  {
    key: "daily",
    label: "Daily Dunk",
    blurb: "Live pot + top casts",
    icon: TrophyIcon,
  },
  {
    key: "create",
    label: "Create Dunk",
    blurb: "Submit your entry",
    icon: SparkIcon,
  },
  {
    key: "players",
    label: "Players",
    blurb: "Legends board",
    icon: MedalIcon,
  },
];

function MentionedFidsCard({ fids }: { fids: number[] }) {
  return (
    <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-4 text-sm text-white shadow-lg">
      <p className="text-xs uppercase tracking-widest text-white/80">
        Cast Mentions
      </p>
      <p className="mt-1 text-base font-semibold">Gift recipients spotted</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {fids.map((fid) => (
          <span
            key={fid}
            className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white"
          >
            FID {fid}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { context } = useMiniApp();
  const { user, isLoading, signIn } = useUser();
  const [mentionedFids, setMentionedFids] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<NavKey>("daily");

  useEffect(() => {
    if (!context?.location) {
      setMentionedFids([]);
      return;
    }

    const embedUrl = (context.location as any)?.embed;

    if (!embedUrl || typeof embedUrl !== "string") {
      setMentionedFids([]);
      return;
    }

    try {
      const url = new URL(embedUrl);
      const fidsParam = url.searchParams.get("fids");

      if (!fidsParam) {
        setMentionedFids([]);
        return;
      }

      const botFid = env.NEXT_PUBLIC_BOT_FID;
      const fids = fidsParam
        .split(",")
        .map((fid) => parseInt(fid.trim(), 10))
        .filter((fid) => !isNaN(fid) && fid !== botFid);

      setMentionedFids(fids);
    } catch {
      setMentionedFids([]);
    }
  }, [context?.location]);

  const isAuthenticated = Boolean(user?.data);
  const displayName = user?.data?.display_name || "Guest Dunker";
  const username = user?.data?.username
    ? `@${user.data.username}`
    : "Sign in to compete";

  const avatarFallback =
    displayName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2) || "DD";

  const renderActiveSection = () => {
    if (activeTab === "daily") {
      return (
        <div className="space-y-6">
          <RoundStatus />
          {mentionedFids.length > 0 && <MentionedFidsCard fids={mentionedFids} />}
          <Leaderboard />
        </div>
      );
    }

    if (activeTab === "create") {
      return (
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-pink-500/20 to-purple-600/20 p-5 text-white shadow-lg">
            <p className="text-xs uppercase tracking-[0.25em] text-white/70">
              Create Dunk
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Fire off your spiciest take
            </h2>
            <p className="mt-2 text-sm text-white/80">
              Drop a cast link plus your dunk. The best engagement before
              midnight UTC scoops the pot.
            </p>
          </div>
          <DunkForm />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <PlayerLeaderboard />
        <PastWinners />
      </div>
    );
  };

  const handlePrimaryAction = () => {
    if (!isAuthenticated) {
      signIn();
    } else {
      setActiveTab("create");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#05020d] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 right-0 h-64 w-64 rounded-full bg-purple-500/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-blue-500/20 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col">
        <header className="px-4 pt-6 pb-4">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) {
                  signIn();
                }
              }}
              className="flex flex-1 items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-3 py-2 text-left shadow-lg backdrop-blur-md"
            >
              <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-white/20 bg-white/10">
                {user?.data?.pfp_url ? (
                  <Image
                    src={user.data.pfp_url}
                    alt="Profile"
                    fill
                    sizes="48px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-white/80">
                    {avatarFallback}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-widest text-white/60">
                  Player
                </span>
                <span className="text-base font-semibold text-white">
                  {displayName}
                </span>
                <span className="text-xs text-white/70">{username}</span>
              </div>
            </button>

            <button
              type="button"
              onClick={handlePrimaryAction}
              disabled={isLoading}
              className="rounded-full border border-white/10 bg-white/80 px-5 py-3 text-sm font-semibold text-[#05020d] shadow-lg transition hover:bg-white disabled:opacity-60"
            >
              {isAuthenticated ? "Create Dunk" : isLoading ? "Loading..." : "Sign In"}
            </button>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-[#342167] via-[#251042] to-[#12061f] p-5 shadow-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              Doctor Dunk
            </p>
            <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold leading-tight">
                  Daily Dunk Arena
                </h1>
                <p className="mt-1 text-sm text-white/80">
                  Pay 1 USDC · 90% to the pot · Winner takes all.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-wide text-white/70">
                  Mini-App Mode
                </p>
                <p className="text-lg font-semibold text-white">Tap tabs below</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 space-y-6 px-4 pb-32">
          {renderActiveSection()}
        </main>
      </div>

      <nav className="fixed bottom-4 left-1/2 z-20 w-[calc(100%-2rem)] max-w-[640px] -translate-x-1/2 rounded-3xl border border-white/10 bg-black/70 px-2 py-3 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-1 text-[11px] font-medium transition ${
                  isActive ? "bg-white/10 text-white" : "text-white/60"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white/5">
                  <Icon isActive={isActive} />
                </span>
                <span>{item.label}</span>
                <span className="text-xs font-normal text-white/50">
                  {item.blurb}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

