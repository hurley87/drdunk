"use client";

import { useCallback, useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
  colors?: string[];
  startVelocity?: number;
  gravity?: number;
  scalar?: number;
  ticks?: number;
}

/**
 * Hook for triggering confetti celebrations
 */
export function useConfetti() {
  const fire = useCallback((options: ConfettiOptions = {}) => {
    const defaults: ConfettiOptions = {
      particleCount: 100,
      spread: 70,
      origin: { x: 0.5, y: 0.6 },
      colors: ["#f97316", "#fb923c", "#fdba74", "#22c55e", "#3b82f6", "#fbbf24"],
      startVelocity: 30,
      gravity: 1,
      scalar: 1,
      ticks: 200,
    };

    confetti({
      ...defaults,
      ...options,
    });
  }, []);

  const fireWin = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const colors = ["#f97316", "#fb923c", "#fbbf24", "#22c55e"];

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      // Fire from left
      confetti({
        particleCount: particleCount / 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors,
      });

      // Fire from right
      confetti({
        particleCount: particleCount / 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors,
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const fireStars = useCallback(() => {
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      colors: ["#ffd700", "#f97316", "#fb923c"],
    };

    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ["star"],
      });

      confetti({
        ...defaults,
        particleCount: 10,
        scalar: 0.75,
        shapes: ["circle"],
      });
    };

    shoot();
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
  }, []);

  const fireCannon = useCallback((x: number = 0.5, y: number = 0.5) => {
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { x, y },
      colors: ["#f97316", "#fb923c", "#fdba74"],
      startVelocity: 45,
    });
  }, []);

  return {
    fire,
    fireWin,
    fireStars,
    fireCannon,
  };
}

/**
 * Particle burst effect component
 */
export function ParticleBurst({
  trigger,
  color = "#f97316",
  count = 20,
  duration = 1000,
  className = "",
}: {
  trigger: boolean;
  color?: string;
  count?: number;
  duration?: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trigger || !containerRef.current) return;

    const particles: HTMLDivElement[] = [];
    const container = containerRef.current;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.cssText = `
        position: absolute;
        width: 8px;
        height: 8px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      `;

      const angle = (Math.PI * 2 * i) / count;
      const velocity = 50 + Math.random() * 50;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;

      container.appendChild(particle);
      particles.push(particle);

      // Animate
      const startTime = performance.now();
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = elapsed / duration;

        if (progress >= 1) {
          particle.remove();
          return;
        }

        const x = vx * progress;
        const y = vy * progress + 50 * progress * progress; // Add gravity
        const scale = 1 - progress;
        const opacity = 1 - progress;

        particle.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`;
        particle.style.opacity = String(opacity);

        requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    }

    return () => {
      particles.forEach((p) => p.remove());
    };
  }, [trigger, color, count, duration]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-visible pointer-events-none ${className}`}
    />
  );
}
