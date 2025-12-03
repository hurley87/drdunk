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
};

const NAV_ITEMS: NavItem[] = [
  {
    key: "daily",
    label: "DAILY",
    blurb: "Live pot",
  },
  {
    key: "create",
    label: "CREATE",
    blurb: "Submit",
  },
  {
    key: "players",
    label: "LEGENDS",
    blurb: "Winners",
  },
];

function MentionedFidsCard({ fids }: { fids: number[] }) {
  return (
    <div className="bg-white border-3 border-black shadow-brutal p-4 rotate-1">
      <p className="font-mono text-xs uppercase tracking-widest text-black/60">
        Cast Mentions
      </p>
      <p className="mt-1 font-brutal text-xl uppercase">Gift Recipients</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {fids.map((fid) => (
          <span
            key={fid}
            className="badge-brutal"
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
  const displayName = user?.data?.display_name || "GUEST";
  const username = user?.data?.username
    ? `@${user.data.username}`
    : "Sign in to compete";

  const avatarFallback =
    displayName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2) || "??";

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
          {/* Create Section Header */}
          <div className="bg-red-500 border-3 border-black shadow-brutal p-5 text-white -rotate-1">
            <p className="font-mono text-xs uppercase tracking-widest opacity-80">
              CREATE DUNK
            </p>
            <h2 className="mt-2 font-brutal text-3xl md:text-4xl uppercase">
              FIRE YOUR<br/>SPICIEST TAKE
            </h2>
            <p className="mt-2 font-mono text-sm opacity-90">
              Drop a cast link + your dunk. Best engagement wins the pot.
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
    <div className="relative min-h-screen bg-white text-black bg-stripes">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute top-8 right-4 w-24 h-24 bg-red-500 border-3 border-black rotate-12 opacity-20" />
      <div className="pointer-events-none absolute top-32 left-0 w-16 h-16 bg-black -rotate-6 opacity-10" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col">
        {/* Header */}
        <header className="px-4 pt-6 pb-4">
          <div className="flex items-center justify-between gap-4">
            {/* Profile Card */}
            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) {
                  signIn();
                }
              }}
              className="flex flex-1 items-center gap-3 bg-white border-3 border-black shadow-brutal-sm p-3 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal transition-all duration-100"
            >
              <div className="relative h-12 w-12 overflow-hidden border-3 border-black bg-brutal-gray-light">
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
                  <div className="flex h-full w-full items-center justify-center font-brutal text-xl text-black">
                    {avatarFallback}
                  </div>
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="font-mono text-[10px] uppercase tracking-widest text-black/50">
                  PLAYER
                </span>
                <span className="font-brutal text-lg uppercase leading-tight">
                  {displayName}
                </span>
                <span className="font-mono text-xs text-black/60">{username}</span>
              </div>
            </button>

            {/* CTA Button */}
            <button
              type="button"
              onClick={handlePrimaryAction}
              disabled={isLoading}
              className="bg-red-500 text-white border-3 border-black shadow-brutal px-5 py-3 font-mono font-bold text-sm uppercase tracking-wider hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-100 disabled:opacity-60"
            >
              {isAuthenticated ? "CREATE" : isLoading ? "..." : "SIGN IN"}
            </button>
          </div>

          {/* Hero Card */}
          <div className="mt-6 bg-black text-white border-3 border-black shadow-brutal-lg p-5 relative overflow-hidden">
            {/* Decorative stripe */}
            <div className="absolute top-0 right-0 w-32 h-full bg-red-500 -skew-x-12 translate-x-12" />
            
            <div className="relative z-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">
                DOCTOR DUNK
              </p>
              <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="font-brutal text-4xl md:text-5xl uppercase leading-none">
                    DAILY DUNK<br/>
                    <span className="text-red-500">ARENA</span>
                  </h1>
                  <p className="mt-2 font-mono text-sm text-white/70">
                    1 USDC · 90% to pot · Winner takes all
                  </p>
                </div>
                <div className="bg-white text-black border-3 border-white px-4 py-3 -rotate-2">
                  <p className="font-mono text-[10px] uppercase tracking-wide text-black/60">
                    Mode
                  </p>
                  <p className="font-brutal text-xl uppercase">MINI-APP</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 space-y-6 px-4 pb-32">
          {renderActiveSection()}
        </main>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-black border-t-3 border-black safe-area-inset-bottom">
        <div className="flex items-stretch">
          {NAV_ITEMS.map((item, index) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-colors duration-100 ${
                  index > 0 ? "border-l-3 border-white/20" : ""
                } ${
                  isActive 
                    ? "bg-red-500 text-white" 
                    : "bg-black text-white/60 hover:text-white hover:bg-white/10"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="font-brutal text-lg uppercase leading-none">
                  {item.label}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider opacity-70 mt-1">
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
