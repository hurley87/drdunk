"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Plus, Users } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors",
                isActive
                  ? "text-primary-600"
                  : "text-gray-500 hover:text-gray-700 active:text-primary-500"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 mb-1",
                  isActive && "text-primary-600"
                )}
              />
              <span className={cn(
                "text-xs",
                isActive ? "font-medium" : "font-normal"
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
