"use client";

import { useUser } from "@/contexts/user-context";
import { User, Flame } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileHeader() {
  const { user, isLoading } = useUser();

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md">
      {/* Left: Doctor Dunk */}
      <div className="flex items-center gap-2 group cursor-default">
        <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center transition-transform group-hover:rotate-12 group-hover:scale-110 duration-300">
          <Flame className="w-5 h-5 text-primary-600" />
        </div>
        <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Doctor Dunk</h1>
      </div>

      {/* Right: Profile */}
      {isLoading ? (
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="hidden sm:block">
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ) : !user || !user.data ? (
        <div className="flex items-center gap-2.5 animate-in fade-in duration-300">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-sm text-gray-500">Not signed in</span>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 animate-in slide-in-from-right-4 fade-in duration-500">
          {user.data.pfp_url ? (
            <div className="relative">
              <Image
                src={user.data.pfp_url}
                alt={user.data.display_name || user.data.username}
                width={32}
                height={32}
                className="rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110 duration-200"
              />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full animate-pop delay-300" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shadow-sm">
              <User className="w-4 h-4 text-primary-600" />
            </div>
          )}
          <div className="min-w-0 hidden sm:block">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.data.display_name || user.data.username}
            </p>
            <p className="text-xs text-gray-500 truncate">@{user.data.username}</p>
          </div>
        </div>
      )}
    </div>
  );
}
