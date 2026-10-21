/**
 * Codex · session memory
 *
 * The cover is a ceremony, not a gate. It plays once per browser session and
 * afterwards the reader lands straight on the spread. sessionStorage is the
 * right lifetime: a new tab deserves the ritual again, a reload does not.
 *
 * Both helpers swallow storage errors. Safari private mode and some embedded
 * webviews throw on access, and a locked cover would be a much worse failure
 * than a repeated animation.
 */

export const CODEX_SESSION_KEY = 'cosmere-codex-opened'

function session(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export function hasOpenedCodex(): boolean {
  try {
    return session()?.getItem(CODEX_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function markCodexOpened(): void {
  try {
    session()?.setItem(CODEX_SESSION_KEY, '1')
  } catch {
    // Storage unavailable: the cover will simply replay. Nothing to recover.
  }
}
