import { useEffect } from 'react'

export function useKeyboardShortcut(
  keys: { key: string; meta?: boolean; ctrl?: boolean; alt?: boolean }[],
  handler: (e: KeyboardEvent) => void,
  options?: { enabled?: boolean },
) {
  useEffect(() => {
    if (options?.enabled === false) return
    function onKey(e: KeyboardEvent) {
      for (const shortcut of keys) {
        const metaMatch = shortcut.meta === undefined || shortcut.meta === e.metaKey
        const ctrlMatch = shortcut.ctrl === undefined || shortcut.ctrl === e.ctrlKey
        const altMatch = shortcut.alt === undefined || shortcut.alt === e.altKey
        if (e.key === shortcut.key && metaMatch && ctrlMatch && altMatch) {
          handler(e)
          return
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [keys, handler, options?.enabled])
}
