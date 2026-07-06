import { useCallback, useRef, useState, useEffect } from 'react'
import { getPlanetById } from '@/data/static'
import type { WorldhopperMovement } from '@/data/static/timeline'
import { buildJourneySegments } from '@/utils/journey'
import { PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon } from '@/components/common/icons'

interface Props {
  worldhopper: WorldhopperMovement
  planetMap: Map<string, { x: number; y: number }>
  onFlyTo: (planetId: string, x: number, y: number) => void
  onStop: () => void
  onComplete: () => void
}

export default function WorldhopperJourneyPlayer({ worldhopper, planetMap, onFlyTo, onStop, onComplete }: Props) {
  const [playing, setPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [mode, setMode] = useState<'camera' | 'lines'>('camera')
  const pausedRef = useRef(false)
  const stepRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const segments = buildJourneySegments(worldhopper.id, planetMap)
  const totalSteps = segments.length

  const step = useCallback(
    (index: number) => {
      if (index >= totalSteps) {
        onComplete()
        return
      }
      const seg = segments[index]!
      const toPlanet = getPlanetById(seg.toPlanet)
      if (toPlanet) {
        onFlyTo(toPlanet.id, toPlanet.x, toPlanet.y)
      }
      stepRef.current = index
      setCurrentStep(index)
    },
    [segments, totalSteps, onFlyTo, onComplete],
  )

  useEffect(() => {
    if (!playing || pausedRef.current) return
    step(currentStep)
    timerRef.current = setTimeout(() => {
      if (!pausedRef.current) {
        step(currentStep + 1)
      }
    }, 2800)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [playing, currentStep, step])

  const handlePlayPause = useCallback(() => {
    if (playing) {
      pausedRef.current = true
      if (timerRef.current) clearTimeout(timerRef.current)
      setPlaying(false)
      onStop()
    } else {
      pausedRef.current = false
      if (currentStep >= totalSteps) {
        setCurrentStep(0)
        stepRef.current = 0
      }
      setPlaying(true)
    }
  }, [playing, currentStep, totalSteps, onStop])

  const handleSkip = useCallback(
    (dir: 'prev' | 'next') => {
      pausedRef.current = true
      if (timerRef.current) clearTimeout(timerRef.current)
      setPlaying(false)
      const next = dir === 'next' ? Math.min(currentStep + 1, totalSteps - 1) : Math.max(currentStep - 1, 0)
      setCurrentStep(next)
      stepRef.current = next
      const seg = segments[next]
      if (seg) {
        const toPlanet = getPlanetById(seg.toPlanet)
        if (toPlanet) {
          onFlyTo(toPlanet.id, toPlanet.x, toPlanet.y)
        }
      }
      onStop()
    },
    [currentStep, totalSteps, segments, onFlyTo, onStop],
  )

  const stepLabel =
    currentStep < totalSteps
      ? `${segments[currentStep]!.fromPlanet} → ${segments[currentStep]!.toPlanet}`
      : 'Journey complete'

  return (
    <div className="absolute bottom-20 left-1/2 z-30 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-xl border border-purple-700/40 bg-gray-900/90 px-4 py-3 shadow-2xl backdrop-blur-lg">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: worldhopper.color }} />
          <span className="text-xs font-medium text-gray-300">{worldhopper.name}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handleSkip('prev')}
            disabled={currentStep <= 0}
            className="flex h-7 w-7 items-center justify-center rounded text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300 disabled:opacity-30"
            aria-label="Previous step"
          >
            <SkipBackIcon />
          </button>
          <button
            onClick={handlePlayPause}
            className="flex h-7 w-7 items-center justify-center rounded text-purple-400 transition-colors hover:bg-gray-800 hover:text-purple-300"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button
            onClick={() => handleSkip('next')}
            disabled={currentStep >= totalSteps - 1}
            className="flex h-7 w-7 items-center justify-center rounded text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300 disabled:opacity-30"
            aria-label="Next step"
          >
            <SkipForwardIcon />
          </button>
        </div>

        <span className="text-xs text-gray-500">{stepLabel}</span>

        <div className="flex items-center gap-2 border-l border-gray-700/50 pl-3">
          <span className="text-xxs text-gray-600">Mode</span>
          <button
            onClick={() => setMode((m) => (m === 'camera' ? 'lines' : 'camera'))}
            className={`rounded px-2 py-0.5 text-xxs transition-colors ${
              mode === 'camera' ? 'bg-purple-900/40 text-purple-400' : 'bg-gray-800 text-gray-500 hover:text-gray-300'
            }`}
          >
            {mode === 'camera' ? 'Camera' : 'Lines'}
          </button>
        </div>
      </div>
    </div>
  )
}
