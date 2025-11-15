import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { GiftAnalysis } from "./types";

const giftAnalysisSchema = z.object({
  isAskingForPresent: z
    .boolean()
    .describe("Whether the user is asking for a present/gift"),
  recipient: z
    .string()
    .nullable()
    .describe("The intended recipient of the gift, or null if not specified"),
  replyText: z
    .string()
    .describe(
      "A friendly reply message - either remind them they can ask for a present, or offer to let them buy one",
    ),
});

export async function analyzeGiftIntent(
  castText: string,
): Promise<GiftAnalysis> {
  const result = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: giftAnalysisSchema,
    prompt: `You are Dr. Dunk, a gift-giving bot on Farcaster. Analyze this cast to determine if the user wants to buy a present for someone else.

IMPORTANT RULES:
1. Users can ONLY buy presents for OTHER PEOPLE, not for themselves.
2. NEVER use @mentions or usernames in your reply text - this could create infinite loops!
3. Keep replies generic and friendly without addressing specific users by name.

Cast text: "${castText}"

Determine:
1. Is the user asking to buy a present for someone else? (Look for mentions of other people, usernames, or requests to gift someone)
2. Who is the intended recipient? (Must be someone other than the asker - look for @mentions, names, or references to other people)
3. Generate a friendly reply WITHOUT using any @mentions or usernames:
   - If they're asking for a present for THEMSELVES: Politely explain they can only buy presents for OTHER PEOPLE, and encourage them to pick someone to gift
   - If they're asking to buy a present for SOMEONE ELSE: Acknowledge their generosity and tell them they can proceed to buy one (be enthusiastic!)
   - If they're just mentioning the keywords without clear intent: Remind them they can buy presents for friends and other people on Farcaster

Keep the tone fun and encouraging, but NEVER include @mentions or usernames!`,
  });

  return result.object;
}

export function getErrorType(errorMessage: string): string {
  if (
    errorMessage.includes("rate limit") ||
    errorMessage.includes("429") ||
    errorMessage.includes("quota")
  ) {
    return "rate_limit";
  }

  if (
    errorMessage.includes("401") ||
    errorMessage.includes("unauthorized")
  ) {
    return "auth_error";
  }

  return "api_error";
}

export function getErrorStatusCode(errorMessage: string): number {
  const errorType = getErrorType(errorMessage);

  switch (errorType) {
    case "rate_limit":
      return 429;
    case "auth_error":
      return 401;
    default:
      return 500;
  }
}
