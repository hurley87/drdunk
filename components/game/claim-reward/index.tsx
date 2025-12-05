"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useConnect } from "wagmi";
import { useApiQuery } from "@/hooks/use-api-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useUser } from "@/contexts/user-context";
import { useMiniApp } from "@/contexts/miniapp-context";
import { GAME_CONTRACT_ADDRESS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { TransactionStatus } from "@/components/ui/transaction-status";
import { Confetti } from "@/components/ui/confetti";
import { Loader2, Trophy, Coins, ExternalLink, Gift } from "lucide-react";
import { useSound } from "@/hooks/use-sound";
import { cn } from "@/lib/utils";
import type { Address } from "viem";

interface ClaimableRound {
  id: number;
  date: string;
  pot_amount: number;
  winner_fid: number;
  winner_cast_hash: string;
  winner_wallet_address: string;
  status: string;
  finalized_at: string;
}

interface ClaimableData {
  success: boolean;
  data: {
    rounds: ClaimableRound[];
    totalClaimable: number;
    count: number;
  };
}

interface ClaimResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    roundId: number;
    txHash: string;
    blockNumber: string;
  };
}

// DoctorDunk contract ABI for claiming
const DOCTOR_DUNK_ABI = [
  {
    inputs: [{ name: "roundId", type: "uint256" }],
    name: "claimDailyReward",
    outputs: [],
    type: "function",
    stateMutability: "nonpayable",
  },
  {
    inputs: [{ name: "roundId", type: "uint256" }],
    name: "getRoundInfo",
    outputs: [
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "potAmount", type: "uint256" },
      { name: "winner", type: "address" },
      { name: "winnerCastHash", type: "string" },
      { name: "finalized", type: "bool" },
      { name: "entryCount", type: "uint256" },
    ],
    type: "function",
    stateMutability: "view",
  },
] as const;

export default function ClaimReward() {
  const { user, isLoading: isUserLoading } = useUser();
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { isMiniAppReady } = useMiniApp();
  const { play } = useSound();
  
  const [claimingRoundId, setClaimingRoundId] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch claimable rounds
  const { data: claimableData, isLoading: isLoadingClaimable, refetch } = useApiQuery<ClaimableData>({
    queryKey: ["claimable-rounds"],
    url: "/api/game/claimable",
    isProtected: true,
    enabled: !!user?.data,
  });

  // Contract write for claiming
  const { writeContract: claimReward, data: claimHash, isPending: isClaiming, error: claimError } = useWriteContract();
  const { isLoading: isWaitingClaim, isSuccess: isClaimed } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  // Update backend after successful claim
  const { mutate: confirmClaim } = useApiMutation<ClaimResponse, { roundId: number; txHash: string }>({
    url: "/api/game/claim",
    method: "POST",
    isProtected: true,
    body: (variables) => variables,
    onSuccess: () => {
      setSuccessMessage("Reward claimed successfully!");
      setShowConfetti(true);
      play("success");
      refetch();
      
      setTimeout(() => {
        setShowConfetti(false);
        setSuccessMessage("");
        setClaimingRoundId(null);
      }, 5000);
    },
    onError: (error) => {
      console.error("Failed to confirm claim:", error);
      setErrorMessage("Claim succeeded on-chain but failed to update database. Your funds are safe.");
      play("error");
    },
  });

  // Auto-connect wallet when mini-app is ready
  useEffect(() => {
    if (!isMiniAppReady || isConnected || isConnecting || connectors.length === 0) {
      return;
    }

    const farcasterConnector = connectors.find(
      (connector) => {
        const idMatch = connector.id === "farcasterFrame" || 
                       connector.id === "farcasterMiniApp" ||
                       connector.id?.toLowerCase().includes("farcaster");
        const nameMatch = connector.name?.toLowerCase().includes("farcaster");
        return (idMatch || nameMatch) && connector.ready;
      }
    );

    if (farcasterConnector) {
      try {
        connect({ connector: farcasterConnector });
      } catch (error) {
        console.error("[ClaimReward] Failed to auto-connect wallet:", error);
      }
    }
  }, [isMiniAppReady, isConnected, isConnecting, connectors, connect]);

  // Handle successful claim transaction
  useEffect(() => {
    if (isClaimed && claimHash && claimingRoundId) {
      confirmClaim({ roundId: claimingRoundId, txHash: claimHash });
    }
  }, [isClaimed, claimHash, claimingRoundId, confirmClaim]);

  // Handle claim error
  useEffect(() => {
    if (claimError) {
      console.error("Claim error:", claimError);
      setErrorMessage(claimError.message || "Failed to claim reward. Please try again.");
      setClaimingRoundId(null);
      play("error");
    }
  }, [claimError, play]);

  const handleClaim = (roundId: number) => {
    if (!isConnected || !address) {
      setErrorMessage("Please connect your wallet first");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setClaimingRoundId(roundId);
    play("click");

    claimReward({
      address: GAME_CONTRACT_ADDRESS as Address,
      abi: DOCTOR_DUNK_ABI,
      functionName: "claimDailyReward",
      args: [BigInt(roundId)],
    });
  };

  // Loading state
  if (isUserLoading || isLoadingClaimable) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  // Not signed in
  if (!user?.data) {
    return null;
  }

  const claimableRounds = claimableData?.data?.rounds || [];
  const totalClaimable = claimableData?.data?.totalClaimable || 0;

  // No claimable rewards
  if (claimableRounds.length === 0) {
    return null;
  }

  const isProcessing = isClaiming || isWaitingClaim;

  return (
    <div className="relative">
      <Confetti isActive={showConfetti} />
      
      {/* Claimable Rewards Banner */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 border-3 border-black shadow-brutal p-4 mb-4 transform -rotate-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white border-3 border-black flex items-center justify-center transform rotate-6 flex-shrink-0">
            <Gift className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/80">
              YOU HAVE UNCLAIMED REWARDS
            </p>
            <p className="font-brutal text-2xl text-white uppercase">
              {totalClaimable.toFixed(2)} USDC
            </p>
          </div>
        </div>
      </div>

      {/* Wallet Connection Warning */}
      {!isConnected && (
        <div className="border-3 border-black bg-black p-4 shadow-brutal mb-4">
          <div className="flex items-center justify-between gap-4">
            <p className="font-mono text-sm text-white uppercase tracking-wide">
              CONNECT WALLET TO CLAIM
            </p>
            {connectors.length > 0 && (
              <Button
                type="button"
                onClick={() => {
                  play("click");
                  const farcasterConnector = connectors.find(
                    (connector) => {
                      const idMatch = connector.id === "farcasterFrame" || 
                                     connector.id === "farcasterMiniApp" ||
                                     connector.id?.toLowerCase().includes("farcaster");
                      const nameMatch = connector.name?.toLowerCase().includes("farcaster");
                      return idMatch || nameMatch;
                    }
                  ) || connectors[0];
                  if (farcasterConnector) {
                    connect({ connector: farcasterConnector });
                  }
                }}
                disabled={isConnecting}
                variant="outline"
                className="bg-white text-black border-black"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    CONNECTING...
                  </>
                ) : (
                  "CONNECT"
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Transaction Status */}
      {isProcessing && claimingRoundId && (
        <div className="mb-4">
          <TransactionStatus 
            step={isClaimed ? "confirmed" : isClaiming ? "paying" : "confirming"}
            txHash={claimHash}
          />
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="border-3 border-black bg-red-500 p-4 shadow-brutal mb-4 animate-shake">
          <p className="font-mono text-sm text-white uppercase tracking-wide">{errorMessage}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="border-3 border-black bg-black p-4 shadow-brutal-red mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 border-2 border-white flex items-center justify-center flex-shrink-0 transform rotate-6">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <p className="font-mono text-sm text-white uppercase tracking-wide">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Claimable Rounds List */}
      <div className="space-y-3">
        {claimableRounds.map((round, index) => {
          const rotations = ['-rotate-1', 'rotate-1', '-rotate-0.5', 'rotate-0.5'];
          const rotation = rotations[index % rotations.length];
          const isThisRoundClaiming = claimingRoundId === round.id;
          
          return (
            <div
              key={round.id}
              className={cn(
                "bg-white border-3 border-black shadow-brutal transition-all duration-75 transform",
                rotation,
                isThisRoundClaiming && "ring-4 ring-red-500"
              )}
            >
              <div className="flex items-center gap-3 p-4">
                {/* Round Badge */}
                <div className="flex-shrink-0 w-14 h-14 bg-red-500 text-white flex flex-col items-center justify-center transform -rotate-3 border-3 border-black">
                  <span className="font-mono text-[10px] uppercase tracking-wider">RND</span>
                  <span className="font-bebas text-xl leading-none">#{round.id}</span>
                </div>

                {/* Winner Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-black text-white px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider">
                      WINNER
                    </span>
                    <Trophy className="w-4 h-4 text-red-500" />
                  </div>
                  <p className="font-mono text-xs text-black/60 uppercase tracking-wider">
                    {new Date(round.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).toUpperCase()}
                  </p>
                </div>

                {/* Prize Amount */}
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 justify-end">
                    <Coins className="w-4 h-4 text-red-500" />
                    <p className="font-bebas text-2xl text-red-500">
                      {round.pot_amount.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-mono text-[10px] text-black/60 uppercase tracking-wider">USDC</p>
                </div>

                {/* Claim Button */}
                <Button
                  onClick={() => handleClaim(round.id)}
                  disabled={!isConnected || isProcessing}
                  className={cn(
                    "flex-shrink-0 h-14 px-6",
                    isThisRoundClaiming && "animate-pulse"
                  )}
                >
                  {isThisRoundClaiming && isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {isClaiming ? "CLAIMING..." : "CONFIRMING..."}
                    </>
                  ) : (
                    <>
                      <Gift className="w-4 h-4 mr-2" />
                      CLAIM
                    </>
                  )}
                </Button>
              </div>

              {/* View Cast Link */}
              {round.winner_cast_hash && (
                <div className="border-t-3 border-black px-4 py-2 bg-black/5">
                  <a
                    href={`https://warpcast.com/${round.winner_fid}/${round.winner_cast_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-black/60 hover:text-red-500 uppercase tracking-wide transition-colors"
                  >
                    VIEW WINNING CAST <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
