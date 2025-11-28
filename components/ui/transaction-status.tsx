"use client";

import { motion } from "framer-motion";
import { Check, Loader2, ExternalLink, AlertCircle, Wallet, FileCheck, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

type TransactionStep = "idle" | "approving" | "approved" | "paying" | "confirming" | "confirmed" | "success" | "error";

interface TransactionStatusProps {
  step: TransactionStep;
  txHash?: string;
  error?: string;
}

const steps = [
  { key: "approving", label: "Approving USDC", icon: Wallet },
  { key: "paying", label: "Entering Game", icon: Rocket },
  { key: "confirming", label: "Confirming", icon: FileCheck },
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl p-4 border",
        isComplete 
          ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200" 
          : hasError
          ? "bg-gradient-to-br from-red-50 to-rose-50 border-red-200"
          : "bg-gradient-to-br from-primary-50 to-amber-50 border-primary-200"
      )}
    >
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-4">
        {steps.map((s, index) => {
          const Icon = s.icon;
          const isPast = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isFuture = index > currentStepIndex;

          return (
            <div key={s.key} className="flex items-center flex-1">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ 
                  scale: isCurrent ? 1.1 : 1,
                  backgroundColor: isPast || isComplete 
                    ? "rgb(34 197 94)" 
                    : isCurrent 
                    ? "rgb(249 115 22)" 
                    : "rgb(229 231 235)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center relative",
                  (isPast || isComplete) && "shadow-lg shadow-green-500/30",
                  isCurrent && "shadow-lg shadow-primary-500/30"
                )}
              >
                {isPast || isComplete ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                ) : isCurrent ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  >
                    <Loader2 className="w-5 h-5 text-white" />
                  </motion.div>
                ) : (
                  <Icon className="w-5 h-5 text-gray-400" />
                )}

                {/* Pulse effect for current step */}
                {isCurrent && (
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 rounded-full bg-primary-500"
                  />
                )}
              </motion.div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2 rounded-full overflow-hidden bg-gray-200">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ 
                      width: isPast || (isCurrent && step.includes("ed")) ? "100%" : "0%"
                    }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-green-500 to-primary-500"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Status Text */}
      <div className="text-center">
        <motion.p
          key={step}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "text-sm font-medium",
            isComplete ? "text-green-700" : hasError ? "text-red-700" : "text-primary-700"
          )}
        >
          {isComplete && "🎉 Transaction Complete!"}
          {hasError && "❌ Transaction Failed"}
          {step === "approving" && "Waiting for USDC approval..."}
          {step === "approved" && "USDC approved! Processing payment..."}
          {step === "paying" && "Processing game entry..."}
          {step === "confirming" && "Confirming on blockchain..."}
          {step === "confirmed" && "Payment confirmed!"}
        </motion.p>

        {txHash && (
          <motion.a
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            href={`https://basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-xs text-gray-500 hover:text-primary-600 transition-colors"
          >
            View transaction <ExternalLink className="w-3 h-3" />
          </motion.a>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-1 mt-2 text-xs text-red-600"
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
