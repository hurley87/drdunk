"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Plus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSound } from "@/hooks/use-sound";

const navItems = [
  {
    href: "/",
    label: "DAILY",
    icon: Trophy,
    rotation: "-rotate-2",
  },
  {
    href: "/create",
    label: "CREATE",
    icon: Plus,
    rotation: "rotate-1",
  },
  {
    href: "/players",
    label: "PLAYERS",
    icon: Users,
    rotation: "-rotate-1",
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { play } = useSound();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-3 border-black z-50">
      <div className="flex items-stretch h-20">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => play("click")}
              className={cn(
                "flex flex-col items-center justify-center flex-1 min-h-[48px] transition-all duration-75 border-r-3 border-black last:border-r-0",
                isActive
                  ? "bg-brutal-red text-white"
                  : "bg-white text-black hover:bg-black hover:text-white active:bg-brutal-red active:text-white"
              )}
            >
              <div className={cn(
                "relative transition-transform duration-75",
                isActive ? "scale-110" : item.rotation,
                !isActive && "group-hover:rotate-0"
              )}>
                <Icon className="w-6 h-6 mb-1" />
              </div>
              <span className={cn(
                "font-bebas text-sm tracking-wider",
                isActive && "underline underline-offset-4 decoration-2"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-white border border-black transform rotate-45" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
