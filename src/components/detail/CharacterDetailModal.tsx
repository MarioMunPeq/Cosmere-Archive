import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Character } from '@/types/character'
import type { Saga } from '@/data/static/sagas'
import { getPlanetById, TAILWIND_TO_HEX, getCharacterSagas, SAGAS, ALL_CHARACTERS } from '@/data/static'
import { MAGIC_SYSTEMS } from '@/data/static/magic-systems'
import { CHARACTER_SPANS } from '@/data/static/timeline/character-lifespans'
import CharacterAvatar from '@/components/ui/CharacterAvatar'
import ColorDot from '@/components/ui/ColorDot'
import CloseButton from '@/components/ui/CloseButton'

interface Props {
  character: Character
  onClose: () => void
  onSelectCharacter?: (id: string) => void
  originRect?: DOMRect | null
}

const FEATURED = new Set([
  'kaladin',
  'shallan',
  'dalinar',
  'szeth',
  'navani',
  'adolin',
  'jasnah',
  'lift',
  'venli',
  'kelsier',
  'vin',
  'elend',
  'sazed',
  'spook',
  'wax',
  'wayne',
  'marasi',
  'steris',
  'raoden',
  'sarene',
  'vasher',
  'vivenna',
  'nightblood',
  'kenton',
  'tress',
  'yumi',
  'hoid',
])

function getSagaColor(saga: Saga): string {
  return TAILWIND_TO_HEX[saga.color] ?? '#6b7280'
}

function CharacterDetailModal({ character, onClose, onSelectCharacter, originRect }: Props) {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<'entering' | 'open' | 'closing'>('entering')
  const cardRef = useRef<HTMLDivElement>(null)

  const planet = getPlanetById(character.planet)
  const isFeatured = FEATURED.has(character.id)

  const sagas = useMemo(() => {
    const ids = getCharacterSagas(character.requiredBooks)
    return SAGAS.filter((s) => ids.includes(s.id)).sort((a, b) => a.order - b.order)
  }, [character.requiredBooks])

  const span = CHARACTER_SPANS.find((s) => s.id === character.id)
  const titles = span?.titles ?? []

  const magicSystems = useMemo(() => MAGIC_SYSTEMS.filter((ms) => ms.planetId === character.planet), [character.planet])

  const relatedCharacters = useMemo(
    () => ALL_CHARACTERS.filter((c) => c.planet === character.planet && c.id !== character.id).slice(0, 8),
    [character.planet, character.id],
  )

  useEffect(() => {
    const t = window.setTimeout(() => setPhase('open'), 80)
    return () => window.clearTimeout(t)
  }, [])

  const handleClose = useCallback(() => {
    if (phase === 'closing') return
    setPhase('closing')

    if (cardRef.current && originRect) {
      const cardRect = cardRef.current.getBoundingClientRect()
      const ox = originRect.x + originRect.width / 2
      const oy = originRect.y + originRect.height / 2
      const cx = cardRect.left + cardRect.width / 2
      const cy = cardRect.top + cardRect.height / 2
      cardRef.current.style.setProperty('--close-dx', `${ox - cx}px`)
      cardRef.current.style.setProperty('--close-dy', `${oy - cy}px`)
    }

    window.setTimeout(onClose, 550)
  }, [phase, onClose, originRect])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [handleClose])

  const planetColor = planet?.color ?? '#6b7280'

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
        phase === 'closing' ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
    >
      <div
        ref={cardRef}
        className={`relative mx-4 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-gray-700/60 bg-gray-900 shadow-2xl shadow-black/50 backdrop-blur-lg transition-all duration-300 ${
          phase === 'entering'
            ? 'translate-y-6 opacity-0 scale-[0.97]'
            : phase === 'closing'
              ? originRect
                ? 'opacity-0'
                : 'translate-y-8 opacity-0 scale-[0.85]'
              : 'translate-y-0 opacity-100 scale-100'
        }`}
        style={
          phase === 'closing' && originRect
            ? {
                transform: `translate(var(--close-dx, 0), var(--close-dy, 0)) scale(0.3)`,
                transformOrigin: 'center center',
                scrollbarWidth: 'thin' as const,
                scrollbarColor: '#4b5563 transparent',
              }
            : {
                scrollbarWidth: 'thin' as const,
                scrollbarColor: '#4b5563 transparent',
              }
        }
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${character.name} details`}
      >
        <div
          className="relative px-8 pb-6 pt-10 sm:px-10 sm:pt-12"
          style={
            isFeatured && planet?.color
              ? { background: `linear-gradient(135deg, ${planet.color}18, transparent 70%)` }
              : undefined
          }
        >
          <CloseButton
            onClick={handleClose}
            ariaLabel={`Close ${character.name} details`}
            className="absolute right-4 top-4 z-10 text-gray-600 transition-colors hover:text-gray-300"
          />

          <div
            className={`transition-all duration-500 ${
              phase === 'closing' ? 'translate-y-[-6px] opacity-0' : 'translate-y-0 opacity-100'
            }`}
            style={{ transitionDelay: phase === 'closing' ? '0ms' : '80ms' }}
          >
            <div className="flex items-center gap-6">
              <CharacterAvatar
                character={character}
                color={planetColor}
                size={96}
                className="shrink-0 ring-2 ring-gray-700/40 shadow-xl shadow-black/30"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-3xl font-bold tracking-tight text-gray-100">{character.name}</h2>
                  {isFeatured && (
                    <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xxs font-medium text-amber-400/90">
                      Protagonist
                    </span>
                  )}
                </div>
                {character.pronunciation && <p className="mt-0.5 text-sm text-gray-500">/{character.pronunciation}/</p>}
                {titles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {titles.map((title) => (
                      <span
                        key={title}
                        className="rounded-md border px-2 py-0.5 text-xxs font-medium"
                        style={{
                          borderColor: `${planetColor}30`,
                          backgroundColor: `${planetColor}10`,
                          color: planetColor,
                        }}
                      >
                        {title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <p
            className={`mt-6 text-sm leading-relaxed text-gray-400 transition-all duration-500 ${
              phase === 'closing' ? 'translate-y-[-6px] opacity-0' : 'translate-y-0 opacity-100'
            }`}
            style={{ transitionDelay: phase === 'closing' ? '60ms' : '180ms' }}
          >
            {character.description}
          </p>
        </div>

        <div className="border-t border-gray-800/60">
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-6 px-8 py-6 sm:px-10 transition-all duration-500 ${
              phase === 'closing' ? 'translate-y-[-4px] opacity-0' : 'translate-y-0 opacity-100'
            }`}
            style={{ transitionDelay: phase === 'closing' ? '130ms' : '300ms' }}
          >
            <div>
              <h4 className="text-xxs font-semibold uppercase tracking-widest text-gray-600">Planet</h4>
              <button
                onClick={() => {
                  onClose()
                  navigate(`/map?focus=planet&id=${character.planet}`)
                }}
                className="mt-1.5 flex w-full items-center gap-2 rounded-lg border border-gray-800/60 bg-gray-950/50 px-3.5 py-2 text-sm text-gray-300 transition-colors hover:border-cyan-800/60 hover:text-cyan-400"
              >
                <ColorDot color={planetColor} />
                {planet?.name ?? character.planet.replace(/_/g, ' ')}
              </button>
            </div>

            {magicSystems.length > 0 && (
              <div>
                <h4 className="text-xxs font-semibold uppercase tracking-widest text-gray-600">Magic System</h4>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {magicSystems.map((ms) => (
                    <button
                      key={ms.id}
                      onClick={() => {
                        onClose()
                        navigate(`/magic?system=${ms.id}`)
                      }}
                      className="rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:brightness-125"
                      style={{
                        borderColor: `${ms.color}40`,
                        backgroundColor: `${ms.color}15`,
                        color: ms.color,
                      }}
                    >
                      {ms.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div
            className={`px-8 pb-4 sm:px-10 transition-all duration-500 ${
              phase === 'closing' ? 'translate-y-[-4px] opacity-0' : 'translate-y-0 opacity-100'
            }`}
            style={{ transitionDelay: phase === 'closing' ? '130ms' : '300ms' }}
          >
            <h4 className="text-xxs font-semibold uppercase tracking-widest text-gray-600">Appears in</h4>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {sagas.length > 0 ? (
                sagas.map((saga) => (
                  <span
                    key={saga.id}
                    className="rounded-md border px-2.5 py-1 text-xs font-medium"
                    style={{
                      borderColor: `${getSagaColor(saga)}40`,
                      backgroundColor: `${getSagaColor(saga)}15`,
                      color: getSagaColor(saga),
                    }}
                  >
                    {saga.name}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-600">Unknown</span>
              )}
            </div>
          </div>

          {relatedCharacters.length > 0 && (
            <div
              className={`border-t border-gray-800/60 px-8 py-5 sm:px-10 transition-all duration-500 ${
                phase === 'closing' ? 'translate-y-[-4px] opacity-0' : 'translate-y-0 opacity-100'
              }`}
              style={{ transitionDelay: phase === 'closing' ? '200ms' : '420ms' }}
            >
              <h4 className="text-xxs font-semibold uppercase tracking-widest text-gray-600">
                More from {planet?.name ?? character.planet.replace(/_/g, ' ')}
              </h4>
              <div className="mt-3 flex flex-wrap gap-3">
                {relatedCharacters.map((rc) => {
                  const rcPlanet = getPlanetById(rc.planet)
                  return (
                    <button
                      key={rc.id}
                      onClick={() => onSelectCharacter?.(rc.id)}
                      className="flex items-center gap-2 rounded-lg border border-gray-800/40 bg-gray-950/40 px-3 py-2 transition-colors hover:border-gray-700/60 hover:bg-gray-900/60"
                    >
                      <CharacterAvatar
                        character={rc}
                        color={rcPlanet?.color ?? '#6b7280'}
                        size={28}
                        className="ring-1 ring-gray-700/30"
                      />
                      <span className="text-xs text-gray-400 truncate max-w-24">{rc.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CharacterDetailModal
