"use client";

import React from "react";
import { Product } from "@/lib/types";
import ObjectCard from "./object-card";

interface ProductPaletteProps {
  products: Product[];
  onProductDragStart: (product: Product | null) => void;
  onAddProduct: () => void;
}

// Create transparent drag image once
let transparentCanvas: HTMLCanvasElement | null = null;
if (typeof window !== "undefined") {
  transparentCanvas = document.createElement("canvas");
  transparentCanvas.width = 1;
  transparentCanvas.height = 1;
  const ctx = transparentCanvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, 1, 1);
  }
}

const ProductPalette: React.FC<ProductPaletteProps> = ({
  products,
  onProductDragStart,
  onAddProduct,
}) => {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-extrabold text-center mb-5 text-zinc-800">
        Product Palette
      </h2>

      {products.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <button
              onClick={onAddProduct}
              className="w-full aspect-square bg-zinc-100 border-2 border-dashed border-zinc-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all p-8"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-zinc-500 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <p className="text-zinc-500 font-medium">Add Product</p>
              <span className="sr-only">
                Click to add a new product to the palette
              </span>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  draggable="true"
                  onDragStart={(e) => {
                    onProductDragStart(product);
                    e.dataTransfer.effectAllowed = "copy";

                    // Use pre-created transparent canvas
                    if (transparentCanvas) {
                      e.dataTransfer.setDragImage(transparentCanvas, 0, 0);
                    }
                  }}
                  onDragEnd={() => {
                    // Clear dragged product when drag operation ends
                    setTimeout(() => onProductDragStart(null), 100);
                  }}
                  className="cursor-move"
                >
                  <ObjectCard product={product} isSelected={false} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-200">
            <button
              onClick={onAddProduct}
              className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold py-3 px-4 rounded-lg transition-colors border border-zinc-300"
            >
              + Add Another Product
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductPalette;
