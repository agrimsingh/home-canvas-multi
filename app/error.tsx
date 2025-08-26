"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center animate-fade-in bg-red-50 border border-red-200 p-8 rounded-lg max-w-2xl">
        <h2 className="text-3xl font-extrabold mb-4 text-red-800">
          Something went wrong!
        </h2>
        <p className="text-lg text-red-700 mb-6">
          {error.message || "An unexpected error occurred"}
        </p>
        <button
          onClick={reset}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
