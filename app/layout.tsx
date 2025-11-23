import Providers from "@/components/providers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ProfileHeader from "@/components/navigation/profile-header";
import BottomNav from "@/components/navigation/bottom-nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Doctor Dunk - Daily Dunk Competition",
  description: "Compete in daily dunk competitions. Pay 1 USDC to enter, highest engagement wins the pot!",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  themeColor: "#f97316",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Doctor Dunk",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full overflow-x-hidden`}>
        <Providers>
          <div className="flex flex-col min-h-screen safe-area-inset-top">
            {/* Profile Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40 shadow-sm safe-area-inset-top">
              <ProfileHeader />
            </header>
            
            {/* Main Content */}
            <main className="flex-1 pb-20 safe-area-inset-bottom">
              {children}
            </main>
            
            {/* Bottom Navigation */}
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
