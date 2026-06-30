import { useState, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { ALL_CHARACTERS, BOOKS } from '@/data/static'
import type { Character } from '@/types'

const SPOILER_KEY = 'cosmere-spoiler-mode'
const READ_BOOKS_KEY = 'cosmere-read-books'

export function useSpoilerMode() {
  const [enabled, setEnabled] = useLocalStorage(SPOILER_KEY, false)
  const [readBooks, setReadBooks] = useLocalStorage<string[]>(READ_BOOKS_KEY, [])
  const [panelOpen, setPanelOpen] = useState(false)

  const toggle = useCallback(() => setEnabled((p) => !p), [setEnabled])

  const toggleBook = useCallback(
    (bookId: string) => {
      setReadBooks((prev) => (prev.includes(bookId) ? prev.filter((b) => b !== bookId) : [...prev, bookId]))
    },
    [setReadBooks],
  )

  const isBookRead = useCallback((bookId: string) => readBooks.includes(bookId), [readBooks])

  const markAllBooks = useCallback(
    (ids: string[]) => {
      setReadBooks(ids)
    },
    [setReadBooks],
  )

  const markNoBooks = useCallback(() => setReadBooks([]), [setReadBooks])

  const isCharacterVisible = useCallback(
    (character: Character): boolean => {
      if (!enabled) return true
      if (character.requiredBooks.length === 0) return true
      return character.requiredBooks.every((b) => readBooks.includes(b))
    },
    [enabled, readBooks],
  )

  const filterCharacters = useCallback(
    (chars: Character[]): Character[] => {
      if (!enabled) return chars
      return chars.filter(isCharacterVisible)
    },
    [enabled, isCharacterVisible],
  )

  const spoilerCount = enabled ? ALL_CHARACTERS.filter((c) => !isCharacterVisible(c)).length : 0

  return {
    enabled,
    toggle,
    panelOpen,
    setPanelOpen,
    readBooks,
    toggleBook,
    isBookRead,
    markAllBooks,
    markNoBooks,
    isCharacterVisible,
    filterCharacters,
    spoilerCount,
    books: BOOKS,
  }
}
