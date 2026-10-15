/** Same layout as ProductCard; pulses the opacity, as on mobile (D31). */
export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col overflow-hidden rounded-lg bg-surface shadow-card">
      <div className="h-[220px] animate-pulse bg-skeleton motion-reduce:animate-none" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-5 w-24 animate-pulse rounded-full bg-skeleton motion-reduce:animate-none" />
        <div className="h-4 w-full animate-pulse rounded-sm bg-skeleton motion-reduce:animate-none" />
        <div className="h-4 w-2/3 animate-pulse rounded-sm bg-skeleton motion-reduce:animate-none" />
        <div className="mt-1 h-7 w-24 animate-pulse rounded-sm bg-skeleton motion-reduce:animate-none" />
        <div className="mt-1 flex gap-2">
          <div className="h-11 flex-1 animate-pulse rounded-md bg-skeleton motion-reduce:animate-none" />
          <div className="h-11 flex-1 animate-pulse rounded-md bg-skeleton motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  )
}
