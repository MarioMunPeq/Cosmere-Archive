import { useState, useRef, useCallback, useEffect } from 'react'
import type { JourneySegment } from '@/utils/journey'

const raf = (cb: FrameRequestCallback): number =>
  typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame(cb) : 0
const caf = (id: number): void => {
  if (typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(id)
}

const AUTO_PAUSE_MS = 2500

interface UseAnimationEngineOptions {
  totalDuration: number
  segments: JourneySegment[]
  findStopAtProgress: (segments: JourneySegment[], progress: number) => number
  worldhopperId: string | null
  speed?: number
  onComplete?: () => void
}

interface UseAnimationEngineReturn {
  playing: boolean
  progress: number
  currentSpeed: number
  autoPaused: boolean
  displayedProgress: number
  handlePlayPause: () => void
  handleReset: () => void
  handleSpeedChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function useAnimationEngine({
  totalDuration,
  segments,
  findStopAtProgress,
  worldhopperId,
  speed: defaultSpeed = 1,
  onComplete,
}: UseAnimationEngineOptions): UseAnimationEngineReturn {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentSpeed, setCurrentSpeed] = useState(defaultSpeed)
  const [autoPaused, setAutoPaused] = useState(false)
  const [renderedWorldhopperId, setRenderedWorldhopperId] = useState(worldhopperId)

  const rafRef = useRef<number>(0)
  const tickRef = useRef<FrameRequestCallback>(() => {})
  const startTimeRef = useRef<number | null>(null)
  const elapsedRef = useRef(0)
  const progressRef = useRef(0)
  const completedRef = useRef(false)
  const playingRef = useRef(false)
  const pauseUntilRef = useRef<number | null>(null)
  const prevStopRef = useRef<number>(-1)
  const userPausedRef = useRef(false)

  const isWorldhopperChanging = renderedWorldhopperId !== worldhopperId
  const displayedProgress = isWorldhopperChanging ? 0 : progress

  useEffect(() => {
    if (!isWorldhopperChanging) return
    progressRef.current = 0
    elapsedRef.current = 0
    startTimeRef.current = null
    completedRef.current = false
    pauseUntilRef.current = null
    prevStopRef.current = -1
    userPausedRef.current = false
    caf(rafRef.current)
    queueMicrotask(() => {
      setRenderedWorldhopperId(worldhopperId)
      setPlaying(false)
      setProgress(0)
      setAutoPaused(false)
    })
  }, [isWorldhopperChanging, worldhopperId])

  const tick = useCallback(
    (timestamp: number) => {
      if (!playingRef.current && pauseUntilRef.current === null) return

      if (pauseUntilRef.current !== null) {
        if (timestamp < pauseUntilRef.current) {
          rafRef.current = raf(tickRef.current)
          return
        }
        pauseUntilRef.current = null
        setAutoPaused(false)
        startTimeRef.current = timestamp
      }

      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp
      }

      const elapsed = elapsedRef.current + (timestamp - startTimeRef.current)
      const adjustedDuration = totalDuration / Math.max(currentSpeed, 0.01)
      const raw = elapsed / adjustedDuration
      const clamped = Math.min(1, raw)

      const stopIdx = findStopAtProgress(segments, clamped)
      if (stopIdx > 0 && stopIdx !== prevStopRef.current && !userPausedRef.current && !completedRef.current) {
        prevStopRef.current = stopIdx
        progressRef.current = clamped
        setProgress(clamped)
        elapsedRef.current = elapsed
        startTimeRef.current = null
        pauseUntilRef.current = timestamp + AUTO_PAUSE_MS
        setAutoPaused(true)
        rafRef.current = raf(tickRef.current)
        return
      }

      progressRef.current = clamped
      setProgress(clamped)

      if (clamped >= 1) {
        elapsedRef.current = elapsed
        startTimeRef.current = null
        setPlaying(false)
        setAutoPaused(false)
        if (!completedRef.current) {
          completedRef.current = true
          onComplete?.()
        }
        return
      }

      rafRef.current = raf(tickRef.current)
    },
    [segments, findStopAtProgress, totalDuration, currentSpeed, onComplete],
  )

  useEffect(() => {
    tickRef.current = tick
  }, [tick])

  useEffect(() => {
    if (playing) {
      userPausedRef.current = false
      pauseUntilRef.current = null
      startTimeRef.current = null
      rafRef.current = raf(tickRef.current)
    } else {
      caf(rafRef.current)
    }
    playingRef.current = playing
    return () => caf(rafRef.current)
  }, [playing])

  const handlePlayPause = useCallback(() => {
    pauseUntilRef.current = null
    setAutoPaused(false)

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
    setAutoPaused(false)
    progressRef.current = 0
    elapsedRef.current = 0
    startTimeRef.current = null
    prevStopRef.current = -1
    completedRef.current = false
    userPausedRef.current = false
    caf(rafRef.current)
  }, [])

  const handleSpeedChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentSpeed(Number(e.target.value))
  }, [])

  return {
    playing,
    progress,
    currentSpeed,
    autoPaused,
    displayedProgress,
    handlePlayPause,
    handleReset,
    handleSpeedChange,
  }
}
