import { useEffect, useRef } from 'react'

/**
 * Releases Three.js resources on real unmount.
 *
 * The timeout is deliberate: React StrictMode runs effect setup → cleanup →
 * setup during development. Scheduling the release one tick out, then clearing
 * it when setup runs again, means a simulated unmount does not dispose geometry
 * that the immediately following mount is still using.
 */
export default function useDisposeOnUnmount(release: () => void): void {
  const releaseRef = useRef(release)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    releaseRef.current = release
  })

  useEffect(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    return () => {
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null
        releaseRef.current()
      }, 0)
    }
  }, [])
}
