import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { validateQuickAuth } from "@/lib/quick-auth";

const dunkSchema = z.object({
  castUrl: z.string().url("Invalid cast URL format"),
  dunkText: z.string().min(1, "Dunk text cannot be empty"),
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await validateQuickAuth(request);

    if (!authResult) {
      return NextResponse.json(
        {
          error: "Authentication required",
          message: "You must be signed in to submit a dunk",
        },
        { status: 401 }
      );
    }

    const fid = authResult.fid;

    const body = await request.json();
    
    // Validate input
    const validationResult = dunkSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { castUrl, dunkText } = validationResult.data;

    // Insert into Supabase
    const { data, error } = await supabase
      .from("dunks")
      .insert({
        fid,
        cast_url: castUrl,
        dunk_text: dunkText,
      })
      .select()
      .single();

    if (error) {
      console.error("[dunks] Supabase error:", error);
      return NextResponse.json(
        {
          error: "Failed to save dunk",
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[dunks] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

