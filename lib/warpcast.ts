import { env } from "@/lib/env";

/**
 * Get the farcaster manifest for the frame, generate yours from Warpcast Mobile
 *  On your phone to Settings > Developer > Domains > insert website hostname > Generate domain manifest
 * @returns The farcaster manifest for the frame
 */
export async function getFarcasterManifest() {
  let frameName = "Doctor Dunk";
  let noindex = false;
  const appUrl = env.NEXT_PUBLIC_URL;
  if (appUrl.includes("localhost")) {
    frameName += " Local";
    noindex = true;
  } else if (appUrl.includes("ngrok")) {
    frameName += " NGROK";
    noindex = true;
  } else if (appUrl.includes("https://dev.")) {
    frameName += " Dev";
    noindex = true;
  }
  return {
    accountAssociation: {
      header: env.NEXT_PUBLIC_FARCASTER_HEADER,
      payload: env.NEXT_PUBLIC_FARCASTER_PAYLOAD,
      signature: env.NEXT_PUBLIC_FARCASTER_SIGNATURE,
    },
    frame: {
      version: "1",
      name: frameName,
      iconUrl: `${appUrl}/images/icon.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/images/feed.png`,
      buttonTitle: "Enter Today's Dunk",
      splashImageUrl: `${appUrl}/images/splash.png`,
      splashBackgroundColor: "#EF4444",
      webhookUrl: `${appUrl}/api/webhook`,
      // Metadata https://github.com/farcasterxyz/miniapps/discussions/191
      subtitle: "Daily engagement competition", // 30 characters, no emojis or special characters, short description under app name
      description: "Pay 1 USDC to enter your best cast. Get the most likes and replies by midnight UTC to win the pot. New competition every day.", // 170 characters, no emojis or special characters, promotional message displayed on Mini App Page
      primaryCategory: "games",
      tags: ["dunk", "competition", "engagement", "rewards", "daily"], // up to 5 tags, filtering/search tags
      tagline: "Dunk for glory, win the pot", // 30 characters, marketing tagline should be punchy and descriptive
      ogTitle: "Doctor Dunk", // 30 characters, app name + short tag, Title case, no emojis
      ogDescription: "Daily cast competition. Enter your best post and win the prize pot.", // 100 characters, summarize core benefits in 1-2 lines
      screenshotUrls: [
        // 1284 x 2778, visual previews of the app, max 3 screenshots
        `${appUrl}/images/feed.png`,
      ],
      heroImageUrl: `${appUrl}/images/feed.png`, // 1200 x 630px (1.91:1), promotional display image on top of the mini app store
      ogImageUrl: `${appUrl}/images/feed.png`, // 1200 x 630px (1.91:1), promotional image, same as app hero image
      noindex: noindex,
    },
  };
}
