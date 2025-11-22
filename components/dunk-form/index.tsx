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
      setSuccessMessage("Dunk submitted successfully!");
      setCastUrl("");
      setDunkText("");
      setErrors({});
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
    },
    onError: (error: Error & { status?: number; data?: { details?: Array<{ path: string[]; message: string }> } }) => {
      console.error("Failed to submit dunk:", error);
      
      // Handle authentication errors
      if (error.status === 401) {
        setErrors({
          dunkText: "Please sign in to submit a dunk.",
        });
        return;
      }
      
      // Handle validation errors from API
      if (error.data?.details && Array.isArray(error.data.details)) {
        const fieldErrors: { castUrl?: string; dunkText?: string } = {};
        error.data.details.forEach((detail) => {
          const field = detail.path[0];
          if (field === "castUrl") {
            fieldErrors.castUrl = detail.message;
          } else if (field === "dunkText") {
            fieldErrors.dunkText = detail.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({
          dunkText: error.message || "Failed to submit dunk. Please try again.",
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    // Client-side validation
    const validationResult = dunkSchema.safeParse({
      castUrl,
      dunkText,
    });

    if (!validationResult.success) {
      const fieldErrors: { castUrl?: string; dunkText?: string } = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0] === "castUrl") {
          fieldErrors.castUrl = err.message;
        } else if (err.path[0] === "dunkText") {
          fieldErrors.dunkText = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    submitDunk({ castUrl, dunkText });
  };

  // Show sign-in prompt if user is not authenticated
  if (isUserLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      </div>
    );
  }

  if (!user?.data) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4">
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-lg font-medium text-yellow-900 mb-4">
            Sign in required
          </p>
          <p className="text-sm text-yellow-700 mb-4">
            You need to sign in to submit a dunk.
          </p>
          <button
            onClick={signIn}
            disabled={isUserLoading}
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="castUrl"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Cast URL
          </label>
          <input
            id="castUrl"
            type="url"
            value={castUrl}
            onChange={(e) => setCastUrl(e.target.value)}
            placeholder="https://warpcast.com/..."
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.castUrl
                ? "border-red-500"
                : "border-gray-300"
            }`}
            disabled={isPending}
          />
          {errors.castUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.castUrl}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="dunkText"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Dunk
          </label>
          <textarea
            id="dunkText"
            value={dunkText}
            onChange={(e) => setDunkText(e.target.value)}
            placeholder="Enter your dunk here..."
            rows={6}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
              errors.dunkText
                ? "border-red-500"
                : "border-gray-300"
            }`}
            disabled={isPending}
          />
          {errors.dunkText && (
            <p className="mt-1 text-sm text-red-600">{errors.dunkText}</p>
          )}
        </div>

        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2 min-h-[48px]"
        >
          {isPending ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              <span>Submitting...</span>
            </>
          ) : (
            "Submit Dunk"
          )}
        </button>
      </form>
    </div>
  );
}

