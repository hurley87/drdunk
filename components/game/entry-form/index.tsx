"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useUser } from "@/contexts/user-context";
import { z } from "zod";
import { parseUnits, Address } from "viem";
import { base, baseSepolia } from "viem/chains";
import { env } from "@/lib/env";

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
    name: "ENTRY_FEE",
    outputs: [{ name: "", type: "uint256" }],
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
  const [step, setStep] = useState<"form" | "approve" | "pay" | "submit">("form");

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

  // Dynamically fetch ENTRY_FEE from contract
  const { data: contractEntryFee, isLoading: isLoadingEntryFee } = useReadContract({
    address: gameContractAddress,
    abi: DOCTOR_DUNK_ABI,
    functionName: "ENTRY_FEE",
    query: {
      enabled: !!gameContractAddress,
    },
  });

  // Use contract ENTRY_FEE if available, otherwise use default
  const ENTRY_FEE = contractEntryFee !== undefined ? contractEntryFee : DEFAULT_ENTRY_FEE;

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
      setStep("form");
      setTimeout(() => setSuccessMessage(""), 5000);
    },
    onError: (error: Error & { status?: number; data?: any }) => {
      console.error("Failed to submit entry:", error);
      setErrors({
        payment: error.message || "Failed to submit entry. Please try again.",
      });
    },
  });

  // Handle approval step
  useEffect(() => {
    if (isApproved && step === "approve") {
      setStep("pay");
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

    // Check if approved
    const hasAllowance = allowance && allowance >= ENTRY_FEE;
    if (!hasAllowance) {
      handleApprove();
      return;
    }

    // Enter game
    handleEnterGame();
  };

  // Show sign-in prompt if user is not authenticated
  if (isUserLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      </div>
    );
  }

  if (!user?.data) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4">
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-lg font-medium text-yellow-900 mb-4">
            Sign in required
          </p>
          <p className="text-sm text-yellow-700 mb-4">
            You need to sign in to enter the game.
          </p>
          <button
            onClick={signIn}
            disabled={isUserLoading}
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const isLoading = isApproving || isWaitingApproval || isEntering || isWaitingEnter || isSubmitting;
  const hasAllowance = allowance && allowance >= ENTRY_FEE;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div>
          <label
            htmlFor="dunkText"
            className="block text-sm font-semibold text-gray-900 mb-2"
          >
            Your Dunk 🔥
          </label>
          <textarea
            id="dunkText"
            value={dunkText}
            onChange={(e) => setDunkText(e.target.value)}
            placeholder="Write something fire... make them laugh, make them think, or make them react! 🎯"
            rows={5}
            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none transition-all duration-200 text-base ${
              errors.dunkText ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:shadow-glow-orange"
            }`}
            disabled={isLoading}
          />
          <div className="flex items-center justify-between mt-1">
            {errors.dunkText ? (
              <p className="text-sm text-red-600">{errors.dunkText}</p>
            ) : (
              <p className="text-xs text-gray-500">Max engagement = Max chance to win!</p>
            )}
            <p className="text-xs text-gray-400">{dunkText.length} chars</p>
          </div>
        </div>

        <div>
          <label
            htmlFor="parentCastUrl"
            className="block text-sm font-semibold text-gray-900 mb-2"
          >
            Reply to Cast (Optional) 💬
          </label>
          <input
            id="parentCastUrl"
            type="url"
            value={parentCastUrl}
            onChange={(e) => setParentCastUrl(e.target.value)}
            placeholder="https://warpcast.com/username/0x..."
            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-base ${
              errors.parentCastUrl ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:shadow-glow-orange"
            }`}
            disabled={isLoading}
          />
          {errors.parentCastUrl ? (
            <p className="mt-1 text-sm text-red-600">{errors.parentCastUrl}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">Make your dunk a reply to boost visibility</p>
          )}
        </div>

        {!isConnected && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Please connect your wallet to enter the game.
            </p>
          </div>
        )}

        {step === "approve" && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              {isWaitingApproval
                ? "Waiting for approval transaction..."
                : "Approving USDC..."}
            </p>
          </div>
        )}

        {step === "pay" && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              {isWaitingEnter
                ? "Waiting for payment transaction..."
                : "Processing payment..."}
            </p>
          </div>
        )}

        {step === "submit" && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">Submitting entry...</p>
          </div>
        )}

        {errors.payment && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{errors.payment}</p>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-700 mb-2">
            Entry Fee: <span className="font-semibold">
              {isLoadingEntryFee ? "Loading..." : `${parseFloat(ENTRY_FEE.toString()) / 1e6} USDC`}
            </span>
          </p>
          {!isLoadingEntryFee && (
            <>
              <p className="text-xs text-gray-500 mb-1">
                <span className="font-medium">10% fee</span> ({((parseFloat(ENTRY_FEE.toString()) / 1e6) * 0.1).toFixed(1)} USDC) goes to platform, <span className="font-medium">90%</span> ({((parseFloat(ENTRY_FEE.toString()) / 1e6) * 0.9).toFixed(1)} USDC) goes to pot
              </p>
              <p className="text-xs text-gray-500">
                You can only enter once per day. The cast with the highest engagement wins the pot!
              </p>
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !isConnected}
          className="w-full px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-primary text-white font-bold text-base sm:text-lg rounded-xl shadow-lg hover:shadow-glow-orange active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 min-h-[48px] sm:min-h-[56px]"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              <span>
                {step === "approve"
                  ? "Approving USDC..."
                  : step === "pay"
                  ? "Processing Payment..."
                  : step === "submit"
                  ? "Submitting Entry..."
                  : "Processing..."}
              </span>
            </>
          ) : !hasAllowance ? (
            <>
              <span>🚀</span>
              <span>Approve & Enter Game</span>
            </>
          ) : (
            <>
              <span>🎯</span>
              <span>Enter Game ({isLoadingEntryFee ? "..." : `${parseFloat(ENTRY_FEE.toString()) / 1e6} USDC`})</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

