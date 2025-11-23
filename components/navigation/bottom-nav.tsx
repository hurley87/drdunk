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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive
                    ? "text-orange-600"
                    : "text-gray-600 hover:text-orange-500"
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

