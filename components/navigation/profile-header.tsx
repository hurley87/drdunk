"use client";

import { useUser } from "@/contexts/user-context";
import { User, Flame } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function ProfileHeader() {
  const { user, isLoading } = useUser();

  return (
    <div className="flex items-center justify-between px-4 py-3">
      {/* Left: Doctor Dunk Logo */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2"
      >
        <motion.div
          animate={{ 
            rotate: [0, -5, 5, -5, 0],
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 3,
            repeatDelay: 5,
          }}
          className="relative"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-amber-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-lg"
            >
              🏀
            </motion.span>
          </div>
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary-500 to-amber-500 blur-md opacity-40 -z-10" />
        </motion.div>
        <div>
          <h1 className="text-lg font-bold text-gradient-orange">Doctor Dunk</h1>
        </div>
      </motion.div>

      {/* Right: Profile */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        {isLoading ? (
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="hidden sm:block">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ) : !user || !user.data ? (
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-500" />
            </div>
            <span className="text-sm text-gray-600 font-medium">Sign in</span>
          </motion.div>
        ) : (
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2.5"
          >
            <div className="relative">
              {user.data.pfp_url ? (
                <Image
                  src={user.data.pfp_url}
                  alt={user.data.display_name || user.data.username}
                  width={32}
                  height={32}
                  className="rounded-full border-2 border-primary-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-amber-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
              )}
              {/* Online indicator */}
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
              />
            </div>
            <div className="min-w-0 hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 truncate flex items-center gap-1">
                {user.data.display_name || user.data.username}
                <Flame className="w-3 h-3 text-primary-500" />
              </p>
              <p className="text-xs text-gray-500 truncate">@{user.data.username}</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
