import { farcasterFrame as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { env } from "@/lib/env";

// Use custom RPC URL if provided, otherwise fall back to default public RPC
const baseRpcUrl = env.NEXT_PUBLIC_BASE_RPC_URL;

export const config = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(baseRpcUrl),
    [baseSepolia.id]: http(),
  },
  connectors: [miniAppConnector()],
});

const queryClient = new QueryClient();

export default function MiniAppWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
