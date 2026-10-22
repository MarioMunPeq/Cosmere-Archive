import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LibraryPage from '@/pages/LibraryPage'

function renderPage(entry = '/library') {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <LibraryPage />
    </MemoryRouter>,
  )
}

describe('LibraryPage', () => {
  it('renders the page title', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: /library of jasnah/i })).toBeInTheDocument()
  })

  it('renders volume count', () => {
    renderPage()
    expect(screen.getByText(/volumes/)).toBeInTheDocument()
  })

  it('opens a book and shows a readable dialog', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /^The Way of Kings\b/ }))
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(within(dialog).getByRole('heading', { level: 2, name: /synopsis/i })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: /return to shelf/i })).toBeInTheDocument()
  })

  it('returns the volume to the shelf with the printed control', async () => {
    const user = userEvent.setup()
    renderPage()

    const spine = screen.getByRole('button', { name: /^The Way of Kings\b/ })
    await user.click(spine)
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: /return to shelf/i }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), {
      timeout: 3000,
    })
    // The volume is returned to its slot on the frame after the dialog
    // releases it, so the focus restore is one rAF behind the unmount.
    await waitFor(() => expect(spine).toHaveFocus(), { timeout: 3000 })
  })

  it('opens a volume from its deep link', async () => {
    renderPage('/library?book=the_way_of_kings')
    const dialog = await screen.findByRole('dialog', { name: /reading the way of kings/i })
    expect(within(dialog).getByRole('heading', { level: 2, name: /synopsis/i })).toBeInTheDocument()
  })

  it('closes the book with Escape', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /^The Way of Kings\b/ }))
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    // The close is a 380ms animation, so this waits rather than asserts.
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), {
      timeout: 3000,
    })
  })
})
