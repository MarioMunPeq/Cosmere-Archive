import { Link } from 'react-router-dom'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import TimelinePage from './TimelinePage'

export default function StandaloneTimelinePage() {
  useSEOMeta({
    title: 'Timeline — Cosmere Archive',
    description: 'Interactive timeline of events across the Cosmere universe',
  })

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-4 pt-4 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-purple-400 transition-colors hover:text-purple-300"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to the map
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-100">Cosmere Timeline</h1>
        <p className="mt-1 text-sm text-gray-500">
          Key events across the Cosmere, from the Shattering to the far future
        </p>
      </div>
      <div className="mt-2 flex min-h-0 flex-1 flex-col">
        <TimelinePage />
      </div>
    </div>
  )
}
