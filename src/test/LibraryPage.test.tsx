import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LibraryPage from '@/pages/LibraryPage'
import { BOOKS } from '@/data/static'

function renderPage() {
  return render(
    <MemoryRouter>
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

  it('offers the Shelves and List views', () => {
    renderPage()
    expect(screen.getByRole('tab', { name: 'shelves' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'list' })).toBeInTheDocument()
  })

  it('lists every volume in the List view (M3.8)', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('tab', { name: 'list' }))

    const table = screen.getByRole('table')
    expect(within(table).getAllByRole('row')).toHaveLength(BOOKS.length + 1) // + header
  })

  it('sorts the List view by a column', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('tab', { name: 'list' }))

    const table = screen.getByRole('table')
    const firstBefore = within(table).getAllByRole('row')[1]!.textContent

    await user.click(within(table).getByRole('button', { name: /title/i }))
    const header = within(table).getByRole('columnheader', { name: /title/i })
    expect(header).toHaveAttribute('aria-sort', 'ascending')
    // Sorting by title puts "Dawnshard" first; unsorted it is the last volume.
    expect(firstBefore).not.toMatch(/dawnshard/i)
  })

  it('opens a book and shows a readable dialog', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /^The Way of Kings\b/ }))
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    // "Synopsis" is both the page heading and its running head, so query the
    // heading rather than the text.
    expect(within(dialog).getByRole('heading', { level: 3, name: /synopsis/i })).toBeInTheDocument()
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
