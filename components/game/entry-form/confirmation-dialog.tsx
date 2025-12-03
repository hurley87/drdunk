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
import { AlertCircle, ExternalLink, Loader2, Coins, Zap, Shield } from "lucide-react";
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
      <DialogContent className="max-w-sm mx-4">
        <DialogHeader className="relative">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-500 border-3 border-black shadow-brutal flex items-center justify-center transform -rotate-6">
            <Coins className="w-8 h-8 text-white" />
          </div>
          
          <DialogTitle className="text-center">
            CONFIRM ENTRY
          </DialogTitle>
          <DialogDescription className="text-center">
            REVIEW THE TRANSACTION DETAILS BEFORE PROCEEDING
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Entry Fee Breakdown - Brutalist */}
          <div className="space-y-3 p-4 bg-white border-3 border-black shadow-brutal-sm">
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs text-black/60 uppercase tracking-wider">ENTRY FEE</span>
              <span className="font-brutal text-2xl text-black">{entryFee} USDC</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs text-black/40 uppercase tracking-wider">PLATFORM FEE (10%)</span>
              <span className="font-mono text-sm text-black/60">-{platformFee} USDC</span>
            </div>
            <div className="border-t-3 border-dashed border-black pt-3 flex justify-between items-center">
              <span className="font-mono text-xs text-black uppercase tracking-wider">TO PRIZE POOL</span>
              <span className="font-brutal text-2xl text-red-500">{toPrizePool} USDC</span>
            </div>
          </div>

          {/* Contract Address - Brutalist */}
          {contractAddress && (
            <div className="flex items-center gap-3 p-3 bg-black text-white border-3 border-black">
              <Shield className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[10px] text-white/60 uppercase tracking-wider">SENDING TO CONTRACT</p>
                <code className="font-mono text-xs text-white">
                  {truncateAddress(contractAddress)}
                </code>
              </div>
              <a
                href={`https://basescan.org/address/${contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border-2 border-white text-white hover:bg-white hover:text-black transition-colors duration-75"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Warning - Brutalist */}
          <div className="flex items-start gap-3 bg-red-500 text-white border-3 border-black p-3 transform -rotate-1">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="font-mono text-xs uppercase tracking-wide">
              THIS TRANSACTION IS IRREVERSIBLE. YOU WILL NEED TO APPROVE USDC SPENDING FIRST.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => { playClick(); onOpenChange(false); }}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            CANCEL
          </Button>
          <Button
            onClick={() => { playClick(); onConfirm(); }}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span>PROCESSING...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                <span>CONFIRM & PAY</span>
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
