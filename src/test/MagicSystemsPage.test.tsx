import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import MagicSystemsPage from '@/pages/MagicSystemsPage'
import { CODEX_SESSION_KEY } from '@/components/codex/codex-session'

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/magic']}>
      <MagicSystemsPage />
    </MemoryRouter>,
  )
}

function findRosharEntry() {
  return screen.getByRole('button', { name: /^II\.\s*Roshar/ })
}

describe('Ars Arcanum (manuscript)', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
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

  it('lists the eleven world chapters and the ninety-three records', () => {
    const { container } = renderPage()
    expect(container.querySelectorAll('[data-contents-kind="world"]')).toHaveLength(11)
    expect(screen.getByText('11 chapters')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /93 records — open Part II/ })).toBeInTheDocument()
  })

  it('renders one thumb tab per world chapter', () => {
    window.sessionStorage.setItem(CODEX_SESSION_KEY, '1')
    const { container } = renderPage()
    expect(container.querySelectorAll('[data-thumb]')).toHaveLength(11)
  })

  it('opens a chapter from its thumb tab', async () => {
    window.sessionStorage.setItem(CODEX_SESSION_KEY, '1')
    renderPage()
    const tab = screen.getByRole('button', { name: /^II — Roshar/ })
    await userEvent.click(tab)
    act(() => {
      vi.advanceTimersByTime(350)
    })

    await waitFor(() => {
      expect(screen.getAllByText((content) => content.includes('Chapter')).length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows an Archival Index link in the TOC', () => {
    renderPage()
    expect(screen.getByText('Archival Index →')).toBeInTheDocument()
  })

  it('navigates to a chapter when a TOC entry is clicked', async () => {
    renderPage()
    const rosharEntry = findRosharEntry()
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
    const rosharEntry = findRosharEntry()
    await userEvent.click(rosharEntry)
    act(() => {
      vi.advanceTimersByTime(350)
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Contents/ })).toBeInTheDocument()
    })
  })

  it('displays manifestation sections when a chapter is opened', async () => {
    renderPage()
    const rosharEntry = findRosharEntry()
    await userEvent.click(rosharEntry)
    act(() => {
      vi.advanceTimersByTime(350)
    })

    await waitFor(() => {
      expect(screen.getAllByText('1. Surgebinding').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows Research Record metadata for manifestations', async () => {
    renderPage()
    const rosharEntry = findRosharEntry()
    await userEvent.click(rosharEntry)
    act(() => {
      vi.advanceTimersByTime(350)
    })

    await waitFor(() => {
      expect(screen.getAllByText('Research Record').length).toBeGreaterThanOrEqual(1)
    })
  })
})
