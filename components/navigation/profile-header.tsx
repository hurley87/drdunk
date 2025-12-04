"use client";

import { useUser } from "@/contexts/user-context";
import { User, DollarSign } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccount, useReadContract } from "wagmi";
import { Address, formatUnits } from "viem";
import { USDC_CONTRACT_ADDRESS } from "@/lib/constants";

// USDC ABI for balanceOf
const USDC_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
    stateMutability: "view",
  },
] as const;

export default function ProfileHeader() {
  const { user, isLoading } = useUser();
  const { address, isConnected } = useAccount();

  // Hardcoded USDC address (Base Mainnet)
  const usdcAddress = USDC_CONTRACT_ADDRESS as Address;

  // Read USDC balance
  const { data: usdcBalance, isLoading: isBalanceLoading } = useReadContract({
    address: usdcAddress,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 30000, // Refresh every 30 seconds
    },
  });

  // Format USDC balance (6 decimals)
  const formattedBalance = usdcBalance
    ? parseFloat(formatUnits(usdcBalance, 6)).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
    : "0";

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b-3 border-black">
      {/* Left: Profile Picture */}
      {isLoading ? (
        <Skeleton className="w-10 h-10 rounded-full border-3 border-black" />
      ) : !user || !user.data ? (
        <div className="w-10 h-10 bg-white border-3 border-black shadow-brutal-sm rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-black" />
        </div>
      ) : user.data.pfp_url ? (
        <div className="relative">
          <Image
            src={user.data.pfp_url}
            alt={user.data.display_name || user.data.username}
            width={40}
            height={40}
            className="rounded-full border-3 border-black shadow-brutal-sm"
          />
        </div>
      ) : (
        <div className="w-10 h-10 bg-brutal-red border-3 border-black shadow-brutal-sm rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
      )}

      {/* Right: USDC Balance */}
      <div className="flex items-center gap-2">
        {isBalanceLoading ? (
          <Skeleton className="h-8 w-20 border-2 border-black" />
        ) : (
          <div className="flex items-center gap-1.5 bg-white border-3 border-black shadow-brutal-sm px-3 py-1.5">
            <div className="w-6 h-6 bg-[#2775CA] rounded-full flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
            <span className="font-bebas text-xl tracking-wide text-black">
              {formattedBalance}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
