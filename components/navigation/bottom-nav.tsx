"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Plus, Users, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useGameSounds } from "@/hooks/use-game-sounds";

const navItems = [
  {
    href: "/",
    label: "Daily Dunk",
    icon: Trophy,
    activeColor: "text-amber-500",
    activeBg: "bg-amber-50",
  },
  {
    href: "/create",
    label: "Create",
    icon: Plus,
    activeColor: "text-primary-500",
    activeBg: "bg-primary-50",
    isMain: true,
  },
  {
    href: "/players",
    label: "Players",
    icon: Users,
    activeColor: "text-blue-500",
    activeBg: "bg-blue-50",
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { playClick } = useGameSounds();

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 z-50 safe-area-inset-bottom"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => playClick()}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-all duration-200",
                isActive
                  ? item.activeColor
                  : "text-gray-400 hover:text-gray-600 active:scale-95"
              )}
            >
              {/* Main button (Create) has special styling */}
              {item.isMain ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "relative -mt-6 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-br from-primary-500 to-amber-500 shadow-primary-500/40"
                      : "bg-gradient-to-br from-gray-100 to-gray-200 shadow-gray-500/20"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-6 h-6 transition-colors",
                      isActive ? "text-white" : "text-gray-500"
                    )}
                  />
                  {/* Glow effect when active */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500 to-amber-500 blur-lg opacity-50 -z-10"
                    />
                  )}
                </motion.div>
              ) : (
                <>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      "p-2 rounded-xl transition-colors",
                      isActive && item.activeBg
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 transition-all",
                        isActive && "drop-shadow-sm"
                      )}
                    />
                  </motion.div>
                  <span
                    className={cn(
                      "text-xs mt-0.5 transition-all",
                      isActive ? "font-semibold" : "font-normal"
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}

              {/* Active indicator */}
              {isActive && !item.isMain && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-current"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              {/* Notification badge for Create */}
              {item.isMain && !isActive && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-3 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg"
                >
                  <Flame className="w-3 h-3" />
                </motion.div>
              )}
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
