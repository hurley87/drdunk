"use client";

import { useState } from "react";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useUser } from "@/contexts/user-context";
import { z } from "zod";

const dunkSchema = z.object({
  castUrl: z.string().url("Invalid cast URL format"),
  dunkText: z.string().min(1, "Dunk text cannot be empty"),
});

interface DunkFormData {
  castUrl: string;
  dunkText: string;
}

interface DunkResponse {
  success: boolean;
  data?: {
    id: string;
    cast_url: string;
    dunk_text: string;
    created_at: string;
  };
  error?: string;
  details?: Array<{ path: string[]; message: string }>;
}

export default function DunkForm() {
  const { user, isLoading: isUserLoading, signIn } = useUser();
  const [castUrl, setCastUrl] = useState("");
  const [dunkText, setDunkText] = useState("");
  const [errors, setErrors] = useState<{
    castUrl?: string;
    dunkText?: string;
  }>({});
  const [successMessage, setSuccessMessage] = useState("");

  const { mutate: submitDunk, isPending } = useApiMutation<
    DunkResponse,
    DunkFormData
  >({
    url: "/api/dunks",
    method: "POST",
    isProtected: true,
    body: (variables) => variables,
    onSuccess: (data) => {
      setSuccessMessage("DUNK SUBMITTED!");
      setCastUrl("");
      setDunkText("");
      setErrors({});
      setTimeout(() => setSuccessMessage(""), 5000);
    },
    onError: (error: Error & { status?: number; data?: { details?: Array<{ path: string[]; message: string }> } }) => {
      console.error("Failed to submit dunk:", error);
      
      if (error.status === 401) {
        setErrors({
          dunkText: "SIGN IN REQUIRED",
        });
        return;
      }
      
      if (error.data?.details && Array.isArray(error.data.details)) {
        const fieldErrors: { castUrl?: string; dunkText?: string } = {};
        error.data.details.forEach((detail) => {
          const field = detail.path[0];
          if (field === "castUrl") {
            fieldErrors.castUrl = detail.message.toUpperCase();
          } else if (field === "dunkText") {
            fieldErrors.dunkText = detail.message.toUpperCase();
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({
          dunkText: (error.message || "SUBMISSION FAILED").toUpperCase(),
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    const validationResult = dunkSchema.safeParse({
      castUrl,
      dunkText,
    });

    if (!validationResult.success) {
      const fieldErrors: { castUrl?: string; dunkText?: string } = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0] === "castUrl") {
          fieldErrors.castUrl = err.message.toUpperCase();
        } else if (err.path[0] === "dunkText") {
          fieldErrors.dunkText = err.message.toUpperCase();
        }
      });
      setErrors(fieldErrors);
      return;
    }

    submitDunk({ castUrl, dunkText });
  };

  // Loading state
  if (isUserLoading) {
    return (
      <div className="w-full">
        <div className="bg-white border-3 border-black shadow-brutal p-8 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-black border-t-red-500 animate-spin" />
        </div>
      </div>
    );
  }

  // Sign in prompt
  if (!user?.data) {
    return (
      <div className="w-full">
        <div className="bg-white border-3 border-black shadow-brutal text-center">
          <div className="p-6 border-b-3 border-black bg-stripes">
            <p className="font-brutal text-2xl uppercase">SIGN IN REQUIRED</p>
            <p className="font-mono text-sm text-black/60 mt-2 uppercase">
              You need to sign in to submit a dunk
            </p>
          </div>
          <div className="p-6">
            <button
              onClick={signIn}
              disabled={isUserLoading}
              className="w-full bg-red-500 text-white border-3 border-black shadow-brutal px-6 py-4 font-mono font-bold uppercase tracking-wider hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-100 disabled:opacity-50"
            >
              SIGN IN
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cast URL Field */}
        <div className="bg-white border-3 border-black shadow-brutal">
          <label
            htmlFor="castUrl"
            className="block font-mono text-xs uppercase tracking-widest p-3 border-b-3 border-black bg-black text-white"
          >
            CAST URL
          </label>
          <input
            id="castUrl"
            type="url"
            value={castUrl}
            onChange={(e) => setCastUrl(e.target.value)}
            placeholder="HTTPS://WARPCAST.COM/..."
            className={`w-full px-4 py-4 font-mono text-sm bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-black/30 uppercase ${
              errors.castUrl ? "bg-red-50" : ""
            }`}
            disabled={isPending}
          />
          {errors.castUrl && (
            <div className="px-4 py-2 bg-red-500 text-white font-mono text-xs uppercase">
              {errors.castUrl}
            </div>
          )}
        </div>

        {/* Dunk Text Field */}
        <div className="bg-white border-3 border-black shadow-brutal rotate-[0.3deg]">
          <label
            htmlFor="dunkText"
            className="block font-mono text-xs uppercase tracking-widest p-3 border-b-3 border-black bg-red-500 text-white"
          >
            YOUR DUNK
          </label>
          <textarea
            id="dunkText"
            value={dunkText}
            onChange={(e) => setDunkText(e.target.value)}
            placeholder="ENTER YOUR SPICIEST TAKE..."
            rows={5}
            className={`w-full px-4 py-4 font-mono text-sm bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-black/30 resize-none ${
              errors.dunkText ? "bg-red-50" : ""
            }`}
            disabled={isPending}
          />
          {errors.dunkText && (
            <div className="px-4 py-2 bg-red-500 text-white font-mono text-xs uppercase">
              {errors.dunkText}
            </div>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-black text-white border-3 border-black p-4 -rotate-1">
            <p className="font-brutal text-xl uppercase text-center">{successMessage}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-black text-white border-3 border-black shadow-brutal-lg px-6 py-5 font-brutal text-2xl uppercase hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-xl active:translate-x-0 active:translate-y-0 active:shadow-brutal transition-all duration-100 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isPending ? (
            <>
              <div className="w-6 h-6 border-3 border-white border-t-transparent animate-spin" />
              <span>SUBMITTING...</span>
            </>
          ) : (
            "SUBMIT DUNK"
          )}
        </button>
      </form>
    </div>
  );
}
