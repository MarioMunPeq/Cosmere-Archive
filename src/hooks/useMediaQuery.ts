import { useEffect, useState } from 'react'

/**
 * A live media query, for the two places where the right layout cannot be
 * expressed in CSS alone: the reader needs a different set of spreads on a
 * phone, and the shelf needs to know whether it is a horizontal run.
 */
export default function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [query])

  return matches
}
