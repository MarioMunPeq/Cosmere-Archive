import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function initial(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia(QUERY).matches
}

/**
 * Tracks the reader's motion preference for JS-driven choreography (the codex
 * cover, page turns). CSS handles its own half in index.css; this hook exists
 * for the cases where skipping an animation also means skipping its timers.
 */
export default function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(initial)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const media = window.matchMedia(QUERY)
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    media.addEventListener?.('change', onChange)
    return () => media.removeEventListener?.('change', onChange)
  }, [])

  return reduced
}
