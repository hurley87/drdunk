"use client";

import { useUser } from "@/contexts/user-context";
import { User } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileHeader() {
  const { user, isLoading } = useUser();

  return (
    <div className="flex items-center justify-between px-4 py-3">
      {/* Left: Doctor Dunk */}
      <h1 className="text-lg font-semibold text-gray-900">Doctor Dunk</h1>

      {/* Right: Profile */}
      {isLoading ? (
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ) : !user || !user.data ? (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-sm text-gray-500">Not signed in</span>
        </div>
      ) : (
        <div className="flex items-center gap-2.5">
          {user.data.pfp_url ? (
            <Image
              src={user.data.pfp_url}
              alt={user.data.display_name || user.data.username}
              width={32}
              height={32}
              className="rounded-full border border-gray-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
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
