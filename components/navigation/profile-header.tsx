"use client";

import { useUser } from "@/contexts/user-context";
import { User } from "lucide-react";
import Image from "next/image";

export default function ProfileHeader() {
  const { user } = useUser();

  if (!user || !user.data) {
    return (
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="w-5 h-5 text-gray-500" />
        </div>
      </div>
    );
  }

  const userData = user.data;

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {userData.pfp_url ? (
        <Image
          src={userData.pfp_url}
          alt={userData.display_name || userData.username}
          width={40}
          height={40}
          className="rounded-full border-2 border-orange-500"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {userData.display_name || userData.username}
        </p>
        <p className="text-xs text-gray-500">@{userData.username}</p>
      </div>
    </div>
  );
}

