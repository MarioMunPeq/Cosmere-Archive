import { useState, useEffect } from 'react'

const THRESHOLD = 300

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const main = document.getElementById('main-content')
    const target = main ?? window

    const onScroll = () => {
      const scrollY = main ? main.scrollTop : window.scrollY
      setVisible(scrollY > THRESHOLD)
    }

    target.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => target.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    const main = document.getElementById('main-content')
    if (main) {
      main.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-purple-700 text-white shadow-lg transition-all duration-300 hover:bg-purple-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  )
}
