"use client";

import { motion } from "framer-motion";

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-40 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-4 w-24 bg-gray-200 rounded-lg animate-pulse" />
      </div>
      
      {/* Entries */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-4 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white"
        >
          <div className="flex items-start gap-3">
            {/* Rank */}
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            
            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                {i === 0 && (
                  <div className="h-5 w-16 bg-primary-100 rounded-full animate-pulse" />
                )}
              </div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              
              {/* Stats */}
              <div className="flex items-center gap-4 pt-1">
                <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-14 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-16 bg-primary-100 rounded animate-pulse ml-auto" />
              </div>
            </div>
            
            {/* Link */}
            <div className="w-8 h-8 rounded-lg bg-gray-100 animate-pulse" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="stat-card"
    >
      <div className="flex items-center justify-center gap-1.5 mb-2">
        <div className="w-4 h-4 rounded bg-gray-200 animate-pulse" />
        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-7 w-20 mx-auto bg-gray-200 rounded animate-pulse" />
    </motion.div>
  );
}

export function EntryFormSkeleton() {
  return (
    <div className="space-y-5">
      {/* Cast URL Field */}
      <div>
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="flex gap-2">
          <div className="flex-1 h-12 bg-gray-100 rounded-xl animate-pulse" />
          <div className="w-20 h-12 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
      
      {/* Dunk Text */}
      <div>
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
      </div>
      
      {/* Entry Fee */}
      <div className="h-20 bg-gray-50 rounded-xl border border-gray-100 animate-pulse" />
      
      {/* Submit Button */}
      <div className="h-14 bg-gray-200 rounded-xl animate-pulse" />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
      <div className="hidden sm:block">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1" />
        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function WinnerCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
        <div className="flex-1">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-1" />
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="text-right">
          <div className="h-5 w-20 bg-primary-100 rounded animate-pulse mb-1" />
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}

export function RoundStatusSkeleton() {
  return (
    <div className="card">
      <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100"
          >
            <div className="h-3 w-16 mx-auto bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-6 w-12 mx-auto bg-gray-200 rounded animate-pulse" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
