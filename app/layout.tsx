import Providers from "@/components/providers";
import { env } from "@/lib/env";
import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Space_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import ProfileHeader from "@/components/navigation/profile-header";
import BottomNav from "@/components/navigation/bottom-nav";

const bebasNeue = Bebas_Neue({ 
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
});

const spaceMono = Space_Mono({ 
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

const appUrl = env.NEXT_PUBLIC_URL;
const appName = "Doctor Dunk";
const appDescription = "Compete in daily dunk competitions. Pay 1 USDC to enter. Highest engagement wins the pot.";

export function generateMetadata(): Metadata {
  return {
    title: `${appName} - Daily Dunk Competition`,
    description: appDescription,
    metadataBase: new URL(appUrl),
    themeColor: "#FF0000",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: appName,
    },
    openGraph: {
      title: `${appName} - Daily Dunk Competition`,
      description: appDescription,
      type: "website",
      images: [
        {
          url: `${appUrl}/images/feed.png`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${appName} - Daily Dunk Competition`,
      description: appDescription,
      images: [`${appUrl}/images/feed.png`],
    },
    other: {
      "fc:miniapp": JSON.stringify({
        version: "next",
        imageUrl: `${appUrl}/images/feed.png`,
        button: {
          title: "Launch App",
          action: {
            type: "launch_miniapp",
            name: appName,
            url: appUrl,
            splashImageUrl: `${appUrl}/images/splash.png`,
            splashBackgroundColor: "#FF0000",
          },
        },
      }),
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookie = (await headers()).get("cookie");
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${bebasNeue.variable} ${spaceMono.variable} font-mono h-full overflow-x-hidden bg-white`}>
        <Providers cookie={cookie}>
          <div className="flex flex-col min-h-screen">
            {/* Profile Header - Brutalist */}
            <header className="bg-white border-b-3 border-black sticky top-0 z-40 safe-area-inset-top">
              <ProfileHeader />
            </header>

            {/* Main Content */}
            <main className="flex-1 pb-24">{children}</main>

            {/* Bottom Navigation - Brutalist */}
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
