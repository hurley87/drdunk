import { NextRequest, NextResponse } from "next/server";
import { validateQuickAuth } from "@/lib/quick-auth";
import { supabase, supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase";
import { createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";
import { env } from "@/lib/env";

// DoctorDunk contract ABI (minimal)
const DOCTOR_DUNK_ABI = [
  {
    inputs: [{ name: "roundId", type: "uint256" }],
    name: "claimDailyReward",
    outputs: [],
    type: "function",
    stateMutability: "nonpayable",
  },
  {
    inputs: [{ name: "roundId", type: "uint256" }],
    name: "getRoundInfo",
    outputs: [
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "potAmount", type: "uint256" },
      { name: "winner", type: "address" },
      { name: "winnerCastHash", type: "string" },
      { name: "finalized", type: "bool" },
      { name: "entryCount", type: "uint256" },
    ],
    type: "function",
    stateMutability: "view",
  },
] as const;

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await validateQuickAuth(request);

    if (!authResult) {
      return NextResponse.json(
        {
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    const fid = authResult.fid;
    const body = await request.json();
    const { roundId, txHash } = body;

    if (!roundId) {
      return NextResponse.json(
        {
          error: "Round ID required",
        },
        { status: 400 }
      );
    }

    // Check if Supabase admin is configured (requires service role key for write operations)
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json(
        {
          error: "Service unavailable",
          message: "Database is not configured. Please contact support.",
        },
        { status: 503 }
      );
    }

    // Get round info from database
    const { data: round, error: roundError } = await supabase
      .from("game_rounds")
      .select("*")
      .eq("id", roundId)
      .single();

    if (roundError || !round) {
      return NextResponse.json(
        {
          error: "Round not found",
        },
        { status: 404 }
      );
    }

    // Check if already claimed (must check first since status can only be one value)
    if (round.status === "claimed") {
      return NextResponse.json(
        {
          error: "Already claimed",
          message: "Reward has already been claimed",
        },
        { status: 400 }
      );
    }

    // Check if round is finalized (required before claiming)
    if (round.status !== "finalized") {
      return NextResponse.json(
        {
          error: "Round not finalized",
          message: "Round must be finalized before claiming",
        },
        { status: 400 }
      );
    }

    // Verify user is the winner
    if (round.winner_fid !== fid) {
      return NextResponse.json(
        {
          error: "Not the winner",
          message: "Only the winner can claim the reward",
        },
        { status: 403 }
      );
    }

    // Get contract address
    const contractAddress = env.GAME_CONTRACT_ADDRESS;
    if (!contractAddress) {
      return NextResponse.json(
        {
          error: "Contract not configured",
        },
        { status: 500 }
      );
    }

    // If transaction hash is provided, verify the on-chain transaction succeeded
    // and update the database. Otherwise, just return eligibility info.
    if (txHash) {
      try {
        const chain = env.NEXT_PUBLIC_APP_ENV === "production" ? base : baseSepolia;
        const client = createPublicClient({
          chain,
          transport: http(),
        });

        // Wait for transaction receipt to confirm it succeeded
        const receipt = await client.waitForTransactionReceipt({
          hash: txHash as `0x${string}`,
        });

        if (receipt.status === "success") {
          // Verify the transaction was to the correct contract and function
          if (receipt.to?.toLowerCase() === contractAddress.toLowerCase()) {
            // Update database status only after successful on-chain transaction
            // Use supabaseAdmin to bypass RLS for write operations
            const { error: updateError } = await supabaseAdmin
              .from("game_rounds")
              .update({
                status: "claimed",
                claimed_at: new Date().toISOString(),
              })
              .eq("id", roundId);

            if (updateError) {
              throw updateError;
            }

            return NextResponse.json({
              success: true,
              message: "Reward claimed successfully",
              data: {
                roundId,
                txHash,
                blockNumber: receipt.blockNumber.toString(),
              },
            });
          } else {
            return NextResponse.json(
              {
                error: "Invalid transaction",
                message: "Transaction was not sent to the correct contract",
              },
              { status: 400 }
            );
          }
        } else {
          return NextResponse.json(
            {
              error: "Transaction failed",
              message: "The claim transaction failed on-chain",
            },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error("[game/claim] Failed to verify transaction:", error);
        return NextResponse.json(
          {
            error: "Transaction verification failed",
            message: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 }
        );
      }
    }

    // No transaction hash provided - just return eligibility info
    // Client should submit the transaction and then call this endpoint again with txHash
    return NextResponse.json({
      success: true,
      message: "You are eligible to claim. Submit the transaction and then call this endpoint again with the transaction hash.",
      data: {
        roundId,
        contractAddress,
        functionName: "claimDailyReward",
        args: [roundId],
      },
    });
  } catch (error) {
    console.error("[game/claim] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

