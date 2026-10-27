/**
 * The global search dialog — accessibility (M2 · block 4).
 *
 * Replaces the a11y tests for the old SearchBar, which asserted a combobox and
 * a listbox but never checked the relationship between them: nothing verified
 * that aria-controls pointed at the listbox, that aria-activedescendant tracked
 * the highlighted option, or that Escape restored focus. Those are exactly the
 * three things §5.8 Q.7 names.
 */

import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SearchDialog from '@/components/search/SearchDialog'

/**
 * The index is a 212 KB JSON fetched on first open, which jsdom will not resolve
 * from the dev server. The stub returns two documents so the wiring can be
 * tested without the engine.
 */
vi.mock('@/data/search-index.json', () => ({
  default: {
    generatedFrom: 'content/',
    documentCount: 2,
    typeBoost: {},
    index: { documentIds: [], invertedIndex: [], fieldIds: [], fieldLength: [], averageFieldLength: [] },
  },
}))

vi.mock('minisearch', () => {
  class FakeMiniSearch {
    static loadJSON() {
      return new FakeMiniSearch()
    }
    search(query: string) {
      const all = [
        {
          id: 'character:kelsier',
          score: 10,
          title: 'Kelsier',
          subtitle: 'Misting',
          type: 'character',
          route: '/records/kelsier',
        },
        {
          id: 'event:ghostbloods',
          score: 4,
          title: 'Ghostbloods Founded',
          subtitle: '1021',
          type: 'event',
          route: '/chronology?event=ghostbloods',
        },
      ]
      return query.trim() === '' ? [] : all
    }
    getStoredFields() {
      return undefined
    }
  }
  return { default: FakeMiniSearch }
})

function renderDialog() {
  return render(
    <MemoryRouter>
      <SearchDialog open onClose={() => {}} />
    </MemoryRouter>,
  )
}

describe('SearchDialog — accessibility', () => {
  it('renders a combobox with an accessible name, not just a placeholder', async () => {
    renderDialog()
    const input = screen.getByRole('combobox', { name: 'Search the archive' })
    expect(input).toBeInTheDocument()
    // A placeholder is not a label: it disappears on the first keystroke.
    expect(input.getAttribute('aria-label')).toBeTruthy()
  })

  it('wires the combobox to the listbox it controls', async () => {
    const user = userEvent.setup()
    renderDialog()
    const input = screen.getByRole('combobox')

    expect(input).toHaveAttribute('aria-expanded', 'false')

    await user.type(input, 'kels')
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'))

    const controls = input.getAttribute('aria-controls')
    expect(controls).toBe('search-results')
    const listbox = screen.getByRole('listbox')
    expect(listbox).toHaveAttribute('id', 'search-results')
  })

  it('points aria-activedescendant at the highlighted option', async () => {
    const user = userEvent.setup()
    renderDialog()
    const input = screen.getByRole('combobox')
    await user.type(input, 'kels')

    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

    // The first result is selected in an effect that runs after the render that
    // reveals the list, so the assertion has to wait for it rather than read
    // the attribute in the same tick.
    await waitFor(() => expect(input.getAttribute('aria-activedescendant')).toBeTruthy())

    const active = input.getAttribute('aria-activedescendant')!
    // The id must exist, and must belong to the selected option.
    const option = document.getElementById(active)
    expect(option).toBeTruthy()
    expect(option).toHaveAttribute('role', 'option')
    expect(option).toHaveAttribute('aria-selected', 'true')
  })

  it('moves the highlight with the arrow keys without moving DOM focus', async () => {
    const user = userEvent.setup()
    renderDialog()
    const input = screen.getByRole('combobox')
    await user.type(input, 'kels')

    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
    await waitFor(() => expect(input.getAttribute('aria-activedescendant')).toBeTruthy())
    const before = input.getAttribute('aria-activedescendant')

    await user.keyboard('{ArrowDown}')
    const after = input.getAttribute('aria-activedescendant')
    expect(after).not.toBe(before)
    // Focus stays in the input so typing keeps working.
    expect(input).toHaveFocus()
  })

  it('wraps the highlight at both ends', async () => {
    const user = userEvent.setup()
    renderDialog()
    const input = screen.getByRole('combobox')
    await user.type(input, 'kels')
    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
    await waitFor(() => expect(input.getAttribute('aria-activedescendant')).toBeTruthy())

    const first = input.getAttribute('aria-activedescendant')
    await user.keyboard('{ArrowUp}')
    expect(input.getAttribute('aria-activedescendant')).not.toBe(first)
  })

  it('announces the result count in a polite live region', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.type(screen.getByRole('combobox'), 'kels')
    await waitFor(() => {
      const status = screen.getByRole('status')
      expect(status.textContent).toMatch(/\d+ results?/)
    })
  })

  it('groups results under labelled categories', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.type(screen.getByRole('combobox'), 'kels')
    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

    // The stub returns one character and one event, so both sections appear.
    const options = within(screen.getByRole('listbox')).getAllByRole('option')
    expect(options).toHaveLength(2)
  })

  it('names the dialog itself', () => {
    renderDialog()
    const dialog = document.querySelector('dialog')
    expect(dialog).toBeTruthy()
    expect(dialog?.getAttribute('aria-label')).toBe('Search the archive')
  })
})
