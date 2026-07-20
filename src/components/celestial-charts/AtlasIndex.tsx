import { useState, useMemo } from 'react'
import { PLANETS } from '@/data/static'
import { CHARACTER_SPANS } from '@/data/static/timeline'
import ShardsLegend from './ShardsLegend'
import WorldhopperLog from './WorldhopperLog'

type PageTab = 'index' | 'shards' | 'expeditions'

const TABS: { id: PageTab; label: string }[] = [
  { id: 'index', label: 'Index' },
  { id: 'shards', label: 'Shards' },
  { id: 'expeditions', label: 'Expeditions' },
]

const CHAPTER_NUMBERS: Record<string, string> = {
  roshar: '01',
  scadrial: '02',
  sel: '03',
  nalthis: '04',
  taldain: '05',
  lumar: '06',
  canticle: '07',
  komashi: '08',
  'first-of-the-sun': '09',
  threnody: '10',
  yolen: '11',
}

const TAB_COLORS: Record<string, string> = {
  roshar: '#6b93b8',
  scadrial: '#b87860',
  sel: '#68a068',
  nalthis: '#a078b8',
  taldain: '#c8b060',
  lumar: '#58a8a8',
  canticle: '#c88048',
  komashi: '#4898a8',
  'first-of-the-sun': '#58a878',
  threnody: '#9878a0',
  yolen: '#c8b848',
}

const INK = {
  title: '#2a1810',
  body: '#3d2818',
  label: '#4a3020',
  meta: '#5a3d28',
  subtle: '#7a6040',
  muted: '#9a8060',
}

interface Props {
  onSelectPlanet: (id: string) => void
  onInkRoute: (route: { id: string; planets: string[]; color: string } | null) => void
  selectedPlanetId?: string | null
}

export default function AtlasIndex({ onSelectPlanet, onInkRoute, selectedPlanetId }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<PageTab>('index')
  const [selectedWorldhopper, setSelectedWorldhopper] = useState<string | null>(null)

  const filteredPlanets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return PLANETS
    return PLANETS.filter((p) => p.name.toLowerCase().includes(q) || (p.shard && p.shard.toLowerCase().includes(q)))
  }, [searchQuery])

  return (
    <div className="flex flex-col h-full relative">
      {/* Physical paper tabs on right edge */}
      <div className="absolute right-0 top-[8%] z-10 flex flex-col items-end pointer-events-none">
        {PLANETS.map((p) => {
          const isActive = p.id === selectedPlanetId
          const tabColor = TAB_COLORS[p.id] ?? 'rgba(80,60,40,0.2)'
          return (
            <div
              key={p.id}
              className="pointer-events-auto cursor-pointer transition-all duration-300"
              style={{
                width: isActive ? '28px' : '18px',
                height: '16px',
                background: isActive ? `linear-gradient(135deg, ${tabColor}25, ${tabColor}10)` : 'rgba(80,60,40,0.02)',
                border: `0.5px solid ${isActive ? tabColor.replace(')', '30)') : 'rgba(80,60,40,0.04)'}`,
                borderRight: 'none',
                borderRadius: '2px 0 0 2px',
                marginBottom: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'width 0.3s ease, background 0.3s ease',
                minWidth: '12px',
              }}
              onClick={() => onSelectPlanet(p.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelectPlanet(p.id)
                }
              }}
              title={p.name}
            >
              <span
                className="font-serif text-[6px] leading-none"
                style={{
                  color: isActive ? tabColor : 'rgba(80,60,40,0.15)',
                  opacity: isActive ? 1 : 0.4,
                  fontWeight: isActive ? 700 : 400,
                }}
              >
                {CHAPTER_NUMBERS[p.id]}
              </span>
            </div>
          )
        })}
      </div>

      {/* Section title */}
      <h2 className="font-serif text-[15px] uppercase tracking-[0.22em] mb-5 font-bold" style={{ color: INK.label }}>
        Atlas Index
      </h2>

      {/* Chapter epigraph */}
      <p
        className="font-serif italic leading-[1.6] mb-4"
        style={{ color: INK.subtle, fontSize: 'clamp(8px, 0.75vw, 10px)' }}
      >
        An account of the known celestial bodies within the Cosmere,
        <br />
        recorded and verified by the Silverlight Cartographic Guild.
      </p>

      {/* Archival search */}
      <div className="relative mb-4 pb-3" style={{ borderBottom: '1px solid rgba(80,60,40,0.06)' }}>
        <div className="flex items-center gap-2">
          <span className="font-serif" style={{ color: INK.meta, fontSize: '10px' }}>
            Q:
          </span>
          <input
            type="text"
            placeholder="Locate astronomical record..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="manuscript-input flex-1 px-0 py-0.5 font-serif"
            style={{ color: INK.body, fontSize: '13px' }}
          />
          {searchQuery && (
            <span
              role="button"
              tabIndex={0}
              onClick={() => setSearchQuery('')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setSearchQuery('')
                }
              }}
              className="font-serif cursor-pointer transition-opacity hover:opacity-60"
              style={{ color: INK.meta, fontSize: '9px' }}
            >
              Clear
            </span>
          )}
        </div>
      </div>

      {/* Paper tabs */}
      <div className="flex gap-0 mb-4" style={{ borderBottom: '1px solid rgba(80,60,40,0.06)' }}>
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <span
              key={tab.id}
              role="button"
              tabIndex={0}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setActiveTab(tab.id)
                }
              }}
              className="font-serif text-[10px] uppercase tracking-[0.1em] py-2 px-3 transition-all cursor-pointer"
              style={{
                color: isActive ? INK.label : INK.muted,
                borderBottom: isActive ? `1px solid ${INK.meta}` : '1px solid transparent',
                marginBottom: '-1px',
                background: isActive ? 'rgba(80,60,40,0.02)' : 'transparent',
              }}
            >
              {tab.label}
            </span>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto manuscript-scrollbar">
        {activeTab === 'index' && (
          <div className="space-y-[1px]">
            {filteredPlanets.length === 0 ? (
              <p className="font-serif italic" style={{ color: INK.subtle, fontSize: '11px' }}>
                No records match.
              </p>
            ) : (
              filteredPlanets.map((p) => {
                const charCount = CHARACTER_SPANS.filter((c) => c.planet.toLowerCase() === p.id.toLowerCase()).length
                const isSelected = p.id === selectedPlanetId
                const chNum = CHAPTER_NUMBERS[p.id] ?? '—'
                return (
                  <div
                    key={p.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      onSelectPlanet(p.id)
                      setSearchQuery('')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onSelectPlanet(p.id)
                        setSearchQuery('')
                      }
                    }}
                    className="flex items-baseline gap-2 py-[2px] cursor-pointer group"
                  >
                    <span
                      className="font-serif min-w-[18px] text-right shrink-0"
                      style={{ color: isSelected ? INK.meta : INK.muted, fontSize: '10px' }}
                    >
                      {chNum}
                    </span>
                    <span
                      className="inline-block rounded-full shrink-0"
                      style={{ width: '5px', height: '5px', background: p.color, opacity: isSelected ? 0.7 : 0.25 }}
                    />
                    <span
                      className="font-serif tracking-[0.01em] transition-colors group-hover:opacity-70"
                      style={{ color: isSelected ? INK.title : INK.body, fontSize: '13px' }}
                    >
                      {p.name}
                    </span>
                    <span className="flex-1 min-w-[8px]" style={{ borderBottom: '1px dotted rgba(80,60,40,0.05)' }} />
                    <span className="font-serif" style={{ color: INK.subtle, fontSize: '10px' }}>
                      {charCount}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        )}

        {activeTab === 'shards' && <ShardsLegend />}

        {activeTab === 'expeditions' && (
          <WorldhopperLog
            selectedWorldhopper={selectedWorldhopper}
            onSelectWorldhopper={setSelectedWorldhopper}
            onInkRoute={onInkRoute}
          />
        )}
      </div>

      {/* Folio ref */}
      <div className="shrink-0 mt-4 pt-3" style={{ borderTop: '1px solid rgba(80,60,40,0.06)' }}>
        <span className="font-serif italic" style={{ color: INK.subtle, fontSize: '9px' }}>
          Fol. 9–16
        </span>
        <span className="float-right font-serif italic" style={{ color: INK.muted, fontSize: '9px' }}>
          Celestial Cartography
        </span>
      </div>
    </div>
  )
}
