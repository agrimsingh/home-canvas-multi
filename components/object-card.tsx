"use client";

import React, { memo } from "react";
import { Product } from "@/lib/types";
import OptimizedImage from "./optimized-image";

interface ObjectCardProps {
  product: Product;
  isSelected: boolean;
  onClick?: () => void;
}

const ObjectCard: React.FC<ObjectCardProps> = memo(
  ({ product, isSelected, onClick }) => {
    const cardClasses = `
        bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300
        ${onClick ? "cursor-pointer hover:shadow-xl hover:scale-105" : ""}
        ${
          isSelected
            ? "border-2 border-blue-500 shadow-xl scale-105"
            : "border border-zinc-200"
        }
    `;

    return (
      <div className={cardClasses} onClick={onClick}>
        <div className="aspect-square w-full bg-zinc-100 flex items-center justify-center relative">
          <OptimizedImage
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full"
            fill
            objectFit="contain"
          />
        </div>
        <div className="p-3 text-center">
          <h4 className="text-sm font-semibold text-zinc-700 truncate">
            {product.name}
          </h4>
        </div>
      </div>
    );
  }
);

ObjectCard.displayName = "ObjectCard";

export default ObjectCard;
