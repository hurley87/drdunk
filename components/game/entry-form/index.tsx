"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useConnect } from "wagmi";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useUser } from "@/contexts/user-context";
import { useMiniApp } from "@/contexts/miniapp-context";
import { z } from "zod";
import { parseUnits, Address } from "viem";
import { base } from "viem/chains";
import { env } from "@/lib/env";
import { ConfirmationDialog } from "./confirmation-dialog";
import { TransactionStatus } from "@/components/ui/transaction-status";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Check, Trophy, Zap, Eye } from "lucide-react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useApiQuery } from "@/hooks/use-api-query";
import type { NeynarCast } from "@/lib/neynar";
import { useSound } from "@/hooks/use-sound";
import { Confetti } from "@/components/ui/confetti";
import { cn } from "@/lib/utils";

// Validation for cast URL or hash
const castUrlOrHashSchema = z.string().min(1, "Cast URL or hash is required").refine(
  (val) => {
    const trimmed = val.trim();
    // Accept URLs (must start with http:// or https://)
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      try {
        new URL(trimmed);
        return true;
      } catch {
        return false;
      }
    }
    // Accept cast hashes (must start with 0x and be hex)
    if (trimmed.startsWith("0x") && /^0x[a-fA-F0-9]+$/.test(trimmed)) {
      return true;
    }
    return false;
  },
  {
    message: "Must be a valid cast URL (https://warpcast.com/...) or cast hash (0x...)",
  }
);

const dunkSchema = z.object({
  parentCastUrl: castUrlOrHashSchema,
  dunkText: z.string().min(1, "Dunk text cannot be empty"),
});

interface EntryFormData {
  dunkText: string;
  parentCastHash: string;
  paymentTxHash: string;
}

interface EntryResponse {
  success: boolean;
  data?: {
    entry: any;
    castHash: string;
    castUrl: string;
    contractSynced: boolean;
  };
  error?: string;
  message?: string;
}

// USDC contract addresses
const USDC_BASE_MAINNET = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

// USDC ABI
const USDC_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
    stateMutability: "nonpayable",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
    stateMutability: "view",
  },
  {
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
    stateMutability: "nonpayable",
  },
] as const;

// DoctorDunk contract ABI
const DOCTOR_DUNK_ABI = [
  {
    inputs: [{ name: "castHash", type: "string" }],
    name: "enterGame",
    outputs: [],
    type: "function",
    stateMutability: "nonpayable",
  },
  {
    inputs: [],
    name: "entryFee",
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
    stateMutability: "view",
  },
  {
    inputs: [],
    name: "getTokenAddress",
    outputs: [{ name: "", type: "address" }],
    type: "function",
    stateMutability: "view",
  },
  {
    inputs: [],
    name: "paymentToken",
    outputs: [{ name: "", type: "address" }],
    type: "function",
    stateMutability: "view",
  },
] as const;

const DEFAULT_ENTRY_FEE = parseUnits("1", 6); // Default to 1 USDC (6 decimals) if contract read fails

export default function EntryForm() {
  const { user, isLoading: isUserLoading, signIn } = useUser();
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { isMiniAppReady } = useMiniApp();
  const { play } = useSound();
  
  const [parentCastUrl, setParentCastUrl] = useState("");
  const [dunkText, setDunkText] = useState("");
  const [selectedCast, setSelectedCast] = useState<NeynarCast | null>(null);
  const [castLookupIdentifier, setCastLookupIdentifier] = useState<string>("");
  const [errors, setErrors] = useState<{
    dunkText?: string;
    parentCastUrl?: string;
    payment?: string;
  }>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [step, setStep] = useState<"form" | "approve" | "pay" | "submit" | "success">("form");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Lookup cast when identifier is provided
  const { data: castData, isLoading: isLookingUpCast, error: castLookupError } = useApiQuery<{
    success: boolean;
    cast: NeynarCast;
  }>({
    url: `/api/cast/lookup?identifier=${encodeURIComponent(castLookupIdentifier)}`,
    method: "GET",
    isProtected: false,
    enabled: !!castLookupIdentifier && castLookupIdentifier.trim().length > 0,
    retry: false,
    queryKey: ["cast-lookup", castLookupIdentifier],
  });

  // Handle cast lookup success
  useEffect(() => {
    if (castData?.cast) {
      setSelectedCast(castData.cast);
      setParentCastUrl(castLookupIdentifier);
      setErrors((prev) => ({ ...prev, parentCastUrl: undefined }));
      play("pop"); // Sound effect for cast found
    }
  }, [castData, castLookupIdentifier, play]);

  // Handle cast lookup error
  useEffect(() => {
    if (castLookupError && castLookupIdentifier) {
      setSelectedCast(null);
      setErrors((prev) => ({
        ...prev,
        parentCastUrl: "Cast not found. Please check the URL or hash.",
      }));
      play("error");
    }
  }, [castLookupError, castLookupIdentifier, play]);

  // Auto-connect wallet when mini-app is ready
  useEffect(() => {
    if (!isMiniAppReady || isConnected || isConnecting || connectors.length === 0) {
      return;
    }

    // Find the Farcaster mini-app connector
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
      console.log("[EntryForm] Auto-connecting wallet with connector:", {
        id: farcasterConnector.id,
        name: farcasterConnector.name,
        ready: farcasterConnector.ready,
      });
      try {
        connect({ connector: farcasterConnector });
      } catch (error: unknown) {
        console.error("[EntryForm] Failed to auto-connect wallet:", error);
      }
    } else {
      // Log available connectors for debugging
      console.log("[EntryForm] Available connectors:", connectors.map(c => ({
        id: c.id,
        name: c.name,
        ready: c.ready,
      })));
    }
  }, [isMiniAppReady, isConnected, isConnecting, connectors, connect]);

  // Get USDC contract address based on chain or env
  const usdcAddress = (() => {
    // Use env variable if available, otherwise fallback to chain-based defaults
    if (env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS) {
      return env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS as Address;
    }
    return chain?.id === base.id 
      ? (USDC_BASE_MAINNET as Address)
      : (USDC_BASE_SEPOLIA as Address);
  })();

  // Get game contract address from environment variable
  const gameContractAddress = env.NEXT_PUBLIC_GAME_CONTRACT_ADDRESS 
    ? (env.NEXT_PUBLIC_GAME_CONTRACT_ADDRESS as Address)
    : undefined;

  // Dynamically fetch entryFee from contract
  const { data: contractEntryFee, isLoading: isLoadingEntryFee } = useReadContract({
    address: gameContractAddress,
    abi: DOCTOR_DUNK_ABI,
    functionName: "entryFee",
    query: {
      enabled: !!gameContractAddress,
    },
  });

  // Use contract ENTRY_FEE if available, otherwise use default
  const ENTRY_FEE = contractEntryFee !== undefined ? contractEntryFee : DEFAULT_ENTRY_FEE;
  const entryFeeFormatted = (parseFloat(ENTRY_FEE.toString()) / 1e6).toFixed(2);
  const platformFeeFormatted = ((parseFloat(ENTRY_FEE.toString()) / 1e6) * 0.1).toFixed(2);
  const toPrizePoolFormatted = ((parseFloat(ENTRY_FEE.toString()) / 1e6) * 0.9).toFixed(2);

  // Check USDC allowance
  const { data: allowance } = useReadContract({
    address: usdcAddress,
    abi: USDC_ABI,
    functionName: "allowance",
    args: gameContractAddress ? [address || "0x0", gameContractAddress] : undefined,
    query: {
      enabled: !!address && !!gameContractAddress && isConnected,
    },
  });

  // Approve USDC
  const { writeContract: approveUsdc, data: approveHash, isPending: isApproving } = useWriteContract();
  const { isLoading: isWaitingApproval, isSuccess: isApproved } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Enter game (transfer USDC and submit cast hash)
  const { writeContract: enterGame, data: enterHash, isPending: isEntering } = useWriteContract();
  const { isLoading: isWaitingEnter, isSuccess: isEntered } = useWaitForTransactionReceipt({
    hash: enterHash,
  });

  // Submit entry to backend after payment
  const { mutate: submitEntry, isPending: isSubmitting } = useApiMutation<
    EntryResponse,
    EntryFormData
  >({
    url: "/api/game/enter",
    method: "POST",
    isProtected: true,
    body: (variables) => variables,
    onSuccess: () => {
      setSuccessMessage("Entry submitted successfully! Your cast has been posted.");
      setDunkText("");
      setParentCastUrl("");
      setSelectedCast(null);
      setCastLookupIdentifier("");
      setErrors({});
      setStep("success");
      
      setShowConfetti(true);
      play("success");
      
      setTimeout(() => {
        setShowConfetti(false);
        setSuccessMessage("");
        setStep("form");
      }, 5000);
    },
    onError: (error: Error & { status?: number; data?: any }) => {
      console.error("Failed to submit entry:", error);
      const errorMessage = error.data?.message || error.data?.error || error.message || "Failed to submit entry. Please try again.";
      setErrors({
        payment: errorMessage,
      });
      setStep("form");
      play("error");
    },
  });

  // Handle approval step
  useEffect(() => {
    if (isApproved && step === "approve") {
      setStep("pay");
      handleEnterGame();
    }
  }, [isApproved, step]);

  // Handle payment step - after entering game on contract
  useEffect(() => {
    if (isEntered && enterHash && step === "pay" && selectedCast?.hash) {
      // Submit to backend with payment tx hash
      // Backend will post cast and handle hash sync
      submitEntry({
        dunkText,
        parentCastHash: selectedCast.hash,
        paymentTxHash: enterHash,
      });
      setStep("submit");
    }
  }, [isEntered, enterHash, step, dunkText, selectedCast?.hash, submitEntry]);

  const handleApprove = () => {
    if (!gameContractAddress || !address) return;
    
    setErrors({});
    setShowConfirmation(false);
    approveUsdc({
      address: usdcAddress,
      abi: USDC_ABI,
      functionName: "approve",
      args: [gameContractAddress, ENTRY_FEE],
    });
    setStep("approve");
  };

  const handleEnterGame = () => {
    if (!gameContractAddress) {
      setErrors({ 
        payment: "Game contract address not configured. Please set NEXT_PUBLIC_GAME_CONTRACT_ADDRESS environment variable." 
      });
      return;
    }

    const tempCastHash = `temp-${Date.now()}-${user?.data?.fid || 0}`;
    
    setErrors({});
    enterGame({
      address: gameContractAddress,
      abi: DOCTOR_DUNK_ABI,
      functionName: "enterGame",
      args: [tempCastHash],
    });
  };

  const handleConfirmPayment = () => {
    // Check if already approved
    const hasAllowance = allowance && allowance >= ENTRY_FEE;
    if (hasAllowance) {
      setShowConfirmation(false);
      setStep("pay");
      handleEnterGame();
    } else {
      handleApprove();
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    // Client-side validation
    const validationResult = dunkSchema.safeParse({
      parentCastUrl,
      dunkText,
    });

    if (!validationResult.success) {
      const fieldErrors: { dunkText?: string; parentCastUrl?: string } = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0] === "parentCastUrl") {
          fieldErrors.parentCastUrl = err.message;
        } else if (err.path[0] === "dunkText") {
          fieldErrors.dunkText = err.message;
        }
      });
      setErrors(fieldErrors);
      play("error");
      return;
    }

    // Check if cast is selected
    if (!selectedCast) {
      setErrors({ parentCastUrl: "Please select a cast first" });
      play("error");
      return;
    }

    // Check if wallet is connected
    if (!isConnected || !address) {
      setErrors({ payment: "Please connect your wallet" });
      play("error");
      return;
    }

    // Show confirmation dialog
    setShowConfirmation(true);
  };

  const handleCastLookup = () => {
    const trimmed = parentCastUrl.trim();
    if (!trimmed) {
      setErrors({ parentCastUrl: "Please enter a cast URL or hash" });
      play("error");
      return;
    }
    setCastLookupIdentifier(trimmed);
    setSelectedCast(null);
    setErrors((prev) => ({ ...prev, parentCastUrl: undefined }));
  };

  // Show sign-in prompt if user is not authenticated
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (!user?.data) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-black border-3 border-black flex items-center justify-center mx-auto mb-4 transform -rotate-6 animate-brutal-bounce">
          <span className="text-2xl">🔐</span>
        </div>
        <h3 className="font-brutal text-2xl text-black mb-2 uppercase">SIGN IN REQUIRED</h3>
        <p className="font-mono text-xs text-black/60 mb-6 uppercase tracking-wide">
          YOU NEED TO SIGN IN TO ENTER THE GAME
        </p>
        <Button
          onClick={() => {
            play("click");
            signIn();
          }}
          disabled={isUserLoading}
        >
          SIGN IN WITH FARCASTER
        </Button>
      </div>
    );
  }

  const isLoading = isApproving || isWaitingApproval || isEntering || isWaitingEnter || isSubmitting;

  // Get current transaction step for stepper
  const getTransactionStep = () => {
    if (step === "approve") return isApproved ? "approved" : "approving";
    if (step === "pay") return isEntered ? "confirmed" : "paying";
    if (step === "submit") return "confirming";
    if (step === "success") return "success";
    return "idle";
  };

  return (
    <div className="w-full max-w-full overflow-hidden relative">
      <Confetti isActive={showConfetti} />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Parent Cast URL Field - Brutalist */}
        <div>
          <label
            htmlFor="parentCastUrl"
            className="block font-brutal text-xl text-black mb-3 uppercase tracking-wider"
          >
            REPLY TO CAST
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 pointer-events-none" />
              <input
                id="parentCastUrl"
                type="text"
                value={parentCastUrl}
                onChange={(e) => {
                  setParentCastUrl(e.target.value);
                  setSelectedCast(null);
                  setErrors((prev) => ({ ...prev, parentCastUrl: undefined }));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCastLookup();
                  }
                }}
                placeholder="SEARCH BY CAST URL OR HASH"
                className={cn(
                  "w-full pl-12 pr-4 py-4 bg-white border-3 font-mono text-sm uppercase tracking-wide placeholder:text-black/30 focus:outline-none transition-all duration-75",
                  errors.parentCastUrl 
                    ? "border-red-500 shadow-brutal-red animate-shake" 
                    : "border-black shadow-brutal-sm focus:shadow-brutal focus:translate-x-[-2px] focus:translate-y-[-2px]"
                )}
                disabled={isLoading || isLookingUpCast}
              />
            </div>
            <Button
              type="button"
              onClick={handleCastLookup}
              disabled={isLoading || isLookingUpCast || !parentCastUrl.trim()}
              variant="outline"
              className="h-auto py-4 px-6"
            >
              {isLookingUpCast ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "LOOKUP"
              )}
            </Button>
          </div>
          {errors.parentCastUrl && (
            <p className="mt-2 font-mono text-xs text-red-500 uppercase tracking-wide">{errors.parentCastUrl}</p>
          )}
          {isLookingUpCast && (
            <p className="mt-2 font-mono text-xs text-black/60 uppercase tracking-wide animate-pulse">LOOKING UP CAST...</p>
          )}
        </div>

        {/* Cast Preview - Brutalist */}
        {selectedCast && (
          <div className="border-3 border-black bg-white p-4 shadow-brutal-sm transform -rotate-1">
            <div className="flex items-start gap-4">
              <img
                src={selectedCast.author.pfp_url || "/images/icon.png"}
                alt={selectedCast.author.display_name}
                className="w-12 h-12 border-3 border-black"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-brutal text-lg uppercase tracking-wide text-black">
                    {selectedCast.author.display_name}
                  </span>
                  <span className="font-mono text-xs text-black/60 uppercase">
                    @{selectedCast.author.username}
                  </span>
                  <Check className="w-5 h-5 text-red-500 flex-shrink-0" />
                </div>
                <p className="font-mono text-sm text-black mb-3 whitespace-pre-wrap break-words">
                  {selectedCast.text}
                </p>
                <div className="flex items-center gap-4 font-mono text-xs text-black/60 uppercase tracking-wide">
                  <span>{selectedCast.reactions.likes_count} LIKES</span>
                  <span>{selectedCast.reactions.recasts_count} RECASTS</span>
                  <span>{selectedCast.replies.count} REPLIES</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sdk.actions.viewCast({ hash: selectedCast.hash });
                  }}
                  className="inline-flex items-center gap-1 mt-3 font-mono text-xs text-red-500 hover:underline uppercase tracking-wide cursor-pointer"
                >
                  VIEW CAST <Eye className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dunk Text Field - Brutalist */}
        <div>
          <label
            htmlFor="dunkText"
            className="block font-brutal text-xl text-black mb-3 uppercase tracking-wider"
          >
            YOUR DUNK
          </label>
          <textarea
            id="dunkText"
            value={dunkText}
            onChange={(e) => setDunkText(e.target.value)}
            placeholder={selectedCast ? "WRITE SOMETHING THAT WILL GET ENGAGEMENT..." : "PLEASE SELECT A CAST FIRST..."}
            rows={4}
            className={cn(
              "w-full px-4 py-4 bg-white border-3 font-mono text-sm tracking-wide placeholder:text-black/30 placeholder:uppercase resize-none focus:outline-none transition-all duration-75",
              errors.dunkText 
                ? "border-red-500 shadow-brutal-red animate-shake" 
                : selectedCast
                ? "border-black shadow-brutal-sm focus:shadow-brutal focus:translate-x-[-2px] focus:translate-y-[-2px]"
                : "border-black/30 bg-black/5"
            )}
            disabled={isLoading || !selectedCast}
          />
          <div className="flex items-center justify-between gap-2 mt-2">
            <div className="flex-1 min-w-0">
              {errors.dunkText ? (
                <p className="font-mono text-xs text-red-500 uppercase tracking-wide">{errors.dunkText}</p>
              ) : !selectedCast ? (
                <p className="font-mono text-xs text-black/60 uppercase tracking-wide">SELECT A CAST ABOVE TO CONTINUE</p>
              ) : (
                <p className="font-mono text-xs text-black/60 uppercase tracking-wide">HIGHER ENGAGEMENT = BETTER CHANCE TO WIN</p>
              )}
            </div>
            <p className={cn(
              "font-mono text-xs uppercase tracking-wide flex-shrink-0",
              dunkText.length > 280 ? 'text-red-500 font-bold' : 'text-black/40'
            )}>{dunkText.length} CHARS</p>
          </div>
        </div>

        {/* Wallet Connection Warning - Brutalist */}
        {!isConnected && (
          <div className="border-3 border-black bg-red-500 p-4 shadow-brutal animate-brutal-pulse">
            <div className="flex items-center justify-between gap-4">
              <p className="font-mono text-sm text-white uppercase tracking-wide">
                PLEASE CONNECT YOUR WALLET TO ENTER THE GAME
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
                    "CONNECT WALLET"
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Transaction Status */}
        {step !== "form" && step !== "success" && (
          <TransactionStatus 
            step={getTransactionStep()}
            txHash={enterHash || approveHash}
          />
        )}

        {/* Error Message - Brutalist */}
        {errors.payment && (
          <div className="border-3 border-black bg-red-500 p-4 shadow-brutal animate-shake">
            <p className="font-mono text-sm text-white uppercase tracking-wide">{errors.payment}</p>
          </div>
        )}

        {/* Success Message - Brutalist */}
        {successMessage && (
          <div className="border-3 border-black bg-black p-4 shadow-brutal-red">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 border-2 border-white flex items-center justify-center flex-shrink-0 transform rotate-6">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <p className="font-mono text-sm text-white uppercase tracking-wide">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Entry Fee Info - Brutalist */}
        <div className="border-3 border-black bg-white p-4 shadow-brutal-sm transform rotate-1 hover:rotate-0 transition-transform duration-75">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs text-black/60 uppercase tracking-wider">ENTRY FEE</span>
            <span className="font-brutal text-xl text-black">
              {isLoadingEntryFee ? "..." : `${entryFeeFormatted} USDC`}
            </span>
          </div>
          <p className="font-mono text-[10px] text-black/60 uppercase tracking-wider">
            90% GOES TO PRIZE POOL • ONE ENTRY PER DAY • HIGHEST ENGAGEMENT WINS
          </p>
        </div>

        {/* Submit Button - Brutalist */}
        <Button
          type="submit"
          disabled={isLoading || !isConnected || !selectedCast}
          className="w-full h-14"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span>
                {step === "approve" ? "APPROVING..." : 
                 step === "pay" ? "PROCESSING PAYMENT..." : 
                 step === "submit" ? "POSTING CAST..." : "PROCESSING..."}
              </span>
            </>
          ) : (
            <span className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              ENTER GAME{!isLoadingEntryFee && ` • ${entryFeeFormatted} USDC`}
            </span>
          )}
        </Button>
      </form>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        onConfirm={handleConfirmPayment}
        entryFee={entryFeeFormatted}
        platformFee={platformFeeFormatted}
        toPrizePool={toPrizePoolFormatted}
        contractAddress={gameContractAddress}
        isLoading={isApproving}
      />
    </div>
  );
}
