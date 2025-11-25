import Providers from "@/components/providers";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ProfileHeader from "@/components/navigation/profile-header";
import BottomNav from "@/components/navigation/bottom-nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Doctor Dunk - Daily Dunk Competition",
  description: "Compete in daily dunk competitions. Pay 1 USDC to enter, highest engagement wins the pot!",
  themeColor: "#f97316",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Doctor Dunk",
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
      <body className={`${inter.className} h-full overflow-x-hidden bg-white`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            {/* Profile Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40 safe-area-inset-top">
              <ProfileHeader />
            </header>

            {/* Main Content */}
            <main className="flex-1 pb-20">{children}</main>

            {/* Bottom Navigation */}
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
