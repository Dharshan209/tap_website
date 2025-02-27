import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

const GoogleSignIn = ({ onSuccess, onError, buttonText = "Sign in with Google" }) => {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const user = await signInWithGoogle();
      console.log("Google sign-in successful", user);

      // Add a small delay to ensure Firebase auth state has updated
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(user);
        } else {
          // Default navigation if no success handler provided
          window.location.href = "/";
        }
      }, 500);
    } catch (error) {
      console.error("Google sign-in failed:", error);
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 dark:bg-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-md py-2 px-4 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      type="button"
    >
      {/* Google Logo */}
      <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
        <g transform="matrix(1, 0, 0, 1, 0, 0)">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </g>
      </svg>
      {isLoading ? "Signing in..." : buttonText}
    </button>
  );
};

export default GoogleSignIn;
