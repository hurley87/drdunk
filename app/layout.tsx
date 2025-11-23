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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            {/* Profile Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
              <ProfileHeader />
            </header>
            
            {/* Main Content */}
            <main className="flex-1">
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
