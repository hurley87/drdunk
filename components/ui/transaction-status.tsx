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

  // A step is complete if we've moved past it
  // "approved" means approving is complete
  // "confirmed" means paying is complete
  // "confirming" or "success" means confirming is complete
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

  // A step is active only if it's explicitly in the active map
  // and we haven't moved past it (checked in the component)
  return activeMap[currentStep]?.includes(stepKey) || false;
}

export function TransactionStatus({ step, txHash, className }: TransactionStatusProps) {
  if (step === "idle") return null;

  return (
    <div className={cn("rounded-lg border border-gray-200 bg-gray-50 p-4", className)}>
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {STEPS.map((s, i) => {
          const isComplete = isStepComplete(step, s.key);
          const isActive = isStepActive(step, s.key);
          // Prevent conflicting states: if step is complete, it shouldn't be active
          const showActive = isActive && !isComplete;

          return (
            <div key={s.key} className="flex items-center gap-2 flex-shrink-0 min-w-0">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 transition-colors",
                  isComplete && "bg-green-500 text-white",
                  showActive && "bg-primary-500 text-white",
                  !isComplete && !showActive && "bg-gray-200 text-gray-500"
                )}
              >
                {isComplete ? (
                  <Check className="w-3 h-3" />
                ) : showActive ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  "text-xs whitespace-nowrap truncate max-w-[100px]",
                  isComplete && "text-green-700 font-medium",
                  showActive && "text-primary-700 font-medium",
                  !isComplete && !showActive && "text-gray-500"
                )}
                title={s.label}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-px w-8 flex-shrink-0",
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





