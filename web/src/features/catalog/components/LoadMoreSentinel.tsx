import { useEffect, useRef } from 'react'
import { Spinner } from '../../../shared/components/atoms/Spinner'

export interface LoadMoreSentinelProps {
  onLoadMore: () => void
  /** Number of items shown; a new value reconnects the observer. */
  visibleCount: number
}

/** Starts loading a bit before the end of the grid is visible. */
const ROOT_MARGIN = '200px'

/**
 * Lazy load for usePaginatedProducts (D07, D33). The observer reconnects
 * after every page: on wide screens 8 cards do not fill the viewport, the
 * sentinel stays visible, and an observer only fires when visibility changes.
 * A new observer always reports the current state once, so it keeps loading
 * until the sentinel leaves the viewport or there are no more pages.
 */
export function LoadMoreSentinel({ onLoadMore, visibleCount }: LoadMoreSentinelProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || typeof IntersectionObserver === 'undefined') {
      return undefined
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          onLoadMore()
        }
      },
      { rootMargin: ROOT_MARGIN },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [onLoadMore, visibleCount])

  return (
    <div
      ref={sentinelRef}
      role="status"
      className="mt-6 flex h-[72px] items-center justify-center gap-2.5 text-[14px] font-medium text-text-muted"
    >
      <Spinner size={24} />
      Cargando más productos…
    </div>
  )
}
