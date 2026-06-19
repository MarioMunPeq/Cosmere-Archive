import { useMemo, useRef, useState, useCallback, useEffect } from 'react'

const raf = (cb: FrameRequestCallback): number =>
  typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame(cb) : 0
const caf = (id: number): void => {
  if (typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(id)
}
import { PLANETS } from '@/data/static'
import { WORLDHOPPER_MOVEMENTS } from '@/data/static/timeline'
import {
  buildJourneySegments,
  interpolatePosition,
  formatJourneyYear,
  findStopAtProgress,
  computeCurveControlPoint,
} from '@/utils/journey'

const PLANET_NAME_MAP = new Map(PLANETS.map(p => [p.id, p.name]))

const AUTO_PAUSE_MS = 2500

interface Props {
  worldhopperId: string | null
  planetMap: Map<string, { x: number; y: number }>
  speed?: number
  onComplete?: () => void
  onClose?: () => void
}

export default function JourneyAnimation({
  worldhopperId,
  planetMap,
  speed: defaultSpeed = 1,
  onComplete,
  onClose,
}: Props) {
  const segments = useMemo(
    () => buildJourneySegments(worldhopperId ?? '', planetMap),
    [worldhopperId, planetMap],
  )

  const whData = useMemo(
    () => WORLDHOPPER_MOVEMENTS.find(wh => wh.id === worldhopperId),
    [worldhopperId],
  )

  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentSpeed, setCurrentSpeed] = useState(defaultSpeed)

  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number | null>(null)
  const elapsedRef = useRef(0)
  const progressRef = useRef(0)
  const completedRef = useRef(false)
  const playingRef = useRef(false)
  const pauseUntilRef = useRef<number | null>(null)
  const prevStopRef = useRef<number>(-1)
  const userPausedRef = useRef(false)

  const totalDuration = useMemo(
    () => segments.reduce((sum, s) => sum + s.duration, 0),
    [segments],
  )

  // Reset when worldhopper changes
  useEffect(() => {
    setPlaying(false)
    setProgress(0)
    progressRef.current = 0
    elapsedRef.current = 0
    startTimeRef.current = null
    completedRef.current = false
    pauseUntilRef.current = null
    prevStopRef.current = -1
    userPausedRef.current = false
    caf(rafRef.current)
  }, [worldhopperId])

  const tick = useCallback(
    (timestamp: number) => {
      // Don't advance during user pause
      if (!playingRef.current && pauseUntilRef.current === null) return

      // If in auto-pause, check if it's time to resume
      if (pauseUntilRef.current !== null) {
        if (timestamp < pauseUntilRef.current) {
          rafRef.current = raf(tick)
          return
        }
        pauseUntilRef.current = null
        startTimeRef.current = timestamp
      }

      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp
      }

      const elapsed = elapsedRef.current + (timestamp - startTimeRef.current)
      const adjustedDuration = totalDuration / Math.max(currentSpeed, 0.01)
      const raw = elapsed / adjustedDuration
      const clamped = Math.min(1, raw)

      // Detect planet arrival for auto-pause (not the first planet, not user-paused)
      const stopIdx = findStopAtProgress(segments, clamped)
      if (stopIdx > 0 && stopIdx !== prevStopRef.current && !userPausedRef.current && !completedRef.current) {
        prevStopRef.current = stopIdx
        progressRef.current = clamped
        setProgress(clamped)
        elapsedRef.current = elapsed
        startTimeRef.current = null
        pauseUntilRef.current = timestamp + AUTO_PAUSE_MS
        rafRef.current = raf(tick)
        return
      }

      progressRef.current = clamped
      setProgress(clamped)

      if (clamped >= 1) {
        elapsedRef.current = elapsed
        startTimeRef.current = null
        setPlaying(false)
        if (!completedRef.current) {
          completedRef.current = true
          onComplete?.()
        }
        return
      }

      rafRef.current = raf(tick)
    },
    [segments, totalDuration, currentSpeed, onComplete],
  )

  useEffect(() => {
    if (playing) {
      userPausedRef.current = false
      pauseUntilRef.current = null
      startTimeRef.current = null
      rafRef.current = raf(tick)
    } else {
      caf(rafRef.current)
    }
    playingRef.current = playing
    return () => caf(rafRef.current)
  }, [playing, tick])

  const handlePlayPause = useCallback(() => {
    pauseUntilRef.current = null

    if (completedRef.current) {
      progressRef.current = 0
      setProgress(0)
      elapsedRef.current = 0
      startTimeRef.current = null
      prevStopRef.current = -1
      completedRef.current = false
      setPlaying(true)
      return
    }

    if (playingRef.current) {
      userPausedRef.current = true
      elapsedRef.current += performance.now() - (startTimeRef.current ?? performance.now())
      startTimeRef.current = null
      setPlaying(false)
    } else {
      setPlaying(true)
    }
  }, [])

  const handleReset = useCallback(() => {
    pauseUntilRef.current = null
    setPlaying(false)
    setProgress(0)
    progressRef.current = 0
    elapsedRef.current = 0
    startTimeRef.current = null
    prevStopRef.current = -1
    completedRef.current = false
    userPausedRef.current = false
    caf(rafRef.current)
  }, [])

  const handleSpeedChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentSpeed(Number(e.target.value))
    },
    [],
  )

  const segmentPaths = useMemo(() => {
    return segments.map((s) => {
      const cp = computeCurveControlPoint(s.from, s.to)
      return `M ${s.from.x} ${s.from.y} Q ${cp.x} ${cp.y} ${s.to.x} ${s.to.y}`
    })
  }, [segments])

  const pos = useMemo(
    () => interpolatePosition(segments, progress, planetMap),
    [segments, progress, planetMap],
  )

  const currentStop = useMemo(
    () => findStopAtProgress(segments, progress),
    [segments, progress],
  )

  const stopDots = useMemo(() => {
    if (segments.length === 0) return []
    const dots: { x: number; y: number }[] = []
    dots.push({ x: segments[0]!.from.x, y: segments[0]!.from.y })
    for (let i = 1; i < segments.length; i++) {
      dots.push({ x: segments[i - 1]!.to.x, y: segments[i - 1]!.to.y })
    }
    return dots
  }, [segments])

  if (!worldhopperId) return null

  const unknown = !whData
  const pct = Math.round(progress * 100)
  const yearStr = formatJourneyYear(pos.currentYear)

  const fromName = PLANET_NAME_MAP.get(pos.fromPlanet) ?? pos.fromPlanet
  const toName = PLANET_NAME_MAP.get(pos.toPlanet) ?? pos.toPlanet
  const segmentDesc = segments[currentStop]?.description ?? ''
  const isAutoPaused = pauseUntilRef.current !== null && !playing

  return (
    <>
      {/* SVG overlay */}
      <svg
        data-testid="journey-svg"
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
        viewBox="0 0 900 600"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Untraveled paths (future segments: dashed) */}
        {segmentPaths.map((d, i) =>
          i > currentStop ? (
            <path
              key={i}
              data-testid="journey-untraveled-path"
              d={d}
              fill="none"
              stroke={whData?.color ?? '#666'}
              strokeWidth="1.5"
              strokeDasharray="6 4"
              opacity={0.2}
            />
          ) : null,
        )}

        {/* Completed paths (fully traveled: solid) */}
        {segmentPaths.map((d, i) =>
          i < currentStop ? (
            <path
              key={i}
              data-testid="journey-traced-path-done"
              d={d}
              fill="none"
              stroke={whData?.color ?? '#666'}
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity={0.7}
              style={{ filter: `drop-shadow(0 0 3px ${whData?.color ?? '#666'}60)` }}
            />
          ) : null,
        )}

        {/* Current segment (partially traveled) — bezier-aligned */}
        {segmentPaths[currentStop] && progress > 0 && (
          <path
            data-testid="journey-traced-path"
            d={segmentPaths[currentStop]}
            fill="none"
            stroke={whData?.color ?? '#666'}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity={0.85}
            strokeDasharray={`${pos.segmentProgress * 1000} 1000`}
            style={{ filter: `drop-shadow(0 0 4px ${whData?.color ?? '#666'}80)` }}
          />
        )}

        {/* Stop dots */}
        {stopDots.map((dot, i) => (
          <circle
            key={i}
            data-testid="journey-stop"
            cx={dot.x}
            cy={dot.y}
            r={4}
            fill={whData?.color ?? '#666'}
            opacity={i <= currentStop ? 1 : 0.35}
            stroke="#111"
            strokeWidth={1}
          />
        ))}

        {/* Animated marker — on the bezier path now */}
        <circle
          data-testid="journey-marker"
          cx={pos.x}
          cy={pos.y}
          r={8}
          fill={whData?.color ?? '#666'}
          stroke="#000"
          strokeWidth={2}
          opacity={0.95}
          style={{ filter: `drop-shadow(0 0 6px ${whData?.color ?? '#666'})` }}
        />
        <circle
          cx={pos.x}
          cy={pos.y}
          r={14}
          fill="none"
          stroke={whData?.color ?? '#666'}
          strokeWidth={1}
          opacity={0.3}
        />
      </svg>

      {/* Controls panel */}
      <div
        data-testid="journey-controls"
        className="absolute bottom-20 left-1/2 z-30 w-[90vw] max-w-md -translate-x-1/2 rounded-xl border border-gray-700/60 bg-gray-900/95 p-5 shadow-2xl backdrop-blur-lg sm:bottom-24"
      >
        {unknown ? (
          <p className="text-center text-sm text-gray-500">Unknown worldhopper</p>
        ) : (
          <>
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: whData.color }} />
                <span className="text-base font-bold text-gray-100">{whData.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleReset}
                  aria-label="Reset journey"
                  className="rounded px-2.5 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
                >
                  Reset
                </button>
                <button
                  onClick={onClose}
                  aria-label="Close journey"
                  className="rounded px-2.5 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Play/Pause + Progress */}
            <div className="mb-3 flex items-center gap-3">
              <button
                onClick={handlePlayPause}
                aria-label={playing || isAutoPaused ? 'Pause' : 'Play'}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white transition-colors hover:bg-purple-500"
              >
                {playing ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <rect x="2" y="1" width="3.5" height="12" rx="0.5" />
                    <rect x="8.5" y="1" width="3.5" height="12" rx="0.5" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <path d="M3 1l10 6-10 6V1z" />
                  </svg>
                )}
              </button>

              {/* Progress bar */}
              <div className="flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{ width: `${pct}%`, backgroundColor: whData.color }}
                  />
                </div>
              </div>
              <span data-testid="journey-progress" className="w-10 text-right text-sm text-gray-400">
                {pct}%
              </span>
            </div>

            {/* Info rows */}
            <div className="mb-2 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span data-testid="journey-info" className="font-medium text-gray-200">
                  {pos.fromPlanet !== pos.toPlanet ? `${fromName} → ${toName}` : fromName}
                </span>
                <span data-testid="journey-year" className="text-gray-500">
                  {yearStr}
                </span>
              </div>
              <span className="text-xs text-gray-600">
                {segments.length} segments
              </span>
            </div>

            {/* Description */}
            {segmentDesc && (
              <p data-testid="journey-description" className="mb-3 text-sm leading-relaxed text-gray-400">
                {segmentDesc}
              </p>
            )}

            {/* Speed slider */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">0.5x</span>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={currentSpeed}
                onChange={handleSpeedChange}
                aria-label="Speed"
                className="slider h-1 w-full cursor-pointer appearance-none rounded-full bg-gray-800 accent-purple-500"
              />
              <span className="text-xs text-gray-600">5x</span>
              <span className="ml-1 w-6 text-right text-sm text-gray-400">{currentSpeed}x</span>
            </div>
          </>
        )}
      </div>
    </>
  )
}
