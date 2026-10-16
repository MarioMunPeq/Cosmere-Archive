/**
 * Signature — the author's mark on the About page.
 *
 * `public/images/about/signature.png` does not exist and never has; the file
 * was referenced with an `onError` that silently kept `loaded` false, so the
 * page reserved 36px of empty space and moved on. The broken image was only
 * visible in the network tab, which is why it survived.
 *
 * This component is now self-sufficient: the name is rendered as text, and the
 * image is an enhancement layered on top when — and only when — the file exists.
 * The page is correct without it, so nothing has to be authored to ship.
 */

import { useEffect, useState } from 'react'

const SIGNATURE_SRC = `${import.meta.env.BASE_URL}images/about/signature.png`

/**
 * The existence probe runs once per page load, not once per component.
 *
 * Module scope matters here: the answer is a property of the file, not of the
 * component, so a second mount — StrictMode, a remount, a second Signature on
 * the page — must reuse it instead of issuing another request for a file that
 * is known to be absent.
 */
let probe: Promise<boolean> | null = null

function signatureExists(): Promise<boolean> {
  probe ??= new Promise<boolean>((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = SIGNATURE_SRC
  })
  return probe
}

export default function Signature() {
  const [available, setAvailable] = useState(false)

  useEffect(() => {
    let cancelled = false
    void signatureExists().then((ok) => {
      if (!cancelled) setAvailable(ok)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mt-8 flex flex-col items-end gap-2">
      {/*
        Rendered only once the file is known to exist, so a missing asset costs
        one failed request in total and reserves no space at all.
      */}
      {available && (
        <img
          src={SIGNATURE_SRC}
          alt="Signature of Mario Muñoz Pequeño"
          className="h-auto w-auto object-contain"
          style={{
            maxWidth: '220px',
            opacity: 0.9,
            filter: 'sepia(0.3) saturate(0.7) brightness(0.85)',
          }}
        />
      )}

      <span className="font-[var(--font-display)] text-[var(--text-on-page-tertiary)] text-nano tracking-[var(--ls-caps-wide)] uppercase">
        Mario Muñoz Pequeño
      </span>
    </div>
  )
}
