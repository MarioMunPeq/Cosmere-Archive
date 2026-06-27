import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import BackToTop from '@/components/ui/BackToTop'

describe('BackToTop', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the button', () => {
    render(<BackToTop />)
    expect(screen.getByLabelText('Back to top')).toBeInTheDocument()
  })

  it('starts hidden (opacity-0 class present)', () => {
    render(<BackToTop />)
    const btn = screen.getByLabelText('Back to top')
    expect(btn.className).toContain('opacity-0')
  })
})
