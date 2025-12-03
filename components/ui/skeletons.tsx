"use client";

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-8 w-48 bg-black/10 animate-pulse" />
        <div className="h-6 w-24 bg-black animate-pulse" />
      </div>
      
      {/* Entries */}
      {[...Array(5)].map((_, i) => {
        const rotation = i % 2 === 0 ? "rotate-[0.3deg]" : "-rotate-[0.3deg]";
        return (
          <div
            key={i}
            className={`bg-white border-3 border-black shadow-brutal p-4 ${rotation}`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start gap-3">
              {/* Rank */}
              <div className="w-10 h-10 bg-black/10 border-3 border-black animate-pulse" />
              
              {/* Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-20 bg-black/10 animate-pulse" />
                  {i === 0 && (
                    <div className="h-5 w-16 bg-red-500/20 animate-pulse" />
                  )}
                </div>
                <div className="h-4 w-full bg-black/10 animate-pulse" />
                <div className="h-4 w-3/4 bg-black/10 animate-pulse" />
                
                {/* Stats */}
                <div className="flex items-center gap-4 pt-1">
                  <div className="h-3 w-12 bg-black/10 animate-pulse" />
                  <div className="h-3 w-14 bg-black/10 animate-pulse" />
                  <div className="h-3 w-12 bg-black/10 animate-pulse" />
                  <div className="h-4 w-16 bg-red-500/20 animate-pulse ml-auto" />
                </div>
              </div>
              
              {/* Link */}
              <div className="w-10 h-10 border-3 border-black bg-black/5 animate-pulse" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white border-3 border-black shadow-brutal-sm p-4 text-center">
      <div className="h-3 w-16 mx-auto bg-black/10 animate-pulse mb-2" />
      <div className="h-8 w-20 mx-auto bg-black/10 animate-pulse" />
    </div>
  );
}

export function EntryFormSkeleton() {
  return (
    <div className="space-y-4">
      {/* Cast URL Field */}
      <div className="bg-white border-3 border-black shadow-brutal">
        <div className="p-3 border-b-3 border-black bg-black">
          <div className="h-4 w-24 bg-white/20 animate-pulse" />
        </div>
        <div className="p-4">
          <div className="h-6 w-full bg-black/10 animate-pulse" />
        </div>
      </div>
      
      {/* Dunk Text */}
      <div className="bg-white border-3 border-black shadow-brutal rotate-[0.3deg]">
        <div className="p-3 border-b-3 border-black bg-red-500">
          <div className="h-4 w-24 bg-white/20 animate-pulse" />
        </div>
        <div className="p-4">
          <div className="h-24 w-full bg-black/10 animate-pulse" />
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="h-16 bg-black/10 border-3 border-black animate-pulse" />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-3 bg-white border-3 border-black shadow-brutal-sm p-3">
      <div className="w-12 h-12 bg-black/10 border-3 border-black animate-pulse" />
      <div>
        <div className="h-4 w-24 bg-black/10 animate-pulse mb-1" />
        <div className="h-3 w-16 bg-black/10 animate-pulse" />
      </div>
    </div>
  );
}

export function WinnerCardSkeleton() {
  return (
    <div className="bg-white border-3 border-black shadow-brutal p-4">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 bg-black animate-pulse" />
        <div className="flex-1">
          <div className="h-5 w-32 bg-black/10 animate-pulse mb-2" />
          <div className="h-3 w-24 bg-black/10 animate-pulse" />
        </div>
        <div className="text-right">
          <div className="h-6 w-20 bg-red-500/20 animate-pulse mb-1" />
          <div className="h-3 w-16 bg-black/10 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function RoundStatusSkeleton() {
  return (
    <div className="bg-white border-3 border-black shadow-brutal">
      {/* Header */}
      <div className="border-b-3 border-black p-4 bg-black">
        <div className="h-6 w-32 bg-white/20 animate-pulse" />
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 divide-x-3 divide-black">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 text-center">
            <div className="h-3 w-12 mx-auto bg-black/10 animate-pulse mb-2" />
            <div className="h-8 w-16 mx-auto bg-black/10 animate-pulse mb-1" />
            <div className="h-3 w-10 mx-auto bg-black/10 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
