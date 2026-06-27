import { useMemo, useCallback } from 'react'
import { PLANETS } from '@/data/static'
import { WORLDHOPPER_MOVEMENTS } from '@/data/static/timeline'
import {
  buildJourneySegments,
  interpolatePosition,
  formatJourneyYear,
  findStopAtProgress,
  computeCurveControlPoint,
  getStopProgressRange,
  getTotalDuration,
} from '@/utils/journey'
import { useAnimationEngine } from '@/hooks/useAnimationEngine'

const PLANET_NAME_MAP = new Map(PLANETS.map((p) => [p.id, p.name]))

const SPEED_PRESETS = [0.5, 1, 2, 5] as const

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
  if (!worldhopperId) return null

  return (
    <JourneyAnimationContent
      worldhopperId={worldhopperId}
      planetMap={planetMap}
      speed={defaultSpeed}
      onComplete={onComplete}
      onClose={onClose}
    />
  )
}

function JourneyAnimationContent({ worldhopperId, planetMap, speed: defaultSpeed = 1, onComplete, onClose }: Props) {
  const segments = useMemo(() => buildJourneySegments(worldhopperId!, planetMap), [worldhopperId, planetMap])

  const whData = useMemo(() => WORLDHOPPER_MOVEMENTS.find((wh) => wh.id === worldhopperId), [worldhopperId])

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

  const unknown = !whData
  const pct = Math.round(displayedProgress * 100)
  const yearStr = formatJourneyYear(pos.currentYear)

  const fromName = PLANET_NAME_MAP.get(pos.fromPlanet) ?? pos.fromPlanet
  const toName = PLANET_NAME_MAP.get(pos.toPlanet) ?? pos.toPlanet
  const segmentDesc = segments[currentStop]?.description ?? ''

  const totalSecs = Math.round(getTotalDuration(segments) / 1000)
  const elapsedSecs = Math.round(displayedProgress * totalSecs)
  const timeStr = `${Math.floor(elapsedSecs / 60)}:${String(elapsedSecs % 60).padStart(2, '0')} / ${Math.floor(totalSecs / 60)}:${String(totalSecs % 60).padStart(2, '0')}`

  return (
    <>
      <svg
        data-testid="journey-svg"
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
        viewBox="0 0 900 600"
        preserveAspectRatio="xMidYMid meet"
      >
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

      <div
        data-testid="journey-controls"
        className="absolute bottom-20 left-1/2 z-30 w-[90vw] max-w-md -translate-x-1/2 rounded-xl border border-gray-700/60 bg-gray-900/95 p-4 shadow-2xl backdrop-blur-lg sm:bottom-24 sm:p-5"
      >
        {unknown ? (
          <p className="text-center text-sm text-gray-500">Unknown worldhopper</p>
        ) : (
          <>
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

            <div className="mb-2 flex items-center gap-2">
              <button
                onClick={handleSkipPrev}
                disabled={currentStop <= 0}
                aria-label="Skip to previous stop"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-xs text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                  <path d="M8 1L3 5l5 4V1zM2 1v8H1V1h1z" />
                </svg>
              </button>

              <button
                onClick={handlePlayPause}
                aria-label={playing || autoPaused ? 'Pause' : 'Play'}
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

              <button
                onClick={handleSkipNext}
                disabled={currentStop >= segments.length - 1}
                aria-label="Skip to next stop"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-xs text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                  <path d="M2 1l5 4-5 4V1zM8 1v8H7V1h1z" />
                </svg>
              </button>

              <div className="flex-1">
                <div className="relative h-2 overflow-hidden rounded-full bg-gray-800">
                  {stopProgresses.map((range, i) => (
                    <div
                      key={i}
                      className="absolute top-0 h-full w-0.5 bg-gray-600"
                      style={{ left: `${range.start * 100}%`, transform: 'translateX(-50%)' }}
                    />
                  ))}
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{ width: `${pct}%`, backgroundColor: whData.color }}
                  />
                </div>
              </div>
              <span data-testid="journey-progress" className="w-10 text-right text-xs text-gray-400">
                {pct}%
              </span>
            </div>

            <div className="mb-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span data-testid="journey-info" className="font-medium text-gray-200">
                  {pos.fromPlanet !== pos.toPlanet ? `${fromName} → ${toName}` : fromName}
                </span>
                <span data-testid="journey-year" className="text-gray-500">
                  {yearStr}
                </span>
              </div>
              <span className="text-gray-600">{timeStr}</span>
            </div>

            {segmentDesc && (
              <p data-testid="journey-description" className="mb-3 text-xs leading-relaxed text-gray-400">
                {segmentDesc}
              </p>
            )}

            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {SPEED_PRESETS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeedPreset(s)}
                    className={`rounded px-2 py-0.5 text-xs transition-colors ${
                      currentSpeed === s
                        ? 'bg-purple-900/40 text-purple-300'
                        : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={currentSpeed}
                onChange={handleSpeedChange}
                aria-label="Speed"
                className="slider h-1 flex-1 cursor-pointer appearance-none rounded-full bg-gray-800 accent-purple-500"
              />
              <span className="w-6 text-right text-xs text-gray-400">{currentSpeed}x</span>
            </div>
          </>
        )}
      </div>
    </>
  )
}
