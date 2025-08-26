"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { Product } from "@/lib/types";
import ObjectCard from "./object-card";

interface ProductSelectorProps {
  products: Product[];
  onSelect: (product: Product) => void;
  onAddOwnProductClick: () => void;
}

const ArrowLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  onSelect,
  onAddOwnProductClick,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) {
      const atStart = el.scrollLeft < 10;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
      setCanScrollLeft(!atStart);
      setCanScrollRight(!atEnd);
    }
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    // Initial check
    checkScrollButtons();

    // Handle case where items don't fill the container
    if (el.scrollWidth <= el.clientWidth) {
      setCanScrollRight(false);
    }

    el.addEventListener("scroll", checkScrollButtons);
    window.addEventListener("resize", checkScrollButtons);
    return () => {
      el.removeEventListener("scroll", checkScrollButtons);
      window.removeEventListener("resize", checkScrollButtons);
    };
  }, [products, checkScrollButtons]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto text-center animate-fade-in">
      <div className="relative flex items-center">
        <button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className="absolute -left-4 z-10 p-2 bg-white rounded-full shadow-md hover:bg-zinc-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Scroll left"
        >
          <ArrowLeftIcon />
        </button>
        <div
          ref={scrollContainerRef}
          className="flex space-x-6 overflow-x-auto snap-x snap-mandatory py-4 scrollbar-hide"
        >
          {products.map((product) => (
            <div key={product.id} className="snap-center shrink-0 w-52 md:w-64">
              <ObjectCard
                product={product}
                isSelected={false}
                onClick={() => onSelect(product)}
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className="absolute -right-4 z-10 p-2 bg-white rounded-full shadow-md hover:bg-zinc-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Scroll right"
        >
          <ArrowRightIcon />
        </button>
      </div>
      <div className="mt-8">
        <button
          onClick={onAddOwnProductClick}
          className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold py-2 px-6 rounded-lg text-md transition-colors border border-zinc-300 shadow-sm"
        >
          Add Your Own Product!
        </button>
      </div>
    </div>
  );
};

export default ProductSelector;
