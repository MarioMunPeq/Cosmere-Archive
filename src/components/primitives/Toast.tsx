/**
 * Toast — transient status messages.
 *
 * The provider owns the queue; `useToast` is the only way to raise one. Two
 * rules are enforced here rather than left to call sites:
 *
 *  1. Messages that report a result go into an `aria-live="polite"` region, so
 *     they are announced without cutting off whatever is being read.
 *  2. Errors and warnings are `role="alert"`, because they interrupt.
 *
 * The toast region sits above everything (`--z-toast`) but below the skip links,
 * and it is only rendered when there is something to show, so an empty toast
 * container never affects layout.
 */

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Icon, { CloseGlyph } from './Icon'

export type ToastTone = 'info' | 'success' | 'warning' | 'error'

interface Toast {
  id: number
  tone: ToastTone
  message: string
}

interface ToastApi {
  show: (message: string, tone?: ToastTone, ms?: number) => void
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const DEFAULT_MS = 4000
const MAX_VISIBLE = 4

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const dismiss = useCallback((id: number) => {
    const t = timers.current.get(id)
    if (t) {
      clearTimeout(t)
      timers.current.delete(id)
    }
    setToasts((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const show = useCallback(
    (message: string, tone: ToastTone = 'info', ms: number = DEFAULT_MS) => {
      const id = nextId.current++
      setToasts((prev) => [...prev, { id, tone, message }].slice(-MAX_VISIBLE))
      // Errors stay until dismissed: they usually need an action.
      if (tone === 'error') return
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), ms),
      )
    },
    [dismiss],
  )

  const api = useMemo<ToastApi>(() => ({ show, dismiss }), [show, dismiss])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed bottom-[calc(var(--bottom-nav-h)+var(--spacing-md))] right-md z-[var(--z-toast)] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2xs md:bottom-md"
        // Polite region for status, assertive only for errors, which are also
        // rendered with role="alert" below.
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === 'error' ? 'alert' : 'status'}
            className={[
              'pointer-events-auto flex items-start gap-sm rounded-[var(--radius-md)]',
              'border bg-[var(--surface-overlay)] px-3.5 py-3 shadow-[var(--shadow-3)]',
              'text-meta leading-[var(--lh-ui)]',
              t.tone === 'error'
                ? 'border-[var(--shard-odium)] text-[var(--text-primary)]'
                : t.tone === 'warning'
                  ? 'border-[var(--text-accent)] text-[var(--text-primary)]'
                  : 'border-[var(--border-interactive)] text-[var(--text-primary)]',
            ].join(' ')}
          >
            <span
              aria-hidden
              className={[
                'mt-1 h-1.5 w-1.5 shrink-0 rounded-full',
                t.tone === 'error'
                  ? 'bg-[var(--shard-odium)]'
                  : t.tone === 'warning'
                    ? 'bg-[var(--text-accent)]'
                    : t.tone === 'success'
                      ? 'bg-[var(--shard-cultivation)]'
                      : 'bg-[var(--text-link)]',
              ].join(' ')}
            />
            <p className="min-w-0 flex-1">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
            >
              <Icon size={14}>
                <CloseGlyph />
              </Icon>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

/**
 * Safe outside a provider: returns a no-op so a component can be rendered in a
 * test or a story without wrapping the tree.
 */
export function useToast(): ToastApi {
  return useContext(ToastContext) ?? { show: () => {}, dismiss: () => {} }
}
