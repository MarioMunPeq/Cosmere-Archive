import { useState, useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSEOMeta } from '@/hooks/useSEOMeta'
import ArchivalViewer from '@/components/ars-arcanum/ArchivalViewer'

import AtlasImmersiveDetails from '@/components/celestial-charts/AtlasImmersiveDetails'
import {
  AtlasIndexLeft,
  AtlasIndexRight,
  PlanetLeftPage,
  PlanetRightPage,
  ATLAS_ORDER,
  getPlanetIndex,
} from '@/components/atlas/AtlasPageContent'

const TURN_DURATION = 380

export default function KhrissAtlas() {
  const [searchParams, setSearchParams] = useSearchParams()
  const planetParam = searchParams.get('planet')

  const initialSpread = planetParam ? getPlanetIndex(planetParam) : 0

  const [currentSpread, setCurrentSpread] = useState(initialSpread)
  const [displayedSpread, setDisplayedSpread] = useState(initialSpread)
  const [isTurning, setIsTurning] = useState(false)
  const [turnDir, setTurnDir] = useState<'next' | 'prev'>('next')
  const [animPhase, setAnimPhase] = useState<'idle' | 'lift' | 'settle'>('idle')
  const turnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalSpreads = ATLAS_ORDER.length + 1

  useSEOMeta({
    title: 'Celestial Atlas — Cosmere Archive',
    description: "Khriss's personal astronomical atlas of the known Cosmere, preserved in the Silverlight Archive.",
  })

  const navigateTo = useCallback(
    (target: number | string) => {
      let index: number
      if (typeof target === 'string') {
        if (target === '__index__') {
          index = 0
        } else {
          const idx = ATLAS_ORDER.indexOf(target as string)
          if (idx === -1) return
          index = idx + 1
        }
      } else {
        index = target
      }

      if (index === currentSpread || isTurning) return
      if (index < 0 || index >= totalSpreads) return

      const dir = index > currentSpread ? 'next' : 'prev'
      setTurnDir(dir)
      setIsTurning(true)
      setAnimPhase('lift')
      setCurrentSpread(index)

      if (index === 0) {
        setSearchParams({}, { replace: true })
      } else {
        const pid = ATLAS_ORDER[index - 1]
        setSearchParams({ planet: pid } as Record<string, string>, { replace: true })
      }

      if (turnTimerRef.current) clearTimeout(turnTimerRef.current)
      turnTimerRef.current = setTimeout(() => {
        setDisplayedSpread(index)
        setAnimPhase('settle')
        setTimeout(() => {
          setAnimPhase('idle')
          setIsTurning(false)
        }, 200)
      }, TURN_DURATION * 0.4)
    },
    [currentSpread, isTurning, totalSpreads, setSearchParams],
  )

  const goNext = useCallback(() => {
    navigateTo(currentSpread + 1)
  }, [navigateTo, currentSpread])

  const goPrev = useCallback(() => {
    navigateTo(currentSpread - 1)
  }, [navigateTo, currentSpread])

  const goIndex = useCallback(() => {
    navigateTo(0)
  }, [navigateTo])

  /* Keyboard navigation */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (isTurning) return
      if (e.key === 'ArrowRight' && currentSpread < totalSpreads - 1) {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowLeft' && currentSpread > 0) {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'Escape') {
        goIndex()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isTurning, currentSpread, totalSpreads, goNext, goPrev, goIndex])

  useEffect(() => {
    return () => {
      if (turnTimerRef.current) clearTimeout(turnTimerRef.current)
    }
  }, [])

  const isIndex = displayedSpread === 0
  const planetId = isIndex ? null : ATLAS_ORDER[displayedSpread - 1]

  const turnClass =
    animPhase === 'lift'
      ? turnDir === 'next'
        ? 'atlas-turn-next atlas-turning'
        : 'atlas-turn-prev atlas-turning'
      : animPhase === 'settle'
        ? 'atlas-turn-settle'
        : ''

  /* Left/right page content */
  const leftContent = isIndex ? (
    <AtlasIndexLeft onNavigate={navigateTo} />
  ) : planetId ? (
    <PlanetLeftPage planetId={planetId} onNavigate={navigateTo} />
  ) : null

  const rightContent = isIndex ? <AtlasIndexRight /> : planetId ? <PlanetRightPage planetId={planetId} /> : null

  const folioLeft = isIndex ? 'i' : `Plate ${displayedSpread}`
  const folioRight = isIndex ? 'ii' : `Plate ${displayedSpread}`
  const headerLeft = isIndex ? 'Atlas Index' : `Chapter ${String(displayedSpread).padStart(2, '0')}`
  const headerRight = isIndex ? '' : planetId ? getPlanetName(planetId) : ''

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 50%, #1a1008 0%, #0f0a06 100%)' }}
    >
      <div className="relative flex flex-1 min-h-0">
        <div
          className={`flex flex-1 min-h-0 transition-all duration-[${TURN_DURATION}ms] ${turnClass}`}
          style={{
            perspective: '2000px',
            transformStyle: 'preserve-3d',
          }}
        >
          <ArchivalViewer
            key={`spread-${displayedSpread}`}
            left={leftContent}
            right={rightContent}
            leftFolio={folioLeft}
            rightFolio={folioRight}
            leftHeader={headerLeft}
            rightHeader={headerRight}
            paperStain={true}
          />
        </div>

        {/* Stamps and desk objects */}
        {!isIndex && (
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 4 }}>
            <AtlasImmersiveDetails planetId={planetId} showDeskObjects={true} />
          </div>
        )}

        {/* Turn corners / navigation */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* Left corner — previous */}
          {displayedSpread > 0 && (
            <div
              role="button"
              tabIndex={0}
              onClick={goPrev}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  goPrev()
                }
              }}
              className="absolute left-0 top-0 bottom-0 pointer-events-auto cursor-pointer transition-opacity hover:opacity-60"
              style={{ width: 'clamp(40px, 4vw, 60px)' }}
            >
              <div
                className="absolute left-2 top-1/2 -translate-y-1/2 font-serif"
                style={{ color: 'rgba(80,60,40,0.12)', fontSize: 'clamp(16px, 1.5vw, 24px)' }}
              >
                ‹
              </div>
            </div>
          )}

          {/* Right corner — next */}
          {displayedSpread < totalSpreads - 1 && (
            <div
              role="button"
              tabIndex={0}
              onClick={goNext}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  goNext()
                }
              }}
              className="absolute right-0 top-0 bottom-0 pointer-events-auto cursor-pointer transition-opacity hover:opacity-60"
              style={{ width: 'clamp(40px, 4vw, 60px)' }}
            >
              <div
                className="absolute right-2 top-1/2 -translate-y-1/2 font-serif"
                style={{ color: 'rgba(80,60,40,0.12)', fontSize: 'clamp(16px, 1.5vw, 24px)' }}
              >
                ›
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getPlanetName(id: string): string {
  const names: Record<string, string> = {
    roshar: 'Roshar',
    scadrial: 'Scadrial',
    sel: 'Sel',
    nalthis: 'Nalthis',
    taldain: 'Taldain',
    lumar: 'Lumar',
    komashi: 'Komashi',
    canticle: 'Canticle',
    'first-of-the-sun': 'First of the Sun',
    threnody: 'Threnody',
    yolen: 'Yolen',
  }
  return names[id] ?? id
}
