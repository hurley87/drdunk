"use client";

import { motion } from "framer-motion";
import { Trophy, Sparkles } from "lucide-react";

interface HeroSectionProps {
  formattedDate: string;
}

export function HeroSection({ formattedDate }: HeroSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      {/* Animated Trophy */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.1,
        }}
        className="relative inline-block mb-4"
      >
        {/* Trophy Container */}
        <motion.div
          animate={{ 
            y: [0, -5, 0],
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 3,
            ease: "easeInOut",
          }}
          className="relative"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 via-amber-500 to-yellow-500 flex items-center justify-center shadow-2xl shadow-primary-500/40">
            <Trophy className="w-10 h-10 text-white drop-shadow-lg" />
          </div>
          
          {/* Sparkle effects */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-1 -right-1"
          >
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </motion.div>
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
            className="absolute -bottom-1 -left-1"
          >
            <Sparkles className="w-4 h-4 text-primary-400" />
          </motion.div>
        </motion.div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500 to-amber-500 blur-xl opacity-30 -z-10 scale-150" />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gradient-orange mb-1">
          Daily Dunk Competition
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-gray-500 flex items-center justify-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {formattedDate}
        </motion.p>
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-3 text-sm text-gray-600 max-w-md mx-auto"
      >
        Post your best dunk reply, get the most engagement, and{" "}
        <span className="font-semibold text-primary-600">win the pot!</span>
      </motion.p>
    </motion.div>
  );
}
