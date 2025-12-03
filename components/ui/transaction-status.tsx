"use client";

import { Check, Loader2, ExternalLink, AlertCircle, Wallet, FileCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type TransactionStep = "idle" | "approving" | "approved" | "paying" | "confirming" | "confirmed" | "success" | "error";

interface TransactionStatusProps {
  step: TransactionStep;
  txHash?: string;
  error?: string;
}

const steps = [
  { key: "approving", label: "APPROVING USDC", icon: Wallet },
  { key: "paying", label: "ENTERING GAME", icon: Zap },
  { key: "confirming", label: "CONFIRMING", icon: FileCheck },
];

export function TransactionStatus({ step, txHash, error }: TransactionStatusProps) {
  if (step === "idle") return null;

  const getStepIndex = () => {
    switch (step) {
      case "approving":
      case "approved":
        return 0;
      case "paying":
      case "confirmed":
        return 1;
      case "confirming":
      case "success":
        return 2;
      default:
        return -1;
    }
  };

  const currentStepIndex = getStepIndex();
  const isComplete = step === "success";
  const hasError = step === "error";

  return (
    <div
      className={cn(
        "p-4 border-3 border-black shadow-brutal transform -rotate-1",
        isComplete 
          ? "bg-black text-white" 
          : hasError
          ? "bg-red-500 text-white"
          : "bg-white text-black"
      )}
    >
      {/* Progress Steps - Brutalist */}
      <div className="flex items-center justify-between mb-4">
        {steps.map((s, index) => {
          const Icon = s.icon;
          const isPast = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div key={s.key} className="flex items-center flex-1">
              <div
                className={cn(
                  "w-12 h-12 border-3 border-black flex items-center justify-center transform",
                  isPast || isComplete 
                    ? "bg-black text-white rotate-3" 
                    : isCurrent 
                    ? "bg-red-500 text-white -rotate-3 animate-brutal-pulse" 
                    : "bg-white text-black/30 rotate-1"
                )}
              >
                {isPast || isComplete ? (
                  <Check className="w-6 h-6" />
                ) : isCurrent ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}
              </div>

              {/* Connector line - Brutalist */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2 bg-black/20">
                  <div
                    className={cn(
                      "h-full transition-all duration-300",
                      isPast || (isCurrent && step.includes("ed")) 
                        ? "bg-black w-full" 
                        : "bg-transparent w-0"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Status Text - Brutalist */}
      <div className="text-center">
        <p
          className={cn(
            "font-brutal text-xl uppercase tracking-wider",
            isComplete ? "text-white" : hasError ? "text-white" : "text-black"
          )}
        >
          {isComplete && "TRANSACTION COMPLETE!"}
          {hasError && "TRANSACTION FAILED"}
          {step === "approving" && "WAITING FOR USDC APPROVAL..."}
          {step === "approved" && "USDC APPROVED! PROCESSING..."}
          {step === "paying" && "PROCESSING GAME ENTRY..."}
          {step === "confirming" && "CONFIRMING ON BLOCKCHAIN..."}
          {step === "confirmed" && "PAYMENT CONFIRMED!"}
        </p>

        {txHash && (
          <a
            href={`https://basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-1 mt-3 font-mono text-xs uppercase tracking-wider transition-colors",
              isComplete 
                ? "text-white/60 hover:text-white" 
                : "text-black/60 hover:text-red-500"
            )}
          >
            VIEW TRANSACTION <ExternalLink className="w-3 h-3" />
          </a>
        )}

        {error && (
          <div className="flex items-center justify-center gap-2 mt-3 font-mono text-xs text-white uppercase tracking-wide">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
