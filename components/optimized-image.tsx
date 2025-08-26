"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  onLoad?: () => void;
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  className,
  priority = false,
  fill = false,
  width,
  height,
  objectFit = "contain",
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Handle blob URLs and data URLs
  const isOptimizable =
    src && !src.startsWith("blob:") && !src.startsWith("data:");

  if (!isOptimizable || hasError) {
    // Fallback to regular img tag for blob URLs or errors
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onLoad={onLoad}
        onError={() => {
          setHasError(true);
          onError?.();
        }}
        style={{ objectFit }}
      />
    );
  }

  return (
    <div className={cn("relative", fill && "w-full h-full", className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-zinc-100 animate-pulse rounded-lg" />
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        style={{ objectFit }}
        priority={priority}
        onLoad={() => {
          setIsLoading(false);
          onLoad?.();
        }}
        onError={() => {
          setHasError(true);
          onError?.();
        }}
        sizes={
          fill
            ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            : undefined
        }
      />
    </div>
  );
}
