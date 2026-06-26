import { useEffect } from 'react'

export function useKeyboardShortcut(
  keys: { key: string; meta?: boolean; ctrl?: boolean }[],
  handler: (e: KeyboardEvent) => void,
  options?: { enabled?: boolean },
) {
  useEffect(() => {
    if (options?.enabled === false) return
    function onKey(e: KeyboardEvent) {
      for (const shortcut of keys) {
        const metaMatch = shortcut.meta ? e.metaKey : true
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey : true
        if (e.key === shortcut.key && metaMatch && ctrlMatch) {
          handler(e)
          return
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [keys, handler, options?.enabled])
}
