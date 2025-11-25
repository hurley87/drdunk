"use client";

import { useUser } from "@/contexts/user-context";
import { User } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileHeader() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2.5 px-4 py-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    );
  }

  if (!user || !user.data) {
    return (
      <div className="flex items-center gap-2.5 px-4 py-3">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <User className="w-4 h-4 text-gray-400" />
        </div>
        <span className="text-sm text-gray-500">Not signed in</span>
      </div>
    );
  }

  const userData = user.data;

  return (
    <div className="flex items-center gap-2.5 px-4 py-3">
      {userData.pfp_url ? (
        <Image
          src={userData.pfp_url}
          alt={userData.display_name || userData.username}
          width={32}
          height={32}
          className="rounded-full border border-gray-200"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
          <User className="w-4 h-4 text-primary-600" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {userData.display_name || userData.username}
        </p>
        <p className="text-xs text-gray-500 truncate">@{userData.username}</p>
      </div>
    </div>
  );
}
