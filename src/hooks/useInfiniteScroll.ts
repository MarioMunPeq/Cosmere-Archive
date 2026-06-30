import { useRef, useCallback, useState, useEffect } from 'react'
import { INFINITE_SCROLL_MARGIN, DEFAULT_PAGE_SIZE } from '@/constants'

const HAS_IO = typeof IntersectionObserver !== 'undefined'

export function useInfiniteScroll(items: unknown[], pageSize = DEFAULT_PAGE_SIZE) {
  const [visibleCount, setVisibleCount] = useState(HAS_IO ? pageSize : items.length)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const hasMore = HAS_IO && visibleCount < items.length

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisibleCount(HAS_IO ? pageSize : items.length)
  }, [items.length, pageSize])

  useEffect(() => {
    if (!HAS_IO) return
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + pageSize, items.length))
        }
      },
      { rootMargin: INFINITE_SCROLL_MARGIN },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, items.length, pageSize])

  const reset = useCallback(() => {
    if (HAS_IO) setVisibleCount(pageSize)
  }, [pageSize])

  return { visibleCount, hasMore, sentinelRef, reset }
}
