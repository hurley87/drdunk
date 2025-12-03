import Providers from "@/components/providers";
import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Space_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "DOCTOR DUNK - DAILY DUNK COMPETITION",
  description: "COMPETE IN DAILY DUNK COMPETITIONS. PAY 1 USDC TO ENTER. HIGHEST ENGAGEMENT WINS THE POT.",
  themeColor: "#FF0000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DOCTOR DUNK",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${bebasNeue.variable} ${spaceMono.variable} font-mono h-full overflow-x-hidden bg-white`}>
        <Providers>
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
