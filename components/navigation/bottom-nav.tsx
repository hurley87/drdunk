"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Plus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSound } from "@/hooks/use-sound";

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
  const { play } = useSound();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom shadow-lg">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => play("click")}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-all duration-200 active:scale-95",
                isActive
                  ? "text-primary-600"
                  : "text-gray-500 hover:text-gray-700 active:text-primary-500"
              )}
            >
              <div className={cn(
                "relative transition-transform duration-300",
                isActive && "scale-110 -translate-y-0.5"
              )}>
                <Icon
                  className={cn(
                    "w-5 h-5 mb-1",
                    isActive && "text-primary-600 drop-shadow-sm"
                  )}
                />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-primary-500 rounded-full animate-pop" />
                )}
              </div>
              <span className={cn(
                "text-xs transition-all",
                isActive ? "font-medium text-primary-600" : "font-normal"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
