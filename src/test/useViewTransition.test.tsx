import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useViewTransitionNavigate } from '@/hooks/useViewTransition'

function wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>
}

describe('useViewTransitionNavigate', () => {
  it('returns a function', () => {
    const { result } = renderHook(() => useViewTransitionNavigate(), { wrapper })
    expect(typeof result.current).toBe('function')
  })

  it('navigates without throwing', () => {
    const { result } = renderHook(() => useViewTransitionNavigate(), { wrapper })
    expect(() => result.current('/books')).not.toThrow()
  })
})
