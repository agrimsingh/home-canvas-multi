import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-zinc-200", className)}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-zinc-200">
      <Skeleton className="aspect-square w-full" />
      <div className="p-3">
        <Skeleton className="h-4 w-3/4 mx-auto" />
      </div>
    </div>
  );
}

export function SkeletonProductPalette() {
  return (
    <div className="flex flex-col h-full">
      <Skeleton className="h-8 w-48 mx-auto mb-5" />
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonScene() {
  return (
    <div className="flex flex-col">
      <Skeleton className="h-8 w-24 mx-auto mb-5" />
      <Skeleton className="aspect-video w-full rounded-lg" />
    </div>
  );
}
