import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

export type FontSize = 'small' | 'medium' | 'large'

const SCALES: Record<FontSize, string> = {
  small: '0.875',
  medium: '1',
  large: '1.125',
}

const STORAGE_KEY = 'cosmere-font-size'

export function useFontSize() {
  const [size, setSize] = useLocalStorage<FontSize>(STORAGE_KEY, 'medium')

  useEffect(() => {
    document.documentElement.style.setProperty('--font-size-scale', SCALES[size])
  }, [size])

  const cycleSize = () => {
    setSize((prev) => {
      const sizes: FontSize[] = ['small', 'medium', 'large']
      const idx = sizes.indexOf(prev)
      return sizes[(idx + 1) % sizes.length]!
    })
  }

  return { size, setSize, cycleSize }
}
