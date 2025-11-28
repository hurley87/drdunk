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
import { motion, AnimatePresence } from "framer-motion";
import { useConfetti } from "@/components/ui/confetti";
import { useGameSounds } from "@/hooks/use-game-sounds";
import { Loader2, Search, ExternalLink, Check, Sparkles, Rocket, PartyPopper } from "lucide-react";
import { useApiQuery } from "@/hooks/use-api-query";
import type { NeynarCast } from "@/lib/neynar";

// Validation for cast URL or hash
const castUrlOrHashSchema = z.string().min(1, "Cast URL or hash is required").refine(
  (val) => {
    const trimmed = val.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      try {
        new URL(trimmed);
        return true;
      } catch {
        return false;
      }
    }
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
  parentCastUrl: string;
  paymentTxHash: string;
}

interface EntryResponse {
  success: boolean;
  data?: {
    entry: any;
    castHash: string;
    castUrl: string;
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
] as const;

const DEFAULT_ENTRY_FEE = parseUnits("1", 6);

export default function EntryForm() {
  const { user, isLoading: isUserLoading, signIn } = useUser();
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { isMiniAppReady } = useMiniApp();
  const { fireWin, fireStars } = useConfetti();
  const { playClick, playSuccess, playWin, playCoin, playError, playPop } = useGameSounds();
  
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

  // Lookup cast
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
      playPop();
    }
  }, [castData, castLookupIdentifier, playPop]);

  // Handle cast lookup error
  useEffect(() => {
    if (castLookupError && castLookupIdentifier) {
      setSelectedCast(null);
      setErrors((prev) => ({
        ...prev,
        parentCastUrl: "Cast not found. Please check the URL or hash.",
      }));
      playError();
    }
  }, [castLookupError, castLookupIdentifier, playError]);

  // Auto-connect wallet
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
      } catch (error: unknown) {
        console.error("[EntryForm] Failed to auto-connect wallet:", error);
      }
    }
  }, [isMiniAppReady, isConnected, isConnecting, connectors, connect]);

  // Get USDC contract address
  const usdcAddress = (() => {
    if (env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS) {
      return env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS as Address;
    }
    return chain?.id === base.id 
      ? (USDC_BASE_MAINNET as Address)
      : (USDC_BASE_SEPOLIA as Address);
  })();

  const gameContractAddress = env.NEXT_PUBLIC_GAME_CONTRACT_ADDRESS 
    ? (env.NEXT_PUBLIC_GAME_CONTRACT_ADDRESS as Address)
    : undefined;

  // Fetch entry fee from contract
  const { data: contractEntryFee, isLoading: isLoadingEntryFee } = useReadContract({
    address: gameContractAddress,
    abi: DOCTOR_DUNK_ABI,
    functionName: "entryFee",
    query: {
      enabled: !!gameContractAddress,
    },
  });

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

  // Contract interactions
  const { writeContract: approveUsdc, data: approveHash, isPending: isApproving } = useWriteContract();
  const { isLoading: isWaitingApproval, isSuccess: isApproved } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { writeContract: enterGame, data: enterHash, isPending: isEntering } = useWriteContract();
  const { isLoading: isWaitingEnter, isSuccess: isEntered } = useWaitForTransactionReceipt({
    hash: enterHash,
  });

  // Submit entry
  const { mutate: submitEntry, isPending: isSubmitting } = useApiMutation<
    EntryResponse,
    EntryFormData
  >({
    url: "/api/game/enter",
    method: "POST",
    isProtected: true,
    body: (variables) => variables,
    onSuccess: (_data) => {
      // 🎉 CELEBRATION TIME!
      playWin();
      fireWin();
      setTimeout(() => fireStars(), 500);
      
      setSuccessMessage("🎉 Entry submitted successfully! Your cast has been posted.");
      setDunkText("");
      setParentCastUrl("");
      setSelectedCast(null);
      setCastLookupIdentifier("");
      setErrors({});
      setStep("success");
      
      setTimeout(() => {
        setSuccessMessage("");
        setStep("form");
      }, 6000);
    },
    onError: (error: Error & { status?: number; data?: any }) => {
      console.error("Failed to submit entry:", error);
      playError();
      const errorMessage = error.data?.message || error.data?.error || error.message || "Failed to submit entry. Please try again.";
      setErrors({
        payment: errorMessage,
      });
      setStep("form");
    },
  });

  // Handle approval step
  useEffect(() => {
    if (isApproved && step === "approve") {
      playSuccess();
      setStep("pay");
      handleEnterGame();
    }
  }, [isApproved, step]);

  // Handle payment step
  useEffect(() => {
    if (isEntered && enterHash && step === "pay") {
      playCoin();
      submitEntry({
        dunkText,
        parentCastUrl,
        paymentTxHash: enterHash,
      });
      setStep("submit");
    }
  }, [isEntered, enterHash, step, dunkText, parentCastUrl, submitEntry, playCoin]);

  const handleApprove = () => {
    if (!gameContractAddress || !address) return;
    
    playClick();
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
        payment: "Game contract address not configured." 
      });
      return;
    }

    const tempCastHash = `temp-${Date.now()}`;
    
    setErrors({});
    enterGame({
      address: gameContractAddress,
      abi: DOCTOR_DUNK_ABI,
      functionName: "enterGame",
      args: [tempCastHash],
    });
  };

  const handleConfirmPayment = () => {
    playClick();
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
    playClick();
    setErrors({});
    setSuccessMessage("");

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
      playError();
      return;
    }

    if (!selectedCast) {
      setErrors({ parentCastUrl: "Please select a cast first" });
      playError();
      return;
    }

    if (!isConnected || !address) {
      setErrors({ payment: "Please connect your wallet" });
      playError();
      return;
    }

    setShowConfirmation(true);
  };

  const handleCastLookup = () => {
    playClick();
    const trimmed = parentCastUrl.trim();
    if (!trimmed) {
      setErrors({ parentCastUrl: "Please enter a cast URL or hash" });
      return;
    }
    setCastLookupIdentifier(trimmed);
    setSelectedCast(null);
    setErrors((prev) => ({ ...prev, parentCastUrl: undefined }));
  };

  // Show sign-in prompt
  if (isUserLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-12"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </motion.div>
    );
  }

  if (!user?.data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-amber-100 flex items-center justify-center mx-auto mb-4"
        >
          <span className="text-3xl">🔐</span>
        </motion.div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign in required</h3>
        <p className="text-sm text-gray-500 mb-6">
          You need to sign in to enter the game.
        </p>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => { playClick(); signIn(); }}
            disabled={isUserLoading}
            className="btn-game"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Sign In with Farcaster
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  const isLoading = isApproving || isWaitingApproval || isEntering || isWaitingEnter || isSubmitting;

  const getTransactionStep = () => {
    if (step === "approve") return isApproved ? "approved" : "approving";
    if (step === "pay") return isEntered ? "confirmed" : "paying";
    if (step === "submit") return "confirming";
    if (step === "success") return "success";
    return "idle";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-full overflow-hidden"
    >
      {/* Success Celebration */}
      <AnimatePresence>
        {step === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-6 p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 text-center"
          >
            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-3"
            >
              <PartyPopper className="w-12 h-12 text-green-500" />
            </motion.div>
            <motion.h3
              initial={{ y: 10 }}
              animate={{ y: 0 }}
              className="text-lg font-bold text-green-800 mb-1"
            >
              You&apos;re in the game!
            </motion.h3>
            <p className="text-sm text-green-600">{successMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Parent Cast URL Field */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label
            htmlFor="parentCastUrl"
            className="block text-sm font-medium text-gray-900 mb-2"
          >
            Reply to Cast
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
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
                placeholder="Search by cast URL or hash"
                className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm ${
                  errors.parentCastUrl 
                    ? "border-red-300 focus:ring-red-500 animate-shake" 
                    : "border-gray-200"
                }`}
                disabled={isLoading || isLookingUpCast}
              />
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                onClick={handleCastLookup}
                disabled={isLoading || isLookingUpCast || !parentCastUrl.trim()}
                className="px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl"
              >
                {isLookingUpCast ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Lookup"
                )}
              </Button>
            </motion.div>
          </div>
          <AnimatePresence>
            {errors.parentCastUrl && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-1.5 text-sm text-red-600"
              >
                {errors.parentCastUrl}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Cast Preview */}
        <AnimatePresence>
          {selectedCast && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4"
            >
              <div className="flex items-start gap-3">
                <motion.img
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  src={selectedCast.author.pfp_url || "/images/icon.png"}
                  alt={selectedCast.author.display_name}
                  className="w-10 h-10 rounded-full border-2 border-green-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {selectedCast.author.display_name}
                    </span>
                    <span className="text-sm text-gray-500">
                      @{selectedCast.author.username}
                    </span>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <Check className="w-4 h-4 text-green-500" />
                    </motion.div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2 whitespace-pre-wrap break-words line-clamp-3">
                    {selectedCast.text}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{selectedCast.reactions.likes_count} likes</span>
                    <span>{selectedCast.reactions.recasts_count} recasts</span>
                    <span>{selectedCast.replies.count} replies</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dunk Text Field */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label
            htmlFor="dunkText"
            className="block text-sm font-medium text-gray-900 mb-2"
          >
            Your Dunk
          </label>
          <textarea
            id="dunkText"
            value={dunkText}
            onChange={(e) => setDunkText(e.target.value)}
            placeholder={selectedCast ? "Write something that will get engagement..." : "Please select a cast first..."}
            rows={4}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all text-sm ${
              errors.dunkText 
                ? "border-red-300 focus:ring-red-500 animate-shake" 
                : selectedCast
                ? "border-gray-200"
                : "border-gray-200 bg-gray-50"
            }`}
            disabled={isLoading || !selectedCast}
          />
          <div className="flex items-center justify-between gap-2 mt-1.5">
            <div className="flex-1 min-w-0">
              {errors.dunkText ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-600"
                >
                  {errors.dunkText}
                </motion.p>
              ) : (
                <p className="text-xs text-gray-500">
                  {selectedCast ? "Higher engagement = better chance to win" : "Select a cast above to continue"}
                </p>
              )}
            </div>
            <p className="text-xs text-gray-400 tabular-nums">{dunkText.length} chars</p>
          </div>
        </motion.div>

        {/* Wallet Connection Warning */}
        <AnimatePresence>
          {!isConnected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl bg-amber-50 border border-amber-200 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-amber-800">
                  Please connect your wallet to enter the game.
                </p>
                {connectors.length > 0 && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="button"
                      onClick={() => {
                        playClick();
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
                          try {
                            connect({ connector: farcasterConnector });
                          } catch (error: unknown) {
                            const errorMessage = error instanceof Error ? error.message : "Unknown error";
                            setErrors({ payment: `Failed to connect wallet: ${errorMessage}` });
                          }
                        }
                      }}
                      disabled={isConnecting}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-sm px-4 py-2 rounded-lg"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Connecting...
                        </>
                      ) : (
                        "Connect Wallet"
                      )}
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transaction Status */}
        <AnimatePresence>
          {step !== "form" && step !== "success" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <TransactionStatus 
                step={getTransactionStep()}
                txHash={enterHash || approveHash}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {errors.payment && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-xl bg-red-50 border border-red-200 p-4"
            >
              <p className="text-sm text-red-800">{errors.payment}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Entry Fee Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Entry Fee</span>
            <span className="text-sm font-bold text-gray-900">
              {isLoadingEntryFee ? "..." : `${entryFeeFormatted} USDC`}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            90% goes to prize pool • One entry per day • Highest engagement wins
          </p>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: isLoading || !isConnected || !selectedCast ? 1 : 1.01 }}
          whileTap={{ scale: isLoading || !isConnected || !selectedCast ? 1 : 0.98 }}
        >
          <Button
            type="submit"
            disabled={isLoading || !isConnected || !selectedCast}
            className="w-full h-14 btn-game text-base"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span>
                  {step === "approve" ? "Approving..." : 
                   step === "pay" ? "Processing..." : 
                   step === "submit" ? "Submitting..." : "Processing..."}
                </span>
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5 mr-2" />
                <span>
                  Enter Game{!isLoadingEntryFee && ` • ${entryFeeFormatted} USDC`}
                </span>
              </>
            )}
          </Button>
        </motion.div>
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
    </motion.div>
  );
}
