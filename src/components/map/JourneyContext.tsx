import { createContext, useContext, useMemo, useCallback } from 'react'
import { PLANETS } from '@/data/static'
import { WORLDHOPPER_MOVEMENTS } from '@/data/static/timeline'
import type { WorldhopperMovement } from '@/data/static/timeline'
import {
  buildJourneySegments,
  interpolatePosition,
  findStopAtProgress,
  computeCurveControlPoint,
  getStopProgressRange,
  getTotalDuration,
  formatJourneyYear,
} from '@/utils/journey'
import type { JourneySegment, InterpolatedPosition } from '@/utils/journey'
import { useAnimationEngine } from '@/hooks/useAnimationEngine'

const PLANET_NAME_MAP = new Map(PLANETS.map((p) => [p.id, p.name]))

export interface JourneyCtxValue {
  worldhopperId: string
  segments: JourneySegment[]
  whData: WorldhopperMovement | null
  displayedProgress: number
  currentStop: number
  pos: InterpolatedPosition
  segmentPaths: string[]
  stopDots: { x: number; y: number }[]
  stopProgresses: { start: number; end: number }[]
  unknown: boolean
  playing: boolean
  currentSpeed: number
  autoPaused: boolean
  handlePlayPause: () => void
  handleReset: () => void
  handleSpeedChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSetProgress: (p: number) => void
  handleSkipPrev: () => void
  handleSkipNext: () => void
  handleSpeedPreset: (speed: number) => void
}

const JourneyCtx = createContext<JourneyCtxValue | null>(null)

export function useJourneyCtx(): JourneyCtxValue {
  const ctx = useContext(JourneyCtx)
  if (!ctx) throw new Error('useJourneyCtx must be used within JourneyProvider')
  return ctx
}

interface ProviderProps {
  worldhopperId: string
  planetMap: Map<string, { x: number; y: number }>
  speed?: number
  onComplete?: () => void
  children: React.ReactNode
}

export function JourneyProvider({
  worldhopperId,
  planetMap,
  speed: defaultSpeed = 1,
  onComplete,
  children,
}: ProviderProps) {
  const segments = useMemo(() => buildJourneySegments(worldhopperId, planetMap), [worldhopperId, planetMap])

  const whData = useMemo(() => WORLDHOPPER_MOVEMENTS.find((wh) => wh.id === worldhopperId) ?? null, [worldhopperId])

  const totalDuration = useMemo(() => segments.reduce((sum, s) => sum + s.duration, 0), [segments])

  const {
    playing,
    currentSpeed,
    autoPaused,
    displayedProgress,
    handlePlayPause,
    handleReset,
    handleSpeedChange,
    handleSetProgress,
  } = useAnimationEngine({
    totalDuration,
    segments,
    findStopAtProgress,
    worldhopperId,
    speed: defaultSpeed,
    onComplete,
  })

  const segmentPaths = useMemo(() => {
    return segments.map((s) => {
      const cp = computeCurveControlPoint(s.from, s.to)
      return `M ${s.from.x} ${s.from.y} Q ${cp.x} ${cp.y} ${s.to.x} ${s.to.y}`
    })
  }, [segments])

  const pos = useMemo(
    () => interpolatePosition(segments, displayedProgress, planetMap),
    [segments, displayedProgress, planetMap],
  )

  const currentStop = useMemo(() => findStopAtProgress(segments, displayedProgress), [segments, displayedProgress])

  const stopDots = useMemo(() => {
    if (segments.length === 0) return []
    const dots: { x: number; y: number }[] = []
    dots.push({ x: segments[0]!.from.x, y: segments[0]!.from.y })
    for (let i = 1; i < segments.length; i++) {
      dots.push({ x: segments[i - 1]!.to.x, y: segments[i - 1]!.to.y })
    }
    return dots
  }, [segments])

  const stopProgresses = useMemo(() => {
    return segments.map((_, i) => getStopProgressRange(segments, i))
  }, [segments])

  const handleSkipPrev = useCallback(() => {
    const prev = Math.max(0, currentStop - 1)
    const range = getStopProgressRange(segments, prev)
    handleSetProgress(range.start)
  }, [currentStop, segments, handleSetProgress])

  const handleSkipNext = useCallback(() => {
    const next = Math.min(segments.length - 1, currentStop + 1)
    const range = getStopProgressRange(segments, next)
    handleSetProgress(range.start)
  }, [currentStop, segments, handleSetProgress])

  const handleSpeedPreset = useCallback(
    (speed: number) => {
      handleSpeedChange({ target: { value: String(speed) } } as React.ChangeEvent<HTMLInputElement>)
    },
    [handleSpeedChange],
  )

  const value = useMemo<JourneyCtxValue>(
    () => ({
      worldhopperId,
      segments,
      whData,
      displayedProgress,
      currentStop,
      pos,
      segmentPaths,
      stopDots,
      stopProgresses,
      unknown: !whData,
      playing,
      currentSpeed,
      autoPaused,
      handlePlayPause,
      handleReset,
      handleSpeedChange,
      handleSetProgress,
      handleSkipPrev,
      handleSkipNext,
      handleSpeedPreset,
    }),
    [
      worldhopperId,
      segments,
      whData,
      displayedProgress,
      currentStop,
      pos,
      segmentPaths,
      stopDots,
      stopProgresses,
      playing,
      currentSpeed,
      autoPaused,
      handlePlayPause,
      handleReset,
      handleSpeedChange,
      handleSetProgress,
      handleSkipPrev,
      handleSkipNext,
      handleSpeedPreset,
    ],
  )

  return <JourneyCtx.Provider value={value}>{children}</JourneyCtx.Provider>
}

export function JourneySvgContent() {
  const { worldhopperId, segmentPaths, currentStop, displayedProgress, pos, stopDots, whData } = useJourneyCtx()

  return (
    <g key={worldhopperId}>
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

      {segmentPaths[currentStop] && displayedProgress > 0 && (
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
      <circle cx={pos.x} cy={pos.y} r={14} fill="none" stroke={whData?.color ?? '#666'} strokeWidth={1} opacity={0.3} />
    </g>
  )
}

export function useJourneyDerived(ctx: JourneyCtxValue) {
  const pct = Math.round(ctx.displayedProgress * 100)
  const yearStr = formatJourneyYear(ctx.pos.currentYear)
  const fromName = PLANET_NAME_MAP.get(ctx.pos.fromPlanet) ?? ctx.pos.fromPlanet
  const toName = PLANET_NAME_MAP.get(ctx.pos.toPlanet) ?? ctx.pos.toPlanet
  const segmentDesc = ctx.segments[ctx.currentStop]?.description ?? ''
  const totalSecs = Math.round(getTotalDuration(ctx.segments) / 1000)
  const elapsedSecs = Math.round(ctx.displayedProgress * totalSecs)
  const timeStr = `${Math.floor(elapsedSecs / 60)}:${String(elapsedSecs % 60).padStart(2, '0')} / ${Math.floor(totalSecs / 60)}:${String(totalSecs % 60).padStart(2, '0')}`
  return { pct, yearStr, fromName, toName, segmentDesc, totalSecs, elapsedSecs, timeStr }
}
