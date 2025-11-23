/**
 * Game utility functions
 */

/**
 * Get the current round ID (UTC day since epoch)
 * Must match Solidity: block.timestamp / 86400 (seconds per day)
 * Note: Date.now() returns milliseconds, so we divide by 1000 to get seconds, then by 86400
 */
export function getCurrentRoundId(): number {
  // Convert milliseconds to seconds, then divide by seconds per day
  // This matches Solidity: block.timestamp / 86400
  return Math.floor(Date.now() / 1000 / 86400);
}

/**
 * Get the start time of a round (UTC day boundary)
 * roundId is in days since epoch (matching Solidity)
 */
export function getRoundStartTime(roundId: number): Date {
  // Convert days to milliseconds: roundId * 86400 seconds * 1000 ms
  return new Date(roundId * 86400 * 1000);
}

/**
 * Get the end time of a round (end of UTC day)
 * roundId is in days since epoch (matching Solidity)
 * Contract calculates: ((roundId + 1) * 86400) - 1 seconds
 * In milliseconds: ((roundId + 1) * 86400 * 1000) - 1000
 */
export function getRoundEndTime(roundId: number): Date {
  // Convert days to milliseconds: (roundId + 1) * 86400 seconds * 1000 ms - 1000 ms
  // This matches Solidity: ((roundId + 1) * 86400) - 1 seconds
  return new Date((roundId + 1) * 86400 * 1000 - 1000);
}

/**
 * Calculate weighted engagement score
 * Formula: likes * 1 + recasts * 2 + replies * 3
 */
export function calculateWeightedScore(
  likes: number,
  recasts: number,
  replies: number
): number {
  return likes + recasts * 2 + replies * 3;
}

/**
 * Get time remaining until round ends (in milliseconds)
 */
export function getTimeRemaining(roundId: number): number {
  const endTime = getRoundEndTime(roundId).getTime();
  const now = Date.now();
  return Math.max(0, endTime - now);
}

/**
 * Format time remaining as human-readable string
 */
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "Round ended";
  
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

