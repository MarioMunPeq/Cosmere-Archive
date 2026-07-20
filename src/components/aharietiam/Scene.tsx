'use client'
import { memo, useState, useCallback, useRef } from 'react'
import SceneCanvas from './SceneCanvas'
import Platform3D from './Platform3D'
import BladeRing from './BladeRing'
import SceneLights from './SceneLights'
import Atmosphere from './Atmosphere'
import Particles from './Particles'
import InfoMonolith from './InfoMonolith'
import ControlsLegend from './ControlsLegend'
import DebugAharietiam from './DebugAharietiam'
import { HONORBLADES } from '@/data/static/aharietiam'
import CameraRig from './CameraRig'
import type { FocusTarget } from './CameraRig'
import type { SoundEvents } from './CameraRig'

/** Procedural circle placement — single source of truth */
const RING_RADIUS = 6.5
const BLADE_COUNT = 10
const BLADE_Y = 2.02

function circlePosition(index: number): [number, number, number] {
  const angle = (index / BLADE_COUNT) * Math.PI * 2 - Math.PI / 2
  return [RING_RADIUS * Math.cos(angle), BLADE_Y, RING_RADIUS * Math.sin(angle)]
}

function getBladePos(id: string): [number, number, number] {
  const sorted = [...HONORBLADES].sort((a, b) => a.positionIndex - b.positionIndex)
  const idx = sorted.findIndex((h) => h.id === id)
  return idx >= 0 ? circlePosition(idx) : [0, 0, 0]
}

/* Sound event hooks — prepared for future audio integration */
const SOUND_EVENTS: SoundEvents = {
  onFocusSword: () => {},
  onLeaveSword: () => {},
  onHoverSword: () => {},
  onReturnOverview: () => {},
}

export default memo(function Scene() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [debug, setDebug] = useState(false)

  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null)

  /* Sound event: hover */
  const prevHoveredRef = useRef<string | null>(null)
  const handleHover = useCallback((id: string | null) => {
    setHoveredId(id)
    if (id && id !== prevHoveredRef.current) {
      SOUND_EVENTS.onHoverSword?.()
    }
    prevHoveredRef.current = id
  }, [])

  const handleSelect = useCallback((id: string | null) => {
    if (!id) return
    const pos = getBladePos(id)
    setSelectedId(id)
    setFocusTarget({ id, position: pos, slow: id === 'talenel' })
  }, [])

  const handleFlySettled = useCallback(() => {
    setFocusedId(selectedId)
  }, [selectedId])

  const handleClose = useCallback(() => {
    if (focusedId && focusedId !== 'talenel') {
      SOUND_EVENTS.onLeaveSword?.()
    }
    setFocusedId(null)
    setSelectedId(null)
    setFocusTarget(null)
  }, [focusedId])

  const selectedBlade = selectedId ? (HONORBLADES.find((h) => h.id === selectedId) ?? null) : null

  const isFocusMode = focusedId !== null
  const isTalnFocus = focusedId === 'talenel'

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#030205' }}>
      {debug && <DebugAharietiam onClose={() => setDebug(false)} />}

      {/* Atmosphere — stars, nebula, mountains, ash */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <Atmosphere />
      </div>

      {/* 3D Scene */}
      <div className="fixed inset-0" style={{ zIndex: 2 }}>
        <SceneCanvas onPointerMissed={handleClose}>
          <CameraRig focusTarget={focusTarget} onFlySettled={handleFlySettled} soundEvents={SOUND_EVENTS} />
          <SceneLights />
          <Platform3D />
          <BladeRing
            hoveredId={hoveredId}
            selectedId={selectedId}
            focusedId={focusedId}
            onHover={handleHover}
            onSelect={handleSelect}
          />
        </SceneCanvas>
      </div>

      {/* Particles overlay — ambient + occasional streaks */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 3,
          opacity: isFocusMode ? 0.35 : 1,
          transition: 'opacity 1.2s ease',
        }}
      >
        <Particles />
      </div>

      {/* Focus dimmer — darkens scene when focusing a blade */}
      {isFocusMode && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: 4,
            background: 'rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.8s ease forwards',
          }}
        />
      )}

      {/* Info panel — left side, emerges after camera settles */}
      {focusedId && focusedId === selectedId && !isTalnFocus && (
        <InfoMonolith
          blade={
            selectedBlade
              ? {
                  id: selectedBlade.id,
                  name: selectedBlade.name,
                  title: selectedBlade.title,
                  order: selectedBlade.order,
                  surges: selectedBlade.surges,
                  description: selectedBlade.description,
                  books: selectedBlade.books,
                  connections: selectedBlade.connections,
                  status: selectedBlade.status,
                }
              : null
          }
          onClose={handleClose}
        />
      )}

      {/* Taln's message — slow fade, no panel */}
      {focusedId && isTalnFocus && <TalnMessage />}

      {/* Controls legend — bottom left */}
      <ControlsLegend />

      {/* Debug toggle */}
      <div className="fixed bottom-4 right-4" style={{ zIndex: 50 }}>
        <button
          onClick={() => setDebug((d) => !d)}
          className="text-[10px] opacity-30 hover:opacity-100 transition-opacity cursor-pointer"
          style={{
            background: 'rgba(255,235,210,0.05)',
            border: '1px solid rgba(255,235,210,0.1)',
            color: 'rgba(255,235,210,0.5)',
            padding: '4px 10px',
            borderRadius: 4,
            fontFamily: 'monospace',
          }}
        >
          {debug ? 'HIDE DEBUG' : 'DEBUG'}
        </button>
      </div>
    </div>
  )
})

/* Taln's special message — centered, fading in silently */
function TalnMessage() {
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 45 }}>
      <div
        className="animate-fade-in-up"
        style={{
          fontFamily: "'Times New Roman', serif",
          fontSize: 'clamp(18px, 2vw, 28px)',
          color: 'rgba(200, 185, 165, 0.6)',
          fontStyle: 'italic',
          textAlign: 'center',
          maxWidth: 360,
          lineHeight: 1.6,
          letterSpacing: '0.04em',
          textShadow: '0 0 40px rgba(0,0,0,0.8)',
        }}
      >
        His blade was never abandoned.
      </div>
    </div>
  )
}
