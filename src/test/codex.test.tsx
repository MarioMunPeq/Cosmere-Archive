import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { ComponentProps } from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
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
