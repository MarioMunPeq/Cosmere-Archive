'use client'
import { memo, useState, useCallback, useRef, useEffect } from 'react'
import SceneCanvas from './SceneCanvas'
import Platform3D from './Platform3D'
import BladeRing from './BladeRing'
import SceneLights from './SceneLights'
import Atmosphere from './Atmosphere'
import Particles from './Particles'
import InfoMonolith from './InfoMonolith'
import HeraldSymbol from './HeraldSymbol'
import ControlsLegend from './ControlsLegend'
import DebugAharietiam from './DebugAharietiam'
import { HONORBLADES } from '@/data/static/aharietiam'
import CameraRig from './CameraRig'
import type { FocusTarget } from './CameraRig'
import type { SoundEvents } from './CameraRig'
import type { HonorbladeData } from '@/types/aharietiam'

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
  const [inspectPhase, setInspectPhase] = useState<'idle' | 'entering' | 'inspecting' | 'exiting'>('idle')

  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null)
  const inspectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    setInspectPhase('entering')
  }, [])

  const handleFlySettled = useCallback(() => {
    setFocusedId(selectedId)
    setInspectPhase('inspecting')
  }, [selectedId])

  const handleClose = useCallback(() => {
    if (focusedId && focusedId !== 'talenel') {
      SOUND_EVENTS.onLeaveSword?.()
    }
    setInspectPhase('exiting')
    /* Delay clearing state to allow exit animation */
    setTimeout(() => {
      setFocusedId(null)
      setSelectedId(null)
      setFocusTarget(null)
      setInspectPhase('idle')
    }, 300)
  }, [focusedId])

  /* Cleanup timer on unmount */
  useEffect(() => {
    const timer = inspectTimerRef.current
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [])

  const selectedBlade: HonorbladeData | null = selectedId
    ? (HONORBLADES.find((h) => h.id === selectedId) ?? null)
    : null

  const isFocusMode = !!(focusedId !== null)
  const isTalnFocus = focusedId === 'talenel'
  const showInspectUI = !!(inspectPhase === 'inspecting' && focusedId && focusedId === selectedId)

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

          {/* Herald symbol projection behind focused blade */}
          {selectedBlade && (
            <HeraldSymbol
              id={selectedBlade.id}
              color={selectedBlade.color}
              bladePosition={getBladePos(selectedBlade.id)}
              focused={showInspectUI}
            />
          )}
        </SceneCanvas>
      </div>

      {/* Particles overlay — slows down in focus mode */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 3,
          opacity: isFocusMode ? 0.3 : 1,
          transition: 'opacity 1.5s ease',
        }}
      >
        <Particles />
      </div>

      {/* Focus dimmer — darkens scene */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 4,
          background: 'rgba(0,0,0,0.3)',
          opacity: isFocusMode ? 1 : 0,
          transition: 'opacity 0.8s ease',
          pointerEvents: isFocusMode ? 'auto' : 'none',
        }}
      />

      {/* Left side — carved stone manuscript */}
      {showInspectUI && !isTalnFocus && selectedBlade && <InfoMonolith blade={selectedBlade} onClose={handleClose} />}

      {/* Right side — large serif quote */}
      {showInspectUI && !isTalnFocus && selectedBlade && (
        <div
          className="fixed pointer-events-none select-none"
          style={{
            zIndex: 44,
            right: 'clamp(32px, 5vw, 64px)',
            top: '50%',
            transform: 'translateY(-50%)',
            maxWidth: 'clamp(240px, 22vw, 340px)',
            textAlign: 'right',
            fontFamily: "'Times New Roman', 'Georgia', serif",
            opacity: 0,
            animation: 'quoteReveal 1.2s ease 1.0s forwards',
          }}
        >
          <div
            style={{
              fontSize: 'clamp(20px, 1.8vw, 28px)',
              lineHeight: 1.4,
              color: 'rgba(200, 185, 165, 0.35)',
              fontStyle: 'italic',
              letterSpacing: '0.02em',
            }}
          >
            &ldquo;{selectedBlade.quote}&rdquo;
          </div>
        </div>
      )}

      {/* Taln special message */}
      {isTalnFocus && <TalnMessage />}

      {/* Controls legend */}
      <ControlsLegend />
      {isFocusMode && <ReturnButton onClose={handleClose} />}

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

/* Return button — top-right during focus */
function ReturnButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      className="fixed cursor-pointer pointer-events-auto select-none z-50"
      style={{
        top: 'clamp(16px, 2.5vw, 28px)',
        right: 'clamp(16px, 2.5vw, 28px)',
        background: 'rgba(170,140,100,0.06)',
        border: '1px solid rgba(170,140,100,0.12)',
        color: 'rgba(200,185,165,0.4)',
        padding: '6px 16px',
        borderRadius: 4,
        fontFamily: "'Times New Roman', serif",
        fontSize: 'clamp(11px, 0.7vw, 13px)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(170,140,100,0.12)'
        e.currentTarget.style.color = 'rgba(200,185,165,0.6)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(170,140,100,0.06)'
        e.currentTarget.style.color = 'rgba(200,185,165,0.4)'
      }}
    >
      Return
    </button>
  )
}

/* Taln — two sentences, silent reverence */
function TalnMessage() {
  const [showFirst, setShowFirst] = useState(false)
  const [showSecond, setShowSecond] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowFirst(true), 1000)
    const t2 = setTimeout(() => setShowSecond(true), 4000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 flex items-center justify-center pointer-events-none select-none"
      style={{ zIndex: 45 }}
    >
      <div
        style={{
          fontFamily: "'Times New Roman', serif",
          textAlign: 'center',
          maxWidth: 400,
          lineHeight: 1.6,
          letterSpacing: '0.04em',
          textShadow: '0 0 60px rgba(0,0,0,0.9)',
        }}
      >
        <div
          style={{
            fontSize: 'clamp(18px, 2vw, 26px)',
            color: 'rgba(200, 185, 165, 0.5)',
            fontStyle: 'italic',
            opacity: showFirst ? 1 : 0,
            transition: 'opacity 1.5s ease',
            marginBottom: 16,
          }}
        >
          His blade was never abandoned.
        </div>
        <div
          style={{
            fontSize: 'clamp(16px, 1.8vw, 24px)',
            color: 'rgba(200, 185, 165, 0.35)',
            fontStyle: 'italic',
            opacity: showSecond ? 1 : 0,
            transition: 'opacity 1.5s ease',
          }}
        >
          The bearer never broke.
        </div>
      </div>
    </div>
  )
}
