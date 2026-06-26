import { useMemo } from 'react'

export function useTextFilter<T>(items: T[], query: string, keys: (keyof T)[]): T[] {
  return useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return items
    return items.filter((item) => keys.some((key) => String(item[key]).toLowerCase().includes(q)))
  }, [items, query, keys])
}
