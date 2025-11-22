import { Errors, createClient } from "@farcaster/quick-auth";
import { NextRequest } from "next/server";
import { env } from "./env";

const quickAuthClient = createClient();

/**
 * Validates Quick Auth token from request headers and returns the FID
 * @param request - Next.js request object
 * @returns The authenticated user's FID, or null if not authenticated
 */
export async function validateQuickAuth(
  request: NextRequest
): Promise<{ fid: number } | null> {
  const authorization = request.headers.get("Authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }

  try {
    const token = authorization.split(" ")[1];
    const payload = await quickAuthClient.verifyJwt({
      token,
      domain: new URL(env.NEXT_PUBLIC_URL).hostname,
    });
    return { fid: Number(payload.sub) };
  } catch (e) {
    if (e instanceof Errors.InvalidTokenError) {
      console.error("Invalid Quick Auth token:", e.message);
      return null;
    }
    throw e;
  }
}

