"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useUser } from "@/contexts/user-context";
import { z } from "zod";
import { parseUnits, Address } from "viem";
import { base } from "viem/chains";
import { env } from "@/lib/env";
import { ConfirmationDialog } from "./confirmation-dialog";
import { TransactionStatus } from "@/components/ui/transaction-status";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const dunkSchema = z.object({
  dunkText: z.string().min(1, "Dunk text cannot be empty"),
  parentCastUrl: z.string().url().optional(),
});

interface EntryFormData {
  dunkText: string;
  parentCastUrl?: string;
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
  
  const [dunkText, setDunkText] = useState("");
  const [parentCastUrl, setParentCastUrl] = useState("");
  const [errors, setErrors] = useState<{
    dunkText?: string;
    parentCastUrl?: string;
    payment?: string;
  }>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [step, setStep] = useState<"form" | "approve" | "pay" | "submit" | "success">("form");
  const [showConfirmation, setShowConfirmation] = useState(false);

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
    onSuccess: (_data) => {
      setSuccessMessage("Entry submitted successfully! Your cast has been posted.");
      setDunkText("");
      setParentCastUrl("");
      setErrors({});
      setStep("success");
      setTimeout(() => {
        setSuccessMessage("");
        setStep("form");
      }, 5000);
    },
    onError: (error: Error & { status?: number; data?: any }) => {
      console.error("Failed to submit entry:", error);
      setErrors({
        payment: error.message || "Failed to submit entry. Please try again.",
      });
      setStep("form");
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
    if (isEntered && enterHash && step === "pay") {
      // Submit to backend with payment tx hash
      // Cast hash will be generated after cast is posted by the backend
      submitEntry({
        dunkText,
        parentCastUrl: parentCastUrl || undefined,
        paymentTxHash: enterHash,
      });
      setStep("submit");
    }
  }, [isEntered, enterHash, step, dunkText, parentCastUrl, submitEntry]);

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

    // Generate a temporary cast hash - will be replaced after cast is posted
    // In production, you might want to post the cast first, then enter game
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
      dunkText,
      parentCastUrl: parentCastUrl || undefined,
    });

    if (!validationResult.success) {
      const fieldErrors: { dunkText?: string; parentCastUrl?: string } = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0] === "dunkText") {
          fieldErrors.dunkText = err.message;
        } else if (err.path[0] === "parentCastUrl") {
          fieldErrors.parentCastUrl = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Check if wallet is connected
    if (!isConnected || !address) {
      setErrors({ payment: "Please connect your wallet" });
      return;
    }

    // Show confirmation dialog
    setShowConfirmation(true);
  };

  // Show sign-in prompt if user is not authenticated
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user?.data) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔐</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign in required</h3>
        <p className="text-sm text-gray-500 mb-6">
          You need to sign in to enter the game.
        </p>
        <Button
          onClick={signIn}
          disabled={isUserLoading}
          className="bg-primary-500 hover:bg-primary-600 text-white"
        >
          Sign In with Farcaster
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
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Dunk Text Field */}
        <div>
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
            placeholder="Write something that will get engagement..."
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-shadow text-sm ${
              errors.dunkText 
                ? "border-red-300 focus:ring-red-500" 
                : "border-gray-200"
            }`}
            disabled={isLoading}
          />
          <div className="flex items-center justify-between mt-1.5">
            {errors.dunkText ? (
              <p className="text-sm text-red-600">{errors.dunkText}</p>
            ) : (
              <p className="text-xs text-gray-500">Higher engagement = better chance to win</p>
            )}
            <p className="text-xs text-gray-400">{dunkText.length} chars</p>
          </div>
        </div>

        {/* Parent Cast URL Field */}
        <div>
          <label
            htmlFor="parentCastUrl"
            className="block text-sm font-medium text-gray-900 mb-2"
          >
            Reply to Cast <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="parentCastUrl"
            type="url"
            value={parentCastUrl}
            onChange={(e) => setParentCastUrl(e.target.value)}
            placeholder="https://warpcast.com/username/0x..."
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow text-sm ${
              errors.parentCastUrl 
                ? "border-red-300 focus:ring-red-500" 
                : "border-gray-200"
            }`}
            disabled={isLoading}
          />
          {errors.parentCastUrl && (
            <p className="mt-1.5 text-sm text-red-600">{errors.parentCastUrl}</p>
          )}
        </div>

        {/* Wallet Connection Warning */}
        {!isConnected && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm text-amber-800">
              Please connect your wallet to enter the game.
            </p>
          </div>
        )}

        {/* Transaction Status */}
        {step !== "form" && step !== "success" && (
          <TransactionStatus 
            step={getTransactionStep()}
            txHash={enterHash || approveHash}
          />
        )}

        {/* Error Message */}
        {errors.payment && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">{errors.payment}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Entry Fee Info */}
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Entry Fee</span>
            <span className="text-sm font-semibold text-gray-900">
              {isLoadingEntryFee ? "..." : `${entryFeeFormatted} USDC`}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            90% goes to prize pool • One entry per day • Highest engagement wins
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading || !isConnected}
          className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span>
                {step === "approve" ? "Approving..." : 
                 step === "pay" ? "Processing..." : 
                 step === "submit" ? "Submitting..." : "Processing..."}
              </span>
            </>
          ) : (
            <span>
              Enter Game{!isLoadingEntryFee && ` • ${entryFeeFormatted} USDC`}
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
