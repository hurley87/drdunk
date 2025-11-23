"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Plus, Users } from "lucide-react";

const navItems = [
  {
    href: "/",
    label: "Daily Dunk",
    icon: Trophy,
  },
  {
    href: "/create",
    label: "Create",
    icon: Plus,
  },
  {
    href: "/players",
    label: "Players",
    icon: Users,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 safe-area-inset-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-all duration-200 active:scale-95 ${
                isActive
                  ? "text-primary-600"
                  : "text-gray-500 active:text-primary-500"
              }`}
            >
              <div className={`relative mb-1 transition-transform duration-200 ${
                isActive ? "scale-110" : ""
              }`}>
                <Icon className={`w-6 h-6 transition-all duration-200 ${
                  isActive ? "drop-shadow-sm" : ""
                }`} />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full shadow-glow-orange" />
                )}
              </div>
              <span className={`text-[10px] font-semibold transition-all duration-200 ${
                isActive ? "scale-105" : ""
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

