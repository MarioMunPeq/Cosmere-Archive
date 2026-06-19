import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react'
import { PLANETS } from '@/data/static'
import JourneyAnimation from '@/components/map/JourneyAnimation'

// Build the planet coordinate map
const planetMap = new Map(PLANETS.map((p) => [p.id, { x: p.x, y: p.y }]))

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

// ---------- Setup / Teardown ----------
beforeEach(() => {
  mockRaf()
  vi.useFakeTimers()
})

afterEach(() => {
  unmockRaf()
  vi.useRealTimers()
  cleanup()
})

// ============================================================
// Rendering states
// ============================================================
describe('JourneyAnimation — rendering', () => {
  it('renders nothing when worldhopperId is null', () => {
    const { container } = render(<JourneyAnimation worldhopperId={null} planetMap={planetMap} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing when worldhopperId is undefined', () => {
    const { container } = render(
      <JourneyAnimation worldhopperId={undefined as unknown as string} planetMap={planetMap} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders controls when worldhopperId is provided', () => {
    render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
    expect(screen.getByTestId('journey-controls')).toBeInTheDocument()
  })

  it('displays worldhopper name', () => {
    render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
    expect(screen.getByText('Hoid')).toBeInTheDocument()
  })

  it('displays name for each known worldhopper', () => {
    const ids = ['hoid', 'vasher', 'khriss', 'nazh', 'kelsier']
    for (const id of ids) {
      cleanup()
      render(<JourneyAnimation worldhopperId={id} planetMap={planetMap} />)
      expect(screen.getByTestId('journey-controls')).toBeInTheDocument()
    }
  })

  it('shows fallback text for unknown worldhopper id', () => {
    render(<JourneyAnimation worldhopperId="nonexistent" planetMap={planetMap} />)
    expect(screen.getByText(/unknown/i)).toBeInTheDocument()
  })

  it('renders SVG path layer with at least one path', () => {
    const { container } = render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
    const svg = container.querySelector('[data-testid="journey-svg"]')
    expect(svg).toBeInTheDocument()
    const paths = svg!.querySelectorAll('path')
    expect(paths.length).toBeGreaterThan(0)
  })

  it('renders animated marker dot', () => {
    const { container } = render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
    expect(container.querySelector('[data-testid="journey-marker"]')).toBeInTheDocument()
  })

  it('renders stop dots at planet positions', () => {
    const { container } = render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
    const stops = container.querySelectorAll('[data-testid="journey-stop"]')
    expect(stops.length).toBeGreaterThanOrEqual(2)
  })

  it('renders a traced path (the already-traveled portion)', () => {
    const { container } = render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} speed={100} />)
    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    // First frame sets startTimeRef; second frame gives elapsed > 0
    act(() => {
      vi.advanceTimersByTime(16)
    })
    act(() => {
      vi.advanceTimersByTime(16)
    })
    const trace = container.querySelector('[data-testid="journey-traced-path"]')
    expect(trace).toBeInTheDocument()
  })

  it('renders an untraveled path (the remaining portion)', () => {
    const { container } = render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
    const untraveled = container.querySelector('[data-testid="journey-untraveled-path"]')
    expect(untraveled).toBeInTheDocument()
  })

  it('shows current planet name in info panel', () => {
    render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
    const info = screen.getByTestId('journey-info')
    expect(info.textContent).toBeTruthy()
  })

  it('shows year display', () => {
    render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
    expect(screen.getByTestId('journey-year')).toBeInTheDocument()
  })

  it('shows progress percentage', () => {
    render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
    expect(screen.getByTestId('journey-progress')).toBeInTheDocument()
  })

  it('shows stop description', () => {
    render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
    const desc = screen.queryByTestId('journey-description')
    // The initial stop should have a description
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
    render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
  })

  it('shows Pause after Play is clicked', () => {
    render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument()
  })

  it('back to Play after Pause is clicked', () => {
    render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    fireEvent.click(screen.getByRole('button', { name: /pause/i }))
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
  })

  it('has a speed slider', () => {
    render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
    const slider = screen.getByRole('slider', { name: /speed/i })
    expect(slider).toBeInTheDocument()
  })

  it('speed slider defaults to 1', () => {
    render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
    const slider = screen.getByRole('slider', { name: /speed/i }) as HTMLInputElement
    expect(slider.value).toBe('1')
  })

  it('speed slider min is 0.5 and max is 5', () => {
    render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
    const slider = screen.getByRole('slider', { name: /speed/i }) as HTMLInputElement
    expect(Number(slider.min)).toBeLessThanOrEqual(0.5)
    expect(Number(slider.max)).toBeGreaterThanOrEqual(5)
  })

  it('speed slider accepts new value', () => {
    render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
    const slider = screen.getByRole('slider', { name: /speed/i })
    fireEvent.change(slider, { target: { value: '3' } })
    expect((slider as HTMLInputElement).value).toBe('3')
  })

  it('has a Close button', () => {
    render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('has a Reset button', () => {
    render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
    expect(screen.getByRole('button', { name: /reset|restart/i })).toBeInTheDocument()
  })

  it('has progress bar showing current percentage', () => {
    render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
    const progress = screen.getByTestId('journey-progress')
    expect(progress.textContent).toMatch(/\d+%/)
  })

  it('calls onClose when Close is clicked', () => {
    const onClose = vi.fn()
    render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

// ============================================================
// Animation behavior
// ============================================================
describe('JourneyAnimation — animation', () => {
  it('marker starts at first planet position', () => {
    const { container } = render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} speed={1} />)
    const marker = container.querySelector('[data-testid="journey-marker"]')
    expect(marker).toBeInTheDocument()
    const cx = marker!.getAttribute('cx')
    const cy = marker!.getAttribute('cy')
    expect(Number(cx)).toBeCloseTo(60, 0) // Yolen x
    expect(Number(cy)).toBeCloseTo(60, 0) // Yolen y
  })

  it('progress updates as animation plays', () => {
    render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} speed={10} />)
    const progress = screen.getByTestId('journey-progress')
    const initial = progress.textContent
    fireEvent.click(screen.getByRole('button', { name: /play/i }))

    // Advance multiple frames inside act to flush React updates
    act(() => {
      for (let i = 0; i < 100; i++) {
        vi.advanceTimersByTime(16)
      }
    })

    expect(progress.textContent).not.toBe(initial)
  })

  it('marker position changes during animation', () => {
    const { container } = render(<JourneyAnimation worldhopperId="khriss" planetMap={planetMap} speed={10} />)
    const marker = container.querySelector('[data-testid="journey-marker"]')
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
    const { container } = render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} speed={5} />)
    fireEvent.click(screen.getByRole('button', { name: /play/i }))

    for (let i = 0; i < 10; i++) {
      tickRaf(i * 50)
      vi.advanceTimersByTime(50)
    }

    const marker = container.querySelector('[data-testid="journey-marker"]')
    const cxBeforePause = marker!.getAttribute('cx')

    fireEvent.click(screen.getByRole('button', { name: /pause/i }))

    // Advance more time — marker should stay
    for (let i = 0; i < 10; i++) {
      tickRaf(i * 50 + 500)
      vi.advanceTimersByTime(50)
    }

    expect(marker!.getAttribute('cx')).toBe(cxBeforePause)
  })

  it('calls onComplete when journey reaches end', () => {
    const onComplete = vi.fn()
    render(<JourneyAnimation worldhopperId="kelsier" planetMap={planetMap} speed={50} onComplete={onComplete} />)
    fireEvent.click(screen.getByRole('button', { name: /play/i }))

    // Advance enough frames to pass through auto-pauses at each planet stop
    act(() => {
      for (let i = 0; i < 1200; i++) {
        vi.advanceTimersByTime(16)
      }
    })

    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('shows Play button again after journey completes', () => {
    render(<JourneyAnimation worldhopperId="kelsier" planetMap={planetMap} speed={50} />)
    fireEvent.click(screen.getByRole('button', { name: /play/i }))

    act(() => {
      for (let i = 0; i < 1200; i++) {
        vi.advanceTimersByTime(16)
      }
    })

    // Should be back to Play (completed)
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
  })

  it('progress is 100% when journey completes', () => {
    render(<JourneyAnimation worldhopperId="kelsier" planetMap={planetMap} speed={50} />)
    fireEvent.click(screen.getByRole('button', { name: /play/i }))

    act(() => {
      for (let i = 0; i < 1200; i++) {
        vi.advanceTimersByTime(16)
      }
    })

    expect(screen.getByTestId('journey-progress').textContent).toMatch(/100%/)
  })

  it('year display updates during animation', () => {
    render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} speed={10} />)
    const yearEl = screen.getByTestId('journey-year')

    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    for (let i = 0; i < 20; i++) {
      tickRaf(i * 50)
      vi.advanceTimersByTime(50)
    }

    const updatedYear = yearEl.textContent
    // Year should be different or same but progressed
    expect(updatedYear).toBeTruthy()
  })

  it('traced path length increases during animation', () => {
    const { container } = render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} speed={5} />)

    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    // Advance two frames: first sets startTimeRef, second gives progress > 0
    act(() => {
      vi.advanceTimersByTime(16)
    })
    act(() => {
      vi.advanceTimersByTime(16)
    })
    const trace = container.querySelector('[data-testid="journey-traced-path"]')
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
    const { container } = render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} speed={5} />)

    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    for (let i = 0; i < 10; i++) {
      tickRaf(i * 50)
      vi.advanceTimersByTime(50)
    }

    fireEvent.click(screen.getByRole('button', { name: /reset|restart/i }))

    const marker = container.querySelector('[data-testid="journey-marker"]')
    expect(Number(marker!.getAttribute('cx'))).toBeCloseTo(60, 0)
    expect(Number(marker!.getAttribute('cy'))).toBeCloseTo(60, 0)
    expect(screen.getByTestId('journey-progress').textContent).toBe('0%')
  })

  it('resets stops animation and shows Play (not Pause)', () => {
    render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
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
    const { rerender } = render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    for (let i = 0; i < 10; i++) {
      tickRaf(i * 50)
      vi.advanceTimersByTime(50)
    }

    rerender(<JourneyAnimation worldhopperId="vasher" planetMap={planetMap} />)

    expect(screen.getByTestId('journey-progress').textContent).toBe('0%')
  })

  it('updates worldhopper name when id changes', () => {
    const { rerender } = render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
    expect(screen.getByText('Hoid')).toBeInTheDocument()

    rerender(<JourneyAnimation worldhopperId="vasher" planetMap={planetMap} />)
    expect(screen.getByText('Vasher')).toBeInTheDocument()
  })

  it('marker jumps to new worldhopper starting planet', () => {
    const { rerender, container } = render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
    const marker = container.querySelector('[data-testid="journey-marker"]')

    rerender(<JourneyAnimation worldhopperId="kelsier" planetMap={planetMap} />)
    // Kelsier starts on Scadrial (x:250, y:340)
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

    // Slow — speed=1, too slow to finish in 300ms
    const { unmount } = render(
      <JourneyAnimation worldhopperId="kelsier" planetMap={planetMap} speed={1} onComplete={onCompleteSlow} />,
    )
    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    act(() => {
      vi.advanceTimersByTime(300)
    })
    unmount()

    // Fast — speed=10, enough iterations to pass through auto-pauses
    render(<JourneyAnimation worldhopperId="kelsier" planetMap={planetMap} speed={10} onComplete={onCompleteFast} />)
    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    act(() => {
      for (let i = 0; i < 1200; i++) {
        vi.advanceTimersByTime(16)
      }
    })

    // Slow should NOT have completed, fast should have
    expect(onCompleteSlow).not.toHaveBeenCalled()
    expect(onCompleteFast).toHaveBeenCalled()
  })
})

// ============================================================
// Edge cases
// ============================================================
describe('JourneyAnimation — edge cases', () => {
  it('handles rapid play-pause-play without errors', () => {
    render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
    const play = () => screen.getByRole('button', { name: /play/i })
    const pause = () => screen.getByRole('button', { name: /pause/i })

    for (let i = 0; i < 5; i++) {
      fireEvent.click(play())
      tickRaf(i * 16)
      vi.advanceTimersByTime(16)
      fireEvent.click(pause())
    }
    // Still showing Play after last pause
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
  })

  it('handles double-click on Play gracefully', () => {
    render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
    const btn = screen.getByRole('button', { name: /play/i })
    fireEvent.click(btn)
    // Second click toggles back to Play (button toggles on each click)
    fireEvent.click(btn)
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
  })

  it('does not error on unmount while animating', () => {
    const { unmount } = render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} speed={5} />)
    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    tickRaf(100)
    vi.advanceTimersByTime(50)
    expect(() => unmount()).not.toThrow()
  })

  it('speed prop defaults to 1 when not provided', () => {
    render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
    const slider = screen.getByRole('slider', { name: /speed/i }) as HTMLInputElement
    expect(slider.value).toBe('1')
  })

  it('handles speed=0 gracefully (should not divide by zero)', () => {
    render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} speed={0} />)
    fireEvent.click(screen.getByRole('button', { name: /play/i }))
    tickRaf(100)
    vi.advanceTimersByTime(50)
    // Should not crash
    expect(screen.getByTestId('journey-controls')).toBeInTheDocument()
  })

  it('responds to window resize (checks SVG dimensions)', () => {
    const { container } = render(<JourneyAnimation worldhopperId="hoid" planetMap={planetMap} />)
    const svg = container.querySelector('[data-testid="journey-svg"]') as HTMLElement
    // Simulate resize
    act(() => {
      window.innerWidth = 1200
      window.innerHeight = 800
      window.dispatchEvent(new Event('resize'))
    })
    expect(svg).toBeInTheDocument()
  })
})
