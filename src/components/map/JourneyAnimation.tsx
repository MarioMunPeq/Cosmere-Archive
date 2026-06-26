import { useMemo } from 'react'
import { PLANETS } from '@/data/static'
import { WORLDHOPPER_MOVEMENTS } from '@/data/static/timeline'
import {
  buildJourneySegments,
  interpolatePosition,
  formatJourneyYear,
  findStopAtProgress,
  computeCurveControlPoint,
} from '@/utils/journey'
import { useAnimationEngine } from '@/hooks/useAnimationEngine'

const PLANET_NAME_MAP = new Map(PLANETS.map((p) => [p.id, p.name]))

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

  const { playing, currentSpeed, autoPaused, displayedProgress, handlePlayPause, handleReset, handleSpeedChange } =
    useAnimationEngine({
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

  const unknown = !whData
  const pct = Math.round(displayedProgress * 100)
  const yearStr = formatJourneyYear(pos.currentYear)

  const fromName = PLANET_NAME_MAP.get(pos.fromPlanet) ?? pos.fromPlanet
  const toName = PLANET_NAME_MAP.get(pos.toPlanet) ?? pos.toPlanet
  const segmentDesc = segments[currentStop]?.description ?? ''

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
        className="absolute bottom-20 left-1/2 z-30 w-[90vw] max-w-md -translate-x-1/2 rounded-xl border border-gray-700/60 bg-gray-900/95 p-5 shadow-2xl backdrop-blur-lg sm:bottom-24"
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

            <div className="mb-3 flex items-center gap-3">
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

            <div className="mb-2 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span data-testid="journey-info" className="font-medium text-gray-200">
                  {pos.fromPlanet !== pos.toPlanet ? `${fromName} → ${toName}` : fromName}
                </span>
                <span data-testid="journey-year" className="text-gray-500">
                  {yearStr}
                </span>
              </div>
              <span className="text-xs text-gray-600">{segments.length} segments</span>
            </div>

            {segmentDesc && (
              <p data-testid="journey-description" className="mb-3 text-sm leading-relaxed text-gray-400">
                {segmentDesc}
              </p>
            )}

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
