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
import { AlertCircle, ExternalLink, Loader2 } from "lucide-react";

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
  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-4 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Confirm Entry
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Review the transaction details before proceeding
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Entry Fee Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Entry Fee</span>
              <span className="font-medium text-gray-900">{entryFee} USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Platform Fee (10%)</span>
              <span className="font-medium text-gray-600">{platformFee} USDC</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between text-sm">
              <span className="text-gray-500">To Prize Pool</span>
              <span className="font-semibold text-primary-600">{toPrizePool} USDC</span>
            </div>
          </div>

          {/* Contract Address */}
          {contractAddress && (
            <div className="bg-gray-50 rounded-lg p-3 space-y-1">
              <p className="text-xs text-gray-500">Sending to contract</p>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono text-gray-700">
                  {truncateAddress(contractAddress)}
                </code>
                <a
                  href={`https://basescan.org/address/${contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              This transaction is irreversible. You will need to approve USDC spending first.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Confirm & Pay</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}




