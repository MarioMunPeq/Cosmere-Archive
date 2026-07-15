import BackToMapButton from '@/components/ui/BackToMapButton'
import ChronologyPage from './ChronologyPage'

export default function StandaloneChronologyPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#0b0a0a]">
      <div className="relative px-6 pt-5 sm:px-8">
        <BackToMapButton className="relative" />
        <h1 className="relative mt-3 font-serif text-2xl tracking-wider text-gray-200">Cosmere Chronology</h1>
        <p className="relative mt-1.5 font-serif text-sm leading-relaxed text-gray-600 max-w-2xl">
          A chronological record of known historical events compiled by an anonymous archivist of Silverlight.
        </p>
      </div>
      <div className="mt-2 flex min-h-0 flex-1 flex-col">
        <ChronologyPage />
      </div>
    </div>
  )
}
