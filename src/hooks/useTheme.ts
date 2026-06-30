import { useEffect, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

type Theme = 'dark' | 'light'

function prefersLight() {
  try {
    return window.matchMedia('(prefers-color-scheme: light)').matches
  } catch {
    return false
  }
}

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>('cosmere-theme', prefersLight() ? 'light' : 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [setTheme])

  return { theme, toggleTheme, setTheme }
}
