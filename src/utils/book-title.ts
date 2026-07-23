import { BOOKS } from '@/data/static/books'

const titleCache = new Map<string, string>()

export function bookIdToTitle(id: string): string {
  const cached = titleCache.get(id)
  if (cached) return cached

  const book = BOOKS.find((b) => b.id === id)
  const title = book?.title ?? id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  titleCache.set(id, title)
  return title
}

export function bookIdsToTitles(ids: string[]): string[] {
  return ids.map(bookIdToTitle)
}
