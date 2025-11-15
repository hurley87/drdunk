import { createHmac, timingSafeEqual } from "crypto";

export function verifyNeynarSignature(
  body: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!secret) {
    return true;
  }

  if (!signature) {
    return false;
  }

  const expected = Buffer.from(
    createHmac("sha512", secret).update(body).digest("hex"),
  );

  const provided = Buffer.from(signature);

  if (expected.length !== provided.length) {
    return false;
  }

  return timingSafeEqual(expected, provided);
}
