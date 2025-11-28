"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, ExternalLink, Loader2, Coins, Rocket, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameSounds } from "@/hooks/use-game-sounds";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  entryFee: string;
  platformFee: string;
  toPrizePool: string;
  contractAddress?: string;
  isLoading?: boolean;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  entryFee,
  platformFee,
  toPrizePool,
  contractAddress,
  isLoading = false,
}: ConfirmationDialogProps) {
  const { playClick } = useGameSounds();
  
  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-4 rounded-2xl border-0 shadow-2xl overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-amber-50 -z-10" />
        
        <DialogHeader className="relative">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-amber-500 flex items-center justify-center shadow-lg shadow-primary-500/30"
          >
            <Coins className="w-8 h-8 text-white" />
          </motion.div>
          
          <DialogTitle className="text-xl font-bold text-center text-gray-900">
            Confirm Entry
          </DialogTitle>
          <DialogDescription className="text-sm text-center text-gray-500">
            Review the transaction details before proceeding
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 py-4"
        >
          {/* Entry Fee Breakdown */}
          <div className="space-y-3 p-4 rounded-xl bg-white/80 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Entry Fee</span>
              <span className="text-lg font-bold text-gray-900">{entryFee} USDC</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Platform Fee (10%)</span>
              <span className="font-medium text-gray-500">-{platformFee} USDC</span>
            </div>
            <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">To Prize Pool</span>
              <motion.span
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-lg font-bold text-primary-600"
              >
                {toPrizePool} USDC
              </motion.span>
            </div>
          </div>

          {/* Contract Address */}
          {contractAddress && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100"
            >
              <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400">Sending to contract</p>
                <code className="text-xs font-mono text-gray-600">
                  {truncateAddress(contractAddress)}
                </code>
              </div>
              <a
                href={`https://basescan.org/address/${contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          )}

          {/* Warning */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3"
          >
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              This transaction is irreversible. You will need to approve USDC spending first.
            </p>
          </motion.div>
        </motion.div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => { playClick(); onOpenChange(false); }}
              disabled={isLoading}
              className="w-full rounded-xl"
            >
              Cancel
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
            <Button
              onClick={() => { playClick(); onConfirm(); }}
              disabled={isLoading}
              className="w-full btn-game rounded-xl"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center"
                  >
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span>Processing...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center"
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    <span>Confirm & Pay</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
