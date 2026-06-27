import { useCallback, useState } from 'react'
import { useLocation } from 'react-router-dom'

const COPY_DURATION = 2000

export default function ShareButton() {
  const [copied, setCopied] = useState(false)
  const { pathname } = useLocation()

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}${pathname}`
    const title = document.title

    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        /* user cancelled or error */
      }
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), COPY_DURATION)
    } catch {
      /* clipboard not available */
    }
  }, [pathname])

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-200"
        aria-label="Share this page"
        title="Share"
      >
        {copied ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        )}
      </button>
      {copied && (
        <span
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-0.5 text-xxs text-gray-300 shadow"
          role="status"
          aria-live="polite"
        >
          Link copied
        </span>
      )}
    </div>
  )
}
