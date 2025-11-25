"use client";

import { useUser } from "@/contexts/user-context";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Loading fallback component for pages that require authentication
 */
export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Sign-in prompt component
 */
export function SignInPrompt() {
  const { signIn, isLoading } = useUser();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔐</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Sign In Required</h2>
        <p className="text-sm text-gray-500 mb-6">
          Please sign in to access this feature.
        </p>
        <Button
          onClick={signIn}
          disabled={isLoading}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign In with Farcaster</span>
          )}
        </Button>
      </div>
    </div>
  );
}

/**
 * Error state component
 */
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "Please try again later.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="min-h-[40vh] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Empty state component
 */
interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = "📭",
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-lg">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
        <span className="text-xl">{icon}</span>
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-1">{title}</h3>
      {message && <p className="text-xs text-gray-500 mb-4">{message}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-primary-500 hover:bg-primary-600 text-white">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
