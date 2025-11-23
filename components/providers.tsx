"use client";

import { MiniAppProvider } from "@/contexts/miniapp-context";
import { UserProvider } from "@/contexts/user-context";
import MiniAppWalletProvider from "@/contexts/miniapp-wallet-context";
import dynamic from "next/dynamic";

const ErudaProvider = dynamic(
  () => import("../components/Eruda").then((c) => c.ErudaProvider),
  { ssr: false }
);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErudaProvider>
      <MiniAppWalletProvider>
        <MiniAppProvider addMiniAppOnLoad={true}>
          <UserProvider autoSignIn={true}>{children}</UserProvider>
        </MiniAppProvider>
      </MiniAppWalletProvider>
    </ErudaProvider>
  );
}
