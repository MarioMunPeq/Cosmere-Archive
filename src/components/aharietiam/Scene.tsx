'use client'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSearchParams } from 'react-router-dom'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { HONORBLADES } from '@/data/static/aharietiam'
import BladeField, { bladePlacement } from './BladeField'
import CameraRig from './CameraRig'
import Dust from './Dust'
import FogVolumes from './FogVolumes'
import Ground from './Ground'
import InfoMonolith from './InfoMonolith'
import Ridges from './Ridges'
import SceneCanvas from './SceneCanvas'
import SceneFallback from './SceneFallback'
import SceneLights from './SceneLights'
import SkyDome from './SkyDome'
import StormlightSeep from './StormlightSeep'
import useSceneQuality from './useSceneQuality'

let webglSupport: boolean | null = null

function canUseWebGL(): boolean {
  if (webglSupport !== null) return webglSupport
  if (typeof document === 'undefined') return false
  try {
    const probe = document.createElement('canvas')
    const context = probe.getContext('webgl2') ?? probe.getContext('webgl')
    webglSupport = context !== null
    if (!context) return false
    context.getExtension('WEBGL_lose_context')?.loseContext()
    probe.width = 1
    probe.height = 1
    return true
  } catch {
    webglSupport = false
    return false
  }
}

/**
 * Signals after the first frame has actually been painted, rather than when
 * the renderer is created. Shader compilation can take several seconds on a
 * cold phone; starting the hint timer earlier would consume its window before
 * the reader ever sees the field.
 */
function SceneReadySignal({ onReady }: { onReady: () => void }) {
  const fired = useRef(false)
  const frame = useRef(0)

  useEffect(
    () => () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    },
    [],
  )

  useFrame(() => {
    if (fired.current) return
    fired.current = true
    frame.current = requestAnimationFrame(() => {
      frame.current = 0
      onReady()
    })
  })

  return null
}

const HINT_TIMEOUT = 7200
const SWIPE_DISTANCE = 52

export default memo(function Scene() {
  const { light, reducedMotion, maxDpr } = useSceneQuality()
  const [searchParams, setSearchParams] = useSearchParams()
  const [unsupported] = useState(() => !canUseWebGL())
  const [contextLost, setContextLost] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const [hintVisible, setHintVisible] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [announcement, setAnnouncement] = useState('')
  const swipeStart = useRef<{ x: number; y: number } | null>(null)
  const sceneRootRef = useRef<HTMLDivElement>(null)
  const rootReleaseTimerRef = useRef<number | null>(null)

  const ordered = useMemo(() => [...HONORBLADES].sort((a, b) => a.positionIndex - b.positionIndex), [])
  const selected = useMemo(() => ordered.find((blade) => blade.id === selectedId) ?? null, [ordered, selectedId])
  const focus = useMemo(() => {
    if (!selectedId) return null
    const index = ordered.findIndex((blade) => blade.id === selectedId)
    if (index < 0) return null
    const [x, , z] = bladePlacement(index)
    return { x, z }
  }, [ordered, selectedId])

  /*
   * `?h=` is the shareable address of one Herald. Search and a pasted URL both
   * arrive here; Back/Forward re-selects the blade the reader left. The param is
   * written by `selectBlade` and removed by `stepBack` so the URL always matches
   * the inspection state.
   */
  useEffect(() => {
    const id = searchParams.get('h')
    if (!id) return
    const index = ordered.findIndex((blade) => blade.id === id)
    if (index < 0) return
    setActiveIndex(index)
    setSelectedId(id)
    setHintVisible(false)
  }, [ordered, searchParams])

  const handleContextLost = useCallback(() => setContextLost(true), [])
  const handleSceneReady = useCallback(() => setSceneReady(true), [])
  const handleInteract = useCallback(() => setHintVisible(false), [])

  const selectBlade = useCallback(
    (id: string) => {
      const index = ordered.findIndex((blade) => blade.id === id)
      if (index < 0) return
      const blade = ordered[index]
      if (!blade) return
      setActiveIndex(index)
      setSelectedId(id)
      setHintVisible(false)
      setAnnouncement(
        `${blade.name}, ${blade.title}. ${blade.order}. Blade ${index + 1} of ${ordered.length}. Press Escape to step back.`,
      )
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          next.set('h', id)
          return next
        },
        { replace: true },
      )
    },
    [ordered, setSearchParams],
  )

  const stepBack = useCallback(() => {
    setSelectedId(null)
    setAnnouncement('You have stepped back. The ten blades remain in the ring.')
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.delete('h')
        return next
      },
      { replace: true },
    )
  }, [setSearchParams])

  const cycleBlades = useCallback(
    (direction: 1 | -1) => {
      if (!selectedId) {
        const index = direction > 0 ? 0 : ordered.length - 1
        const blade = ordered[index]
        if (blade) selectBlade(blade.id)
        return
      }
      const index = ordered.findIndex((blade) => blade.id === selectedId)
      if (index < 0) return
      const next = (index + direction + ordered.length) % ordered.length
      const blade = ordered[next]
      if (blade) selectBlade(blade.id)
    },
    [ordered, selectBlade, selectedId],
  )

  useEffect(() => {
    if (!sceneReady) return
    const timer = window.setTimeout(() => setHintVisible(false), HINT_TIMEOUT)
    return () => window.clearTimeout(timer)
  }, [sceneReady])

  /*
   * R3F/WebGL can leave its detached canvas container attached to the scene
   * root until a later GC. The page itself is already gone at this point; drop
   * the retained descendants so only an empty host remains.
   */
  useEffect(() => {
    if (rootReleaseTimerRef.current !== null) {
      window.clearTimeout(rootReleaseTimerRef.current)
      rootReleaseTimerRef.current = null
    }
    const root = sceneRootRef.current
    return () => {
      if (!root) return
      /* Let R3F finish its own 500 ms teardown first. */
      rootReleaseTimerRef.current = window.setTimeout(() => {
        rootReleaseTimerRef.current = null
        if (root.isConnected) return
        root.replaceChildren()
        root.removeAttribute('class')
        root.removeAttribute('style')
      }, 700)
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return

      const target = event.target
      if (target instanceof HTMLElement) {
        if (target.isContentEditable) return
        const tag = target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
        const onControl = target.closest('button, a, [role="button"]')
        if (onControl && (event.key === 'Enter' || event.key === ' ')) return
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          cycleBlades(-1)
          break
        case 'ArrowRight':
          event.preventDefault()
          cycleBlades(1)
          break
        case 'Enter':
          if (!selectedId) {
            event.preventDefault()
            const blade = ordered[activeIndex] ?? ordered[0]
            if (blade) selectBlade(blade.id)
          }
          break
        case 'Escape':
          if (selectedId) {
            event.preventDefault()
            stepBack()
          }
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeIndex, cycleBlades, ordered, selectBlade, selectedId, stepBack])

  if (unsupported || contextLost) {
    return <SceneFallback reason="WebGL is unavailable in this browser, so the field remains a sketch." />
  }

  return (
    <ErrorBoundary fallback={<SceneFallback reason="The field could not be drawn on this device." />}>
      <div
        ref={sceneRootRef}
        data-aharietiam-scene="live"
        data-scene-quality={light ? 'light' : 'full'}
        data-scene-ready={sceneReady ? 'true' : 'false'}
        className="fixed inset-0 overflow-hidden bg-[#141922]"
      >
        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          <SceneCanvas
            light={light}
            maxDpr={maxDpr}
            onContextLost={handleContextLost}
            onPointerMissed={() => {
              if (selectedId) stepBack()
            }}
          >
            <SceneReadySignal onReady={handleSceneReady} />
            <color attach="background" args={['#141922']} />
            <fog attach="fog" args={['#5c4f43', 18, 88]} />
            <CameraRig light={light} reducedMotion={reducedMotion} focus={focus} onInteract={handleInteract} />
            <SceneLights light={light} />
            <SkyDome />
            <Ground light={light} />
            <Ridges light={light} />
            <StormlightSeep reducedMotion={reducedMotion} />
            <BladeField light={light} selectedId={selectedId} onSelect={selectBlade} />
            <FogVolumes light={light} reducedMotion={reducedMotion} />
            <Dust light={light} reducedMotion={reducedMotion} />
          </SceneCanvas>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 2,
            background: `
              radial-gradient(ellipse at 50% 46%, transparent 36%, rgba(8, 8, 12, 0.16) 70%, rgba(8, 8, 12, 0.6) 100%),
              linear-gradient(180deg, rgba(48, 67, 92, 0.14) 0%, transparent 24%, transparent 74%, rgba(132, 86, 50, 0.1) 100%)
            `,
          }}
        />

        {selected && light ? (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 'var(--nav-h, 56px)',
              left: 0,
              right: 0,
              height: '46vh',
              zIndex: 20,
              touchAction: 'none',
              userSelect: 'none',
            }}
            onPointerDown={(event) => {
              swipeStart.current = { x: event.clientX, y: event.clientY }
              event.currentTarget.setPointerCapture(event.pointerId)
            }}
            onPointerUp={(event) => {
              const start = swipeStart.current
              swipeStart.current = null
              if (!start) return
              const dx = event.clientX - start.x
              const dy = event.clientY - start.y
              if (Math.abs(dx) > SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy) * 1.25) {
                cycleBlades(dx < 0 ? 1 : -1)
              }
            }}
            onPointerCancel={() => {
              swipeStart.current = null
            }}
          />
        ) : null}

        <p
          aria-hidden="true"
          className="pointer-events-none absolute bottom-24 left-4 text-[16px] sm:left-8 md:bottom-8"
          style={{
            zIndex: 3,
            maxWidth: 'min(78vw, 620px)',
            padding: '3px 16px 4px 8px',
            marginLeft: -8,
            borderRadius: 2,
            background:
              'linear-gradient(90deg, rgba(7, 8, 11, 0.62) 0%, rgba(7, 8, 11, 0.38) 70%, rgba(7, 8, 11, 0) 100%)',
            fontFamily: 'var(--font-hand)',
            color: 'rgba(246, 236, 220, 0.96)',
            letterSpacing: '0.015em',
            lineHeight: 1.4,
            textShadow: '0 1px 14px rgba(5, 6, 9, 0.95)',
            opacity: hintVisible ? 1 : 0,
            transition: reducedMotion ? 'none' : 'opacity 900ms ease',
          }}
        >
          {light ? 'tap a blade · swipe to turn the ring' : 'drag to look · arrow keys choose · enter opens'}
        </p>

        {selected ? (
          <InfoMonolith
            key={selected.id}
            blade={selected}
            light={light}
            reducedMotion={reducedMotion}
            onClose={stepBack}
          />
        ) : null}

        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {announcement}
        </div>

        <div className="sr-only">
          <h1>Aharietiam — The Ten Blades</h1>
          <p>
            Ten Honorblades stand planted in a ring on a cracked stone rockbed at dusk. The scene may be turned by
            dragging, scrolling, or with plus and minus. Use the left and right arrow keys to choose a blade, Enter to
            open its record, and Escape to step back.
          </p>
          {/*
           * A plain paragraph rather than a named list: Chromium keeps detached
           * named lists alive in its accessibility tree, which retained the
           * whole page after a route change. The names remain fully readable
           * to assistive technology, just without list semantics.
           */}
          <p>
            The ten Honorblades: {ordered.map((blade) => `${blade.name}, ${blade.order}, ${blade.title}`).join('; ')}.
          </p>
        </div>
      </div>
    </ErrorBoundary>
  )
})
