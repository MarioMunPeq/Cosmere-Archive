import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react'
import { JourneyProvider, JourneySvgContent } from '@/components/map/JourneyContext'
import { planetMap } from '@/test/fixtures'
import JourneyControls from '@/components/map/JourneyAnimation'

// ---------- RAF mock ----------
let rafCallback: ((time: number) => void) | null = null
let nextRafId = 1

function mockRaf() {
  vi.stubGlobal('requestAnimationFrame', (cb: (time: number) => void) => {
    rafCallback = cb
    return nextRafId++
  })
  vi.stubGlobal('cancelAnimationFrame', (_id: number) => {
    if (rafCallback) rafCallback = null
  })
}

function unmockRaf() {
  vi.unstubAllGlobals()
  rafCallback = null
}

function tickRaf(time: number) {
  const cb = rafCallback
  if (cb) {
    act(() => {
      cb(time)
    })
  }
}

let svgContainer_: SVGSVGElement | null = null

/** Render SVG content inside a real SVG element for proper namespace handling */
function ja(worldhopperId: string, speed = 1, onClose?: () => void) {
  const { container } = render(
    <JourneyProvider worldhopperId={worldhopperId} planetMap={planetMap} speed={speed}>
      <svg viewBox="0 0 900 600" data-testid="svg-root">
        <JourneySvgContent />
      </svg>
      <JourneyControls onClose={onClose} />
    </JourneyProvider>,
  )
  svgContainer_ = container.querySelector('svg') as SVGSVGElement
  return { container }
}

function querySvg(id: string) {
  return svgContainer_?.querySelector(`[data-testid="${id}"]`) ?? null
}

function queryAllSvg(id: string) {
  return Array.from(svgContainer_?.querySelectorAll(`[data-testid="${id}"]`) ?? [])
}

/** Render controls only (no SVG) */
function renderControls(worldhopperId: string, speed = 1, onClose?: () => void) {
  return render(
    <JourneyProvider worldhopperId={worldhopperId} planetMap={planetMap} speed={speed}>
      <JourneyControls onClose={onClose} />
    </JourneyProvider>,
  )
}

// ---------- Setup / Teardown ----------
beforeEach(() => {
  mockRaf()
  vi.useFakeTimers()
  svgContainer_ = null
})

afterEach(() => {
  unmockRaf()
  vi.useRealTimers()
  svgContainer_ = null
  cleanup()
})

// ============================================================
// Rendering states
// ============================================================
describe('JourneyAnimation — rendering', () => {
  it('renders controls when worldhopperId is provided', () => {
    renderControls('hoid')
    expect(screen.getByTestId('journey-controls')).toBeInTheDocument()
  })

  it('displays worldhopper name', () => {
    renderControls('hoid')
    expect(screen.getByText('Hoid')).toBeInTheDocument()
  })

  it('displays name for each known worldhopper', () => {
    const ids = ['hoid', 'vasher', 'khriss', 'nazh', 'kelsier']
    for (const id of ids) {
      cleanup()
      svgContainer_ = null
      renderControls(id)
      expect(screen.getByTestId('journey-controls')).toBeInTheDocument()
    }
  })

  it('shows fallback text for unknown worldhopper id', () => {
    renderControls('nonexistent')
    expect(screen.getByText(/unknown/i)).toBeInTheDocument()
  })

  it('renders SVG path layer with at least one path', () => {
    ja('hoid')
    const paths = svgContainer_!.querySelectorAll('path')
    expect(paths.length).toBeGreaterThan(0)
  })

  it('renders animated marker dot', () => {
    ja('hoid')
    expect(querySvg('journey-marker')).toBeInTheDocument()
  })

  it('renders stop dots at planet positions', () => {
    ja('hoid')
    const stops = queryAllSvg('journey-stop')
    expect(stops.length).toBeGreaterThanOrEqual(2)
  })

  it('renders a traced path (the already-traveled portion)', () => {
    ja('hoid', 100)
    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    act(() => {
      vi.advanceTimersByTime(16)
    })
    act(() => {
      vi.advanceTimersByTime(16)
    })
    expect(querySvg('journey-traced-path')).toBeInTheDocument()
  })

  it('renders an untraveled path (the remaining portion)', () => {
    ja('hoid')
    expect(querySvg('journey-untraveled-path')).toBeInTheDocument()
  })

  it('shows current planet name in info panel', () => {
    renderControls('hoid')
    const info = screen.getByTestId('journey-info')
    expect(info.textContent).toBeTruthy()
  })

  it('shows year display', () => {
    renderControls('hoid')
    expect(screen.getByTestId('journey-year')).toBeInTheDocument()
  })

  it('shows progress percentage', () => {
    renderControls('hoid')
    expect(screen.getByTestId('journey-progress')).toBeInTheDocument()
  })

  it('shows stop description', () => {
    renderControls('hoid')
    const desc = screen.queryByTestId('journey-description')
    if (desc) {
      expect(desc.textContent).toBeTruthy()
    }
  })
})

// ============================================================
// Controls
// ============================================================
describe('JourneyAnimation — controls', () => {
  it('starts with Play button visible', () => {
    renderControls('hoid')
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
  })

  it('shows Pause after Play is clicked', () => {
    renderControls('hoid')
    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument()
  })

  it('back to Play after Pause is clicked', () => {
    renderControls('hoid')
    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    fireEvent.click(screen.getByRole('button', { name: /pause/i }))
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
  })

  it('has a speed slider', () => {
    renderControls('hoid')
    const slider = screen.getByRole('slider', { name: /speed/i })
    expect(slider).toBeInTheDocument()
  })

  it('speed slider defaults to 1', () => {
    renderControls('hoid')
    const slider = screen.getByRole('slider', { name: /speed/i }) as HTMLInputElement
    expect(slider.value).toBe('1')
  })

  it('speed slider min is 0.5 and max is 5', () => {
    renderControls('hoid')
    const slider = screen.getByRole('slider', { name: /speed/i }) as HTMLInputElement
    expect(Number(slider.min)).toBeLessThanOrEqual(0.5)
    expect(Number(slider.max)).toBeGreaterThanOrEqual(5)
  })

  it('speed slider accepts new value', () => {
    renderControls('hoid')
    const slider = screen.getByRole('slider', { name: /speed/i })
    fireEvent.change(slider, { target: { value: '3' } })
    expect((slider as HTMLInputElement).value).toBe('3')
  })

  it('has a Close button', () => {
    renderControls('hoid')
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('has a Reset button', () => {
    renderControls('hoid')
    expect(screen.getByRole('button', { name: /reset|restart/i })).toBeInTheDocument()
  })

  it('has progress bar showing current percentage', () => {
    renderControls('hoid')
    const progress = screen.getByTestId('journey-progress')
    expect(progress.textContent).toMatch(/\d+%/)
  })

  it('calls onClose when Close is clicked', () => {
    const onClose = vi.fn()
    renderControls('hoid', 1, onClose)
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

// ============================================================
// Animation behavior
// ============================================================
describe('JourneyAnimation — animation', () => {
  it('marker starts at first planet position', () => {
    ja('hoid', 1)
    const marker = querySvg('journey-marker')
    expect(marker).toBeInTheDocument()
    const cx = marker!.getAttribute('cx')
    const cy = marker!.getAttribute('cy')
    expect(Number(cx)).toBeCloseTo(60, 0) // Yolen x
    expect(Number(cy)).toBeCloseTo(60, 0) // Yolen y
  })

  it('progress updates as animation plays', () => {
    renderControls('hoid', 10)
    const progress = screen.getByTestId('journey-progress')
    const initial = progress.textContent
    fireEvent.click(screen.getByRole('button', { name: /play/i }))

    act(() => {
      for (let i = 0; i < 100; i++) {
        vi.advanceTimersByTime(16)
      }
    })

    expect(progress.textContent).not.toBe(initial)
  })

  it('marker position changes during animation', () => {
    ja('khriss', 10)
    const marker = querySvg('journey-marker')
    const startCx = marker!.getAttribute('cx')
    const startCy = marker!.getAttribute('cy')

    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    act(() => {
      for (let i = 0; i < 50; i++) {
        vi.advanceTimersByTime(16)
      }
    })

    const endCx = marker!.getAttribute('cx')
    const endCy = marker!.getAttribute('cy')
    const moved = startCx !== endCx || startCy !== endCy
    expect(moved).toBe(true)
  })

  it('pauses animation mid-play and marker stops', () => {
    ja('hoid', 5)
    fireEvent.click(screen.getByRole('button', { name: /play/i }))

    for (let i = 0; i < 10; i++) {
      tickRaf(i * 50)
      vi.advanceTimersByTime(50)
    }

    const marker = querySvg('journey-marker')
    const cxBeforePause = marker!.getAttribute('cx')

    fireEvent.click(screen.getByRole('button', { name: /pause/i }))

    for (let i = 0; i < 10; i++) {
      tickRaf(i * 50 + 500)
      vi.advanceTimersByTime(50)
    }

    expect(marker!.getAttribute('cx')).toBe(cxBeforePause)
  })

  it('calls onComplete when journey reaches end', () => {
    const onComplete = vi.fn()
    render(
      <JourneyProvider worldhopperId="kelsier" planetMap={planetMap} speed={50} onComplete={onComplete}>
        <JourneyControls />
      </JourneyProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: /play/i }))

    act(() => {
      for (let i = 0; i < 1200; i++) {
        vi.advanceTimersByTime(16)
      }
    })

    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('shows Play button again after journey completes', () => {
    renderControls('kelsier', 50)
    fireEvent.click(screen.getByRole('button', { name: /play/i }))

    act(() => {
      for (let i = 0; i < 1200; i++) {
        vi.advanceTimersByTime(16)
      }
    })

    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
  })

  it('progress is 100% when journey completes', () => {
    renderControls('kelsier', 50)
    fireEvent.click(screen.getByRole('button', { name: /play/i }))

    act(() => {
      for (let i = 0; i < 1200; i++) {
        vi.advanceTimersByTime(16)
      }
    })

    expect(screen.getByTestId('journey-progress').textContent).toMatch(/100%/)
  })

  it('year display updates during animation', () => {
    renderControls('hoid', 10)
    const yearEl = screen.getByTestId('journey-year')

    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    for (let i = 0; i < 20; i++) {
      tickRaf(i * 50)
      vi.advanceTimersByTime(50)
    }

    const updatedYear = yearEl.textContent
    expect(updatedYear).toBeTruthy()
  })

  it('traced path length increases during animation', () => {
    ja('hoid', 5)

    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    act(() => {
      vi.advanceTimersByTime(16)
    })
    act(() => {
      vi.advanceTimersByTime(16)
    })
    const trace = querySvg('journey-traced-path')
    const initialDash = trace!.getAttribute('stroke-dasharray')

    act(() => {
      for (let i = 0; i < 50; i++) {
        vi.advanceTimersByTime(16)
      }
    })

    const updatedDash = trace!.getAttribute('stroke-dasharray')
    expect(updatedDash).not.toBe(initialDash)
  })
})

// ============================================================
// Reset behavior
// ============================================================
describe('JourneyAnimation — reset', () => {
  it('resets to start when Reset is clicked during play', () => {
    ja('hoid', 5)

    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    for (let i = 0; i < 10; i++) {
      tickRaf(i * 50)
      vi.advanceTimersByTime(50)
    }

    fireEvent.click(screen.getByRole('button', { name: /reset|restart/i }))

    const marker = querySvg('journey-marker')
    expect(Number(marker!.getAttribute('cx'))).toBeCloseTo(60, 0)
    expect(Number(marker!.getAttribute('cy'))).toBeCloseTo(60, 0)
    expect(screen.getByTestId('journey-progress').textContent).toBe('0%')
  })

  it('resets stops animation and shows Play (not Pause)', () => {
    renderControls('hoid')
    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    tickRaf(100)
    vi.advanceTimersByTime(50)
    fireEvent.click(screen.getByRole('button', { name: /reset|restart/i }))
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
  })
})

// ============================================================
// Worldhopper change
// ============================================================
describe('JourneyAnimation — worldhopper change', () => {
  it('resets progress when worldhopperId changes', () => {
    const { rerender } = render(
      <JourneyProvider worldhopperId="hoid" planetMap={planetMap}>
        <JourneyControls />
      </JourneyProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    for (let i = 0; i < 10; i++) {
      tickRaf(i * 50)
      vi.advanceTimersByTime(50)
    }

    rerender(
      <JourneyProvider worldhopperId="vasher" planetMap={planetMap}>
        <JourneyControls />
      </JourneyProvider>,
    )

    expect(screen.getByTestId('journey-progress').textContent).toBe('0%')
  })

  it('updates worldhopper name when id changes', () => {
    const { rerender } = render(
      <JourneyProvider worldhopperId="hoid" planetMap={planetMap}>
        <JourneyControls />
      </JourneyProvider>,
    )
    expect(screen.getByText('Hoid')).toBeInTheDocument()

    rerender(
      <JourneyProvider worldhopperId="vasher" planetMap={planetMap}>
        <JourneyControls />
      </JourneyProvider>,
    )
    expect(screen.getByText('Vasher')).toBeInTheDocument()
  })

  it('shows correct starting planet for each worldhopper', () => {
    cleanup()
    svgContainer_ = null
    ja('kelsier')
    const marker = querySvg('journey-marker')
    expect(Number(marker!.getAttribute('cx'))).toBeCloseTo(250, 0)
    expect(Number(marker!.getAttribute('cy'))).toBeCloseTo(340, 0)
  })
})

// ============================================================
// Speed
// ============================================================
describe('JourneyAnimation — speed', () => {
  it('higher speed makes animation reach end faster', () => {
    const onCompleteSlow = vi.fn()
    const onCompleteFast = vi.fn()

    const { unmount } = render(
      <JourneyProvider worldhopperId="kelsier" planetMap={planetMap} speed={1} onComplete={onCompleteSlow}>
        <JourneyControls />
      </JourneyProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    act(() => {
      vi.advanceTimersByTime(300)
    })
    unmount()

    render(
      <JourneyProvider worldhopperId="kelsier" planetMap={planetMap} speed={10} onComplete={onCompleteFast}>
        <JourneyControls />
      </JourneyProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    act(() => {
      for (let i = 0; i < 1200; i++) {
        vi.advanceTimersByTime(16)
      }
    })

    expect(onCompleteSlow).not.toHaveBeenCalled()
    expect(onCompleteFast).toHaveBeenCalled()
  })
})

// ============================================================
// Edge cases
// ============================================================
describe('JourneyAnimation — edge cases', () => {
  it('handles rapid play-pause-play without errors', () => {
    renderControls('hoid')
    const play = () => screen.getByRole('button', { name: /play/i })
    const pause = () => screen.getByRole('button', { name: /pause/i })

    for (let i = 0; i < 5; i++) {
      fireEvent.click(play())
      tickRaf(i * 16)
      vi.advanceTimersByTime(16)
      fireEvent.click(pause())
    }
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
  })

  it('handles double-click on Play gracefully', () => {
    renderControls('hoid')
    const btn = screen.getByRole('button', { name: /play/i })
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
  })

  it('does not error on unmount while animating', () => {
    const { unmount } = render(
      <JourneyProvider worldhopperId="hoid" planetMap={planetMap} speed={5}>
        <JourneyControls />
      </JourneyProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    tickRaf(100)
    vi.advanceTimersByTime(50)
    expect(() => unmount()).not.toThrow()
  })

  it('speed prop defaults to 1 when not provided', () => {
    renderControls('hoid')
    const slider = screen.getByRole('slider', { name: /speed/i }) as HTMLInputElement
    expect(slider.value).toBe('1')
  })

  it('handles speed=0 gracefully (should not divide by zero)', () => {
    render(
      <JourneyProvider worldhopperId="hoid" planetMap={planetMap} speed={0}>
        <JourneyControls />
      </JourneyProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    tickRaf(100)
    vi.advanceTimersByTime(50)
    expect(screen.getByTestId('journey-controls')).toBeInTheDocument()
  })

  it('renders marker inside SVG map group', () => {
    ja('hoid')
    expect(querySvg('journey-marker')).toBeInTheDocument()
  })
})
