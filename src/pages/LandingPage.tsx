import { useViewTransitionNavigate } from '@/hooks/useViewTransition'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import ParticlesBackground from '@/components/common/ParticlesBackground'
import { SearchIcon } from '@/components/common/icons'
import type { SearchResult } from '@/types/search'

interface Section {
  id: string
  label: string
  to: string
  description: string
  iconType: SearchResult['type']
  featured?: boolean
}

const SECTIONS: Section[] = [
  {
    id: 'map',
    label: 'Interactive Map',
    to: '/map',
    description: 'Explore the Cosmere universe',
    iconType: 'planet',
    featured: true,
  },
  {
    id: 'library',
    label: 'Library',
    to: '/library',
    description: 'Virtual Cosmere book collection',
    iconType: 'book',
    featured: true,
  },
  {
    id: 'characters',
    label: 'Characters',
    to: '/characters',
    description: 'Characters and family trees',
    iconType: 'character',
  },
  { id: 'timeline', label: 'Timeline', to: '/timeline', description: 'Cosmere timeline of events', iconType: 'event' },
  { id: 'books', label: 'Books', to: '/books', description: 'All Cosmere books', iconType: 'book' },
  {
    id: 'locations',
    label: 'Locations',
    to: '/locations',
    description: 'Planets and celestial bodies',
    iconType: 'planet',
  },
  {
    id: 'magic',
    label: 'Magic Systems',
    to: '/magic',
    description: 'Terms, magic systems, and more',
    iconType: 'magic',
  },
  { id: 'stats', label: 'Stats', to: '/stats', description: 'Cosmere data dashboard', iconType: 'event' },
  {
    id: 'heralds',
    label: 'Heralds',
    to: '/heralds',
    description: 'The 10 Heralds of the Almighty',
    iconType: 'herald',
  },
  {
    id: 'relationships',
    label: 'Relationships',
    to: '/characters?tab=relationships',
    description: 'Character relationships',
    iconType: 'character',
  },
  {
    id: 'mind-map',
    label: 'Mind Map',
    to: '/mind-map',
    description: 'Interactive Cosmere mind map',
    iconType: 'magic',
  },
]

export default function LandingPage() {
  const navigate = useViewTransitionNavigate()

  useSEOMeta({
    title: 'Cosmere Archive',
    description: 'An interactive guide to the Cosmere universe — explore planets, characters, books, and more',
  })

  const featuredSections = SECTIONS.filter((s) => s.featured)
  const nonFeatured = SECTIONS.filter((s) => !s.featured)
  const mainSections = nonFeatured.slice(0, 2)
  const secondarySections = nonFeatured.slice(2)

  return (
    <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto">
      <ParticlesBackground />

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center px-4 py-12">
        <div className="mb-4 text-center">
          <h1 className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-5xl font-extrabold text-transparent sm:text-6xl lg:text-7xl">
            Cosmere Archive
          </h1>
          <p className="mt-3 text-sm text-gray-500 sm:text-base">An interactive guide to the Cosmere universe</p>
        </div>

        <div className="mt-8 grid w-full gap-4 sm:grid-cols-2">
          {featuredSections.map((section) => (
            <button
              key={section.id}
              onClick={() => navigate(section.to)}
              className="group relative w-full overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/60 via-gray-900/80 to-cyan-950/40 p-8 text-left transition-all duration-300 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-purple-900/50 text-purple-400 transition-colors group-hover:bg-purple-800/60 group-hover:text-purple-300">
                  <SearchIcon type={section.iconType} size={32} className="text-inherit" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-bold text-gray-100">{section.label}</h2>
                  <p className="mt-1 text-sm text-gray-400">{section.description}</p>
                </div>
                <span className="text-lg text-purple-500 transition-transform group-hover:translate-x-1">→</span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 grid w-full gap-4 sm:grid-cols-2">
          {mainSections.map((section) => (
            <button
              key={section.id}
              onClick={() => navigate(section.to)}
              className="group rounded-xl border border-gray-800 bg-gray-900/60 p-5 text-left transition-all duration-200 hover:border-gray-700 hover:bg-gray-800/60 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition-colors group-hover:bg-purple-900/40 group-hover:text-purple-400">
                  <SearchIcon type={section.iconType} size={24} className="text-inherit" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-gray-200">{section.label}</h3>
                  <p className="mt-0.5 text-xs text-gray-500">{section.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {secondarySections.map((section) => (
            <button
              key={section.id}
              onClick={() => navigate(section.to)}
              className="group rounded-lg border border-gray-800/60 bg-gray-900/40 p-3.5 text-left transition-all duration-200 hover:border-gray-700/80 hover:bg-gray-800/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-800/60 text-gray-500 transition-colors group-hover:text-purple-400">
                  <SearchIcon type={section.iconType} size={18} className="text-inherit" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-gray-300">{section.label}</h3>
                  <p className="mt-0.5 truncate text-xxs text-gray-600">{section.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
