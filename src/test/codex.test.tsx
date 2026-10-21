import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useState } from 'react'
import type { ComponentProps } from 'react'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Codex from '@/components/codex/Codex'
import { CODEX_SESSION_KEY, hasOpenedCodex, markCodexOpened } from '@/components/codex/codex-session'
import { buildDustMotes } from '@/components/codex/codex-dust'

function renderCodex(props: Partial<ComponentProps<typeof Codex>> = {}) {
  return render(<Codex left={<p>Left leaf</p>} right={<p>Right leaf</p>} {...props} />)
}

describe('Codex · chassis', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders both pages and the twelve-leaf fore-edges on each side', () => {
    const { container } = renderCodex()
    expect(screen.getByText('Left leaf')).toBeInTheDocument()
    expect(screen.getByText('Right leaf')).toBeInTheDocument()
    expect(container.querySelectorAll('.codex-block__leaf')).toHaveLength(24)
    expect(container.querySelector('.codex-book')?.getAttribute('role')).toBe('group')
  })

  it('prints a running header and a folio on the page', () => {
    renderCodex({ leftHeader: 'Ars Arcanum', leftFolio: 'i' })
    expect(screen.getByText('Ars Arcanum')).toBeInTheDocument()
    expect(screen.getByText('— i —')).toBeInTheDocument()
  })

  it('shrinks the page block depth as progress approaches the end', () => {
    const { container } = renderCodex({ progress: 1 })
    const book = container.querySelector('.codex-book') as HTMLElement
    expect(book.style.getPropertyValue('--codex-depth')).toBe('14.00px')
  })

  it('rests, turns the cover, then removes it so the spread stays flat', () => {
    vi.useFakeTimers()
    renderCodex()

    expect(screen.getByTestId('codex-cover')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(430)
    })
    expect(screen.getByTestId('codex-cover').getAttribute('data-phase')).toBe('opening')
    expect(hasOpenedCodex()).toBe(true)

    act(() => {
      vi.advanceTimersByTime(930)
    })
    expect(screen.queryByTestId('codex-cover')).toBeNull()
    expect(screen.getByText('Left leaf')).toBeInTheDocument()
  })

  it('skips the ceremony when Escape is pressed', () => {
    renderCodex()
    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' })
    })
    expect(screen.queryByTestId('codex-cover')).toBeNull()
  })

  it('skips the ceremony when the cover is activated', () => {
    renderCodex()
    fireEvent.click(screen.getByRole('button', { name: 'Open the Ars Arcanum' }))
    expect(screen.queryByTestId('codex-cover')).toBeNull()
  })

  it('starts open once the session has already seen the cover', () => {
    window.sessionStorage.setItem(CODEX_SESSION_KEY, '1')
    renderCodex()
    expect(screen.queryByTestId('codex-cover')).toBeNull()
  })

  it('starts open when the reader asks for reduced motion', () => {
    const spy = vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: query.includes('prefers-reduced-motion'),
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }) as unknown as MediaQueryList,
    )
    renderCodex()
    expect(screen.queryByTestId('codex-cover')).toBeNull()
    spy.mockRestore()
  })
})

describe('Codex · session memory', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  it('remembers the cover for the rest of the session only', () => {
    expect(hasOpenedCodex()).toBe(false)
    markCodexOpened()
    expect(hasOpenedCodex()).toBe(true)
    expect(window.sessionStorage.getItem(CODEX_SESSION_KEY)).toBe('1')
  })

  it('treats an unavailable storage as "not opened" instead of throwing', () => {
    const spy = vi.spyOn(window, 'sessionStorage', 'get').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(hasOpenedCodex()).toBe(false)
    expect(() => markCodexOpened()).not.toThrow()
    spy.mockRestore()
  })
})

describe('Codex · dust', () => {
  it('is deterministic: the same seed yields the same motes', () => {
    expect(buildDustMotes()).toEqual(buildDustMotes())
  })

  it('keeps every mote inside the desk and the intended ranges', () => {
    for (const mote of buildDustMotes()) {
      expect(mote.left).toBeGreaterThanOrEqual(0)
      expect(mote.left).toBeLessThanOrEqual(100)
      expect(mote.top).toBeGreaterThanOrEqual(0)
      expect(mote.top).toBeLessThanOrEqual(100)
      expect(mote.size).toBeGreaterThanOrEqual(1)
      expect(mote.size).toBeLessThanOrEqual(4)
      expect(mote.opacity).toBeGreaterThan(0)
      expect(mote.opacity).toBeLessThan(1)
      expect(mote.delay).toBeLessThanOrEqual(0)
    }
  })
})

const SPREADS = [
  {
    id: 'one',
    title: 'One',
    left: <p>Spread one left</p>,
    right: <p>Spread one right</p>,
  },
  {
    id: 'two',
    title: 'Two',
    left: <p>Spread two left</p>,
    right: <p>Spread two right</p>,
  },
  {
    id: 'three',
    title: 'Three',
    left: <p>Spread three left</p>,
    right: <p>Spread three right</p>,
  },
]

function Reader({ initial = 0 }: { initial?: number }) {
  const [index, setIndex] = useState(initial)
  return <Codex spreads={SPREADS} index={index} onTurn={setIndex} label="Test codex" />
}

function reducedMotion(): void {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  )
}

describe('Codex · spread engine', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('announces the settled spread in a live region', () => {
    window.sessionStorage.setItem(CODEX_SESSION_KEY, '1')
    render(<Reader />)

    const status = screen.getByText(/Spread 1 of 3/)
    expect(status).toHaveTextContent('One')
    expect(status).toHaveAttribute('aria-live', 'polite')
  })

  it('turns with the arrow keys, Home and End under reduced motion', () => {
    reducedMotion()
    window.sessionStorage.setItem(CODEX_SESSION_KEY, '1')
    render(<Reader />)

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByText('Spread two left')).toBeInTheDocument()
    expect(screen.getByText(/Spread 2 of 3/)).toHaveTextContent('Two')

    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(screen.getByText('Spread one left')).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'End' })
    expect(screen.getByText('Spread three left')).toBeInTheDocument()
    expect(screen.getByText(/Spread 3 of 3/)).toHaveTextContent('Three')

    fireEvent.keyDown(window, { key: 'Home' })
    expect(screen.getByText('Spread one left')).toBeInTheDocument()
  })

  it('lets a second key interrupt the turn already in flight', async () => {
    window.sessionStorage.setItem(CODEX_SESSION_KEY, '1')
    const { container } = render(<Reader />)

    fireEvent.keyDown(window, { key: 'End' })
    await waitFor(() => expect(container.querySelector('.codex-flip__leaf')).not.toBeNull())

    fireEvent.keyDown(window, { key: 'Home' })
    await waitFor(() => expect(container.querySelector('.codex-flip__leaf')).toBeNull(), {
      timeout: 1500,
    })
    expect(screen.getByText('Spread one left')).toBeInTheDocument()
    expect(screen.getByText(/Spread 1 of 3/)).toHaveTextContent('One')
  })

  it('turns from the fore-edge controls', async () => {
    reducedMotion()
    window.sessionStorage.setItem(CODEX_SESSION_KEY, '1')
    render(<Reader />)

    expect(screen.queryByRole('button', { name: 'Previous spread' })).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Next spread' }))
    expect(screen.getByText('Spread two left')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Previous spread' }))
    expect(screen.getByText('Spread one left')).toBeInTheDocument()
  })

  it('does not turn before the cover has opened', () => {
    render(<Reader />)
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByText(/Spread 1 of 3/)).toBeInTheDocument()
    expect(screen.queryByText('Spread two left')).toBeNull()
  })

  it('renders one turning leaf and removes it once the turn settles', async () => {
    window.sessionStorage.setItem(CODEX_SESSION_KEY, '1')
    const { container } = render(<Reader />)

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    await waitFor(() => expect(container.querySelector('.codex-flip__leaf')).not.toBeNull())
    const leaf = container.querySelector('.codex-flip__leaf') as HTMLElement
    expect(leaf).toHaveAttribute('aria-hidden', 'true')
    expect(leaf).toHaveAttribute('inert')

    await waitFor(() => expect(container.querySelector('.codex-flip__leaf')).toBeNull(), {
      timeout: 1500,
    })
    expect(screen.getByText('Spread two left')).toBeInTheDocument()
    expect(screen.getByText(/Spread 2 of 3/)).toHaveTextContent('Two')
  })

  it('shows the ribbon and keeps the spine progress in step', () => {
    reducedMotion()
    window.sessionStorage.setItem(CODEX_SESSION_KEY, '1')
    const { container } = render(<Reader />)

    expect(container.querySelector('.codex-ribbon')).not.toBeNull()
    const book = container.querySelector('.codex-book') as HTMLElement
    expect(book.style.getPropertyValue('--codex-depth')).toBe('20.00px')

    fireEvent.keyDown(window, { key: 'End' })
    expect(book.style.getPropertyValue('--codex-depth')).toBe('14.00px')
  })
})
