"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatOptions?: Intl.NumberFormatOptions;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  onComplete?: () => void;
}

/**
 * Animated number counter with spring physics
 */
export function AnimatedNumber({
  value,
  duration = 1,
  formatOptions,
  className = "",
  prefix = "",
  suffix = "",
  decimals = 0,
  onComplete,
}: AnimatedNumberProps) {
  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0.1,
  });

  const display = useTransform(spring, (current) => {
    const formatted = formatOptions
      ? new Intl.NumberFormat("en-US", formatOptions).format(current)
      : current.toFixed(decimals);
    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    spring.set(value);
    
    // Call onComplete after animation
    if (onComplete) {
      const timeout = setTimeout(onComplete, duration * 1000);
      return () => clearTimeout(timeout);
    }
  }, [spring, value, duration, onComplete]);

  return <motion.span className={className}>{display}</motion.span>;
}

interface CountUpProps {
  end: number;
  start?: number;
  duration?: number;
  delay?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  onComplete?: () => void;
}

/**
 * Simple count-up animation with optional delay
 */
export function CountUp({
  end,
  start = 0,
  duration = 2,
  delay = 0,
  className = "",
  prefix = "",
  suffix = "",
  decimals = 0,
  onComplete,
}: CountUpProps) {
  const [count, setCount] = useState(start);
  const countRef = useRef(start);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const startAnimation = () => {
      const animate = (timestamp: number) => {
        if (!startTimeRef.current) {
          startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / (duration * 1000), 1);

        // Easing function (ease-out cubic)
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = start + (end - start) * eased;

        countRef.current = current;
        setCount(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          onComplete?.();
        }
      };

      requestAnimationFrame(animate);
    };

    if (delay > 0) {
      const timeout = setTimeout(startAnimation, delay * 1000);
      return () => clearTimeout(timeout);
    } else {
      startAnimation();
    }

    return () => {
      startTimeRef.current = null;
    };
  }, [end, start, duration, delay, onComplete]);

  const displayValue = decimals > 0 ? count.toFixed(decimals) : Math.round(count);

  return (
    <span className={className}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}

interface FlipNumberProps {
  value: number | string;
  className?: string;
}

/**
 * Flip-style number animation (like airport boards)
 */
export function FlipNumber({ value, className = "" }: FlipNumberProps) {
  const chars = String(value).split("");

  return (
    <span className={`inline-flex ${className}`}>
      {chars.map((char, i) => (
        <motion.span
          key={`${i}-${char}`}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0 }}
          transition={{
            duration: 0.3,
            delay: i * 0.05,
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          className="inline-block"
          style={{ transformStyle: "preserve-3d" }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}
