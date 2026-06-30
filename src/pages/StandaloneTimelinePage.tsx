import BackToMapButton from '@/components/ui/BackToMapButton'
import TimelinePage from './TimelinePage'

export default function StandaloneTimelinePage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-4 pt-4 sm:px-6">
        <BackToMapButton />
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
