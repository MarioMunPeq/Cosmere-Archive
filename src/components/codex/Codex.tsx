import { useCallback, useEffect, useState, type ReactNode } from 'react'
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion'
import CodexObject from './CodexObject'
import CodexCover, { type CoverPhase } from './CodexCover'
import PageBlock from './PageBlock'
import Spread from './Spread'
import { hasOpenedCodex, markCodexOpened } from './codex-session'

/**
 * Codex — the physical book used by the Ars Arcanum and the Biographical
 * Archives. This block owns the desk, the cover ceremony and the spread
 * chassis; the content still belongs to the pages that pass it in.
 *
 * Opening sequence (once per session):
 *   420 ms  closed cover resting on the desk
 *   900 ms  leaf turns on rotateY, backface hidden
 *   920 ms  leaf unmounted, leaving a flat, crisp spread
 *
 * Skipping (click, Enter on the cover button, Esc) jumps straight to the open
 * state. Reduced motion starts open and never mounts the cover at all.
 */

type Phase = 'closed' | 'opening' | 'open'

const REST_MS = 420
const TURN_MS = 920

interface Props {
  left: ReactNode
  right: ReactNode
  leftFolio?: string
  rightFolio?: string
  leftHeader?: string
  rightHeader?: string
  rightNoScroll?: boolean
  /** 0 → 1, fraction of the volume already read. Shrinks the page block. */
  progress?: number
  label?: string
}

export default function Codex({
  left,
  right,
  leftFolio,
  rightFolio,
  leftHeader,
  rightHeader,
  rightNoScroll = false,
  progress = 0,
  label = 'Ars Arcanum',
}: Props) {
  const reduced = usePrefersReducedMotion()
  const [phase, setPhase] = useState<Phase>(() => (reduced || hasOpenedCodex() ? 'open' : 'closed'))

  const skip = useCallback(() => {
    markCodexOpened()
    setPhase('open')
  }, [])

  useEffect(() => {
    if (phase !== 'closed') return
    const id = window.setTimeout(() => {
      markCodexOpened()
      setPhase('opening')
    }, REST_MS)
    return () => window.clearTimeout(id)
  }, [phase])

  useEffect(() => {
    if (phase !== 'opening') return
    const id = window.setTimeout(() => setPhase('open'), TURN_MS)
    return () => window.clearTimeout(id)
  }, [phase])

  useEffect(() => {
    if (phase === 'open') return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') skip()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, skip])

  const coverPhase: CoverPhase = phase === 'opening' ? 'opening' : 'closed'

  return (
    <div className="codex" data-phase={phase}>
      <CodexObject>
        <div className="codex-stage">
          <PageBlock progress={progress} label={label}>
            <Spread
              left={left}
              right={right}
              leftFolio={leftFolio}
              rightFolio={rightFolio}
              leftHeader={leftHeader}
              rightHeader={rightHeader}
              rightNoScroll={rightNoScroll}
            />

            {phase !== 'open' && <CodexCover phase={coverPhase} onSkip={skip} />}
          </PageBlock>
        </div>
      </CodexObject>
    </div>
  )
}
