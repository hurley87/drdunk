"use client";

import { useUser } from "@/contexts/user-context";
import { User } from "lucide-react";
import Image from "next/image";

export default function ProfileHeader() {
  const { user } = useUser();

  if (!user || !user.data) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 safe-area-inset-top">
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="w-4 h-4 text-gray-500" />
        </div>
      </div>
    );
  }

  const userData = user.data;

  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 safe-area-inset-top">
      {userData.pfp_url ? (
        <Image
          src={userData.pfp_url}
          alt={userData.display_name || userData.username}
          width={36}
          height={36}
          className="rounded-full border-2 border-primary-500 shadow-soft"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center shadow-soft">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
          {userData.display_name || userData.username}
        </p>
        <p className="text-[11px] text-gray-500 truncate leading-tight">@{userData.username}</p>
      </div>
    </div>
  );
}

