"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ConfettiProps {
  isActive: boolean;
  className?: string;
}

export function Confetti({ isActive, className }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; color: string; rotation: number; size: number }>>([]);

  useEffect(() => {
    if (isActive) {
      // Brutalist colors - black, white, red only
      const colors = ["#000000", "#FFFFFF", "#FF0000", "#000000", "#FF0000"];
      const newParticles = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100, // percent
        delay: Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.floor(Math.random() * 45) - 22, // -22 to 22 degrees
        size: Math.floor(Math.random() * 8) + 6, // 6-14px squares
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className={cn("fixed inset-0 pointer-events-none z-50 overflow-hidden", className)}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 animate-confetti-fall border-2 border-black"
          style={{
            left: `${p.x}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            opacity: 0,
            width: `${p.size}px`,
            height: `${p.size}px`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}
