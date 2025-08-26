"use client";

import React from "react";
import { PlacedProduct } from "@/lib/types";
import OptimizedImage from "./optimized-image";

interface PlacementOverlayProps {
  placedProducts: PlacedProduct[];
  onRemoveProduct: (placementId: string) => void;
  isGenerating?: boolean;
}

const PlacementOverlay: React.FC<PlacementOverlayProps> = ({
  placedProducts,
  onRemoveProduct,
  isGenerating = false,
}) => {
  if (placedProducts.length === 0) {
    return null;
  }

  return (
    <>
      {placedProducts.map((placedProduct, index) => (
        <div
          key={placedProduct.id}
          className="absolute pointer-events-none z-20"
          style={{
            left: placedProduct.position.x,
            top: placedProduct.position.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Product thumbnail */}
          <div className="relative">
            <div className="w-16 h-16 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border-2 border-blue-500 p-1 flex items-center justify-center relative overflow-hidden">
              <OptimizedImage
                src={placedProduct.product.imageUrl}
                alt={placedProduct.product.name}
                className="w-full h-full"
                fill
                objectFit="contain"
                onError={() => {
                  console.warn(
                    "Image failed to load:",
                    placedProduct.product.imageUrl
                  );
                }}
              />
            </div>

            {/* Product number badge */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
              {index + 1}
            </div>

            {/* Remove button */}
            {!isGenerating && (
              <button
                onClick={() => onRemoveProduct(placedProduct.id)}
                className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center pointer-events-auto transition-colors shadow-md z-30"
                aria-label="Remove product"
              >
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Product name label - positioned below thumbnail */}
          <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 text-xs text-center bg-black/80 text-white px-2 py-1 rounded whitespace-nowrap shadow-lg">
            {placedProduct.product.name.length > 12
              ? `${placedProduct.product.name.substring(0, 12)}...`
              : placedProduct.product.name}
          </div>
        </div>
      ))}
    </>
  );
};

export default PlacementOverlay;
