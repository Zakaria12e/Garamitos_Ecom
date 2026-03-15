export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse rounded-md bg-gray-100 dark:bg-gray-800 ${className}`} />
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-black animate-pulse">
      {/* image */}
      <div className="aspect-square bg-gray-100 dark:bg-gray-900" />
      <div className="p-3 space-y-2">
        {/* brand */}
        <Skeleton className="h-2.5 w-1/3" />
        {/* name */}
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        {/* rating */}
        <Skeleton className="h-2.5 w-1/4" />
        {/* price */}
        <Skeleton className="h-4 w-1/2" />
        {/* buttons */}
        <div className="flex gap-1.5 pt-1">
          <Skeleton className="h-7 flex-1 rounded" />
          <Skeleton className="h-7 w-7 rounded" />
          <Skeleton className="h-7 w-7 rounded" />
        </div>
      </div>
    </div>
  )
}
