export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse space-y-4">
          {/* Header skeleton */}
          <div className="h-20 bg-zinc-200 rounded-lg w-96 mx-auto"></div>
          <div className="h-6 bg-zinc-200 rounded w-64 mx-auto"></div>

          {/* Content skeleton */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <div className="lg:col-span-1">
              <div className="h-96 bg-zinc-100 rounded-lg"></div>
            </div>
            <div className="lg:col-span-3">
              <div className="aspect-video bg-zinc-100 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
