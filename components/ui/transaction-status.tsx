"use client";

import { Check, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type TransactionStep = 
  | "idle" 
  | "approving" 
  | "approved" 
  | "paying" 
  | "confirmed" 
  | "confirming" 
  | "success" 
  | "error";

interface TransactionStatusProps {
  step: TransactionStep;
  txHash?: string;
  className?: string;
}

const STEPS = [
  { key: "approving", label: "Approve USDC" },
  { key: "paying", label: "Send Payment" },
  { key: "confirming", label: "Confirm Entry" },
] as const;

function isStepComplete(currentStep: TransactionStep, stepKey: string): boolean {
  const stepOrder: Record<string, number> = {
    idle: 0,
    approving: 1,
    approved: 2,
    paying: 2,
    confirmed: 3,
    confirming: 3,
    success: 4,
  };

  const stepKeyOrder: Record<string, number> = {
    approving: 1,
    paying: 2,
    confirming: 3,
  };

  return stepOrder[currentStep] > stepKeyOrder[stepKey];
}

function isStepActive(currentStep: TransactionStep, stepKey: string): boolean {
  const activeMap: Record<string, string[]> = {
    approving: ["approving"],
    approved: ["paying"],
    paying: ["paying"],
    confirmed: ["confirming"],
    confirming: ["confirming"],
  };

  return activeMap[currentStep]?.includes(stepKey) || false;
}

export function TransactionStatus({ step, txHash, className }: TransactionStatusProps) {
  if (step === "idle") return null;

  return (
    <div className={cn("rounded-lg border border-gray-200 bg-gray-50 p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        {STEPS.map((s, i) => {
          const isComplete = isStepComplete(step, s.key);
          const isActive = isStepActive(step, s.key);

          return (
            <div key={s.key} className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 transition-colors",
                  isComplete && "bg-green-500 text-white",
                  isActive && "bg-primary-500 text-white",
                  !isComplete && !isActive && "bg-gray-200 text-gray-500"
                )}
              >
                {isComplete ? (
                  <Check className="w-3 h-3" />
                ) : isActive ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  "text-xs whitespace-nowrap",
                  isComplete && "text-green-700 font-medium",
                  isActive && "text-primary-700 font-medium",
                  !isComplete && !isActive && "text-gray-500"
                )}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-px flex-1 mx-2",
                    isComplete ? "bg-green-300" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {txHash && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <a
            href={`https://basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 transition-colors"
          >
            <span>View on BaseScan</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}

