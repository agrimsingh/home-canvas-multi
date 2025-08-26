"use client";

import React from "react";
import { PlacedProduct } from "@/lib/types";

interface GenerateButtonProps {
  placedProducts: PlacedProduct[];
  isGenerating: boolean;
  onGenerate: () => void;
  disabled?: boolean;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({
  placedProducts,
  isGenerating,
  onGenerate,
  disabled = false,
}) => {
  const canGenerate = placedProducts.length > 0 && !isGenerating && !disabled;

  if (placedProducts.length === 0) {
    return (
      <div className="text-center">
        <p className="text-zinc-500 animate-fade-in">
          Drag products from the palette onto the scene to begin.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mb-4">
        <p className="text-zinc-600">
          {placedProducts.length} product
          {placedProducts.length !== 1 ? "s" : ""} placed
        </p>
      </div>

      <button
        onClick={onGenerate}
        disabled={!canGenerate}
        className={`
          px-8 py-4 rounded-lg font-bold text-lg transition-all
          ${
            canGenerate
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
              : "bg-zinc-300 text-zinc-500 cursor-not-allowed"
          }
        `}
      >
        {isGenerating ? (
          <div className="flex items-center gap-3">
            <svg
              className="animate-spin h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Generating Scene...
          </div>
        ) : (
          `Generate Scene with ${placedProducts.length} Product${
            placedProducts.length !== 1 ? "s" : ""
          }`
        )}
      </button>

      {placedProducts.length > 0 && !isGenerating && (
        <p className="text-sm text-zinc-500 mt-3">
          Tip: You can add more products or remove existing ones before
          generating
        </p>
      )}
    </div>
  );
};

export default GenerateButton;
