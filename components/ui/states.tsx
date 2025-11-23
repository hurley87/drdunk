"use client";

import { useUser } from "@/contexts/user-context";
import { Loader2 } from "lucide-react";

/**
 * Loading fallback component for pages that require authentication
 */
export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-orange-600 mx-auto" />
        <p className="text-gray-600">Loading...</p>
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
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center mx-auto">
          <span className="text-4xl">🔐</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600">
            Please sign in to access this feature and start dunking!
          </p>
        </div>
        <button
          onClick={signIn}
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign In with Farcaster</span>
          )}
        </button>
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
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <span className="text-4xl">⚠️</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">{message}</p>
        </div>
        {onRetry && (
          <button onClick={onRetry} className="btn-secondary mx-auto">
            Try Again
          </button>
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
    <div className="p-12 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
        <span className="text-3xl">{icon}</span>
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary mx-auto">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

