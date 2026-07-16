import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import MagicSystemsPage from '@/pages/MagicSystemsPage'

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/magic']}>
      <MagicSystemsPage />
    </MemoryRouter>,
  )
}

describe('Ars Arcanum (manuscript)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the title page heading', () => {
    renderPage()
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.textContent).toMatch(/ARS/)
    expect(heading.textContent).toMatch(/ARCANUM/)
  })

  it('renders the scholarly subtitle', () => {
    renderPage()
    expect(screen.getByText(/Collected observations/)).toBeInTheDocument()
  })

  it('renders the table of contents with planet names', () => {
    renderPage()
    const tocNames = screen.getAllByText('Roshar')
    expect(tocNames.length).toBeGreaterThanOrEqual(1)
  })

  it('shows an Archival Index link in the TOC', () => {
    renderPage()
    expect(screen.getByText('Archival Index →')).toBeInTheDocument()
  })

  it('navigates to a chapter when a TOC entry is clicked', async () => {
    renderPage()
    const rosharEntry = screen.getByText('Roshar')
    await userEvent.click(rosharEntry)
    act(() => {
      vi.advanceTimersByTime(350)
    })

    await waitFor(() => {
      const chapterLabels = screen.getAllByText((content) => content.includes('Chapter'))
      expect(chapterLabels.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows a Contents link when inside a chapter', async () => {
    renderPage()
    const rosharEntry = screen.getByText('Roshar')
    await userEvent.click(rosharEntry)
    act(() => {
      vi.advanceTimersByTime(350)
    })

    await waitFor(() => {
      expect(screen.getByText(/Contents/)).toBeInTheDocument()
    })
  })

  it('displays manifestation sections when a chapter is opened', async () => {
    renderPage()
    const rosharEntry = screen.getByText('Roshar')
    await userEvent.click(rosharEntry)
    act(() => {
      vi.advanceTimersByTime(350)
    })

    await waitFor(() => {
      expect(screen.getByText('1. Surgebinding')).toBeInTheDocument()
    })
  })

  it('shows Research Record metadata for manifestations', async () => {
    renderPage()
    const rosharEntry = screen.getByText('Roshar')
    await userEvent.click(rosharEntry)
    act(() => {
      vi.advanceTimersByTime(350)
    })

    await waitFor(() => {
      expect(screen.getAllByText('Research Record').length).toBeGreaterThanOrEqual(1)
    })
  })
})
