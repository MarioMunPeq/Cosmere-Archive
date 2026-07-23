import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import ErrorBoundary from '@/components/common/ErrorBoundary'

function Bomb({ shouldThrow }: { shouldThrow?: boolean }) {
  if (shouldThrow) throw new Error('boom')
  return <p>all good</p>
}

function renderInRouter(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    renderInRouter(
      <ErrorBoundary>
        <p>hello</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('hello')).toBeInTheDocument()
  })

  it('catches errors and shows ArchiveError fallback', () => {
    renderInRouter(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    )
    expect(screen.getByText('RECORD UNAVAILABLE')).toBeInTheDocument()
    expect(screen.getByText('Restore Record')).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    renderInRouter(
      <ErrorBoundary fallback={<p>custom error</p>}>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    )
    expect(screen.getByText('custom error')).toBeInTheDocument()
    expect(screen.queryByText('ARCHIVAL FAILURE')).not.toBeInTheDocument()
  })

  it('shows archive-style buttons on error', () => {
    renderInRouter(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Restore Record')).toBeInTheDocument()
    expect(screen.getByText('Return to Archive')).toBeInTheDocument()
    expect(screen.getByText('Open Index')).toBeInTheDocument()
  })

  it('"Restore Record" resets error state and shows children that no longer throw', async () => {
    const { rerender } = renderInRouter(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    )
    expect(screen.getByText('RECORD UNAVAILABLE')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Restore Record'))

    rerender(
      <MemoryRouter>
        <ErrorBoundary key="fresh">
          <Bomb />
        </ErrorBoundary>
      </MemoryRouter>,
    )
    expect(screen.getByText('all good')).toBeInTheDocument()
  })

  it('logs errors to console', () => {
    renderInRouter(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    )
    expect(console.error).toHaveBeenCalled()
  })
})
