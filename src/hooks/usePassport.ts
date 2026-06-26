import { useState, useCallback } from 'react'

const STORAGE_KEY = 'cosmere-passport'

interface PassportState {
  visitedPlanets: string[]
  readBooks: string[]
  metCharacters: string[]
}

function load(): PassportState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as PassportState
  } catch {
    console.warn('[usePassport] Failed to parse stored passport data')
  }
  return { visitedPlanets: [], readBooks: [], metCharacters: [] }
}

function save(state: PassportState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function usePassport() {
  const [state, setState] = useState<PassportState>(load)

  const togglePlanet = useCallback((id: string) => {
    setState((prev) => {
      const next = { ...prev }
      next.visitedPlanets = prev.visitedPlanets.includes(id)
        ? prev.visitedPlanets.filter((x) => x !== id)
        : [...prev.visitedPlanets, id]
      save(next)
      return next
    })
  }, [])

  const toggleBook = useCallback((id: string) => {
    setState((prev) => {
      const next = { ...prev }
      next.readBooks = prev.readBooks.includes(id) ? prev.readBooks.filter((x) => x !== id) : [...prev.readBooks, id]
      save(next)
      return next
    })
  }, [])

  const toggleCharacter = useCallback((id: string) => {
    setState((prev) => {
      const next = { ...prev }
      next.metCharacters = prev.metCharacters.includes(id)
        ? prev.metCharacters.filter((x) => x !== id)
        : [...prev.metCharacters, id]
      save(next)
      return next
    })
  }, [])

  const isPlanetVisited = useCallback((id: string) => state.visitedPlanets.includes(id), [state.visitedPlanets])
  const isBookRead = useCallback((id: string) => state.readBooks.includes(id), [state.readBooks])
  const isCharacterMet = useCallback((id: string) => state.metCharacters.includes(id), [state.metCharacters])

  const completedPlanets = state.visitedPlanets.length
  const completedBooks = state.readBooks.length
  const completedCharacters = state.metCharacters.length

  return {
    visitedPlanets: state.visitedPlanets,
    readBooks: state.readBooks,
    metCharacters: state.metCharacters,
    togglePlanet,
    toggleBook,
    toggleCharacter,
    isPlanetVisited,
    isBookRead,
    isCharacterMet,
    completedPlanets,
    completedBooks,
    completedCharacters,
  }
}
