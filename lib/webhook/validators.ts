const REQUIRED_KEYWORDS = ["present", "gift"];

export function hasRequiredKeywords(text: string | null): boolean {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return REQUIRED_KEYWORDS.some((keyword) => lowerText.includes(keyword));
}

export function meetsScoreThreshold(
  score: number | null,
  threshold: number,
): boolean {
  return score === null || score > threshold;
}

export function isOwnCast(authorFid: number | null, botFid: number): boolean {
  return authorFid === botFid;
}
