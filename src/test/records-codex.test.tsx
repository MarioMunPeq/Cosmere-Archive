import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RecordsCodex from '@/components/records/RecordsCodex'
import { CODEX_SESSION_KEY } from '@/components/codex/codex-session'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <RecordsCodex />
    </MemoryRouter>,
  )
}

describe('RecordsCodex', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
    window.sessionStorage.setItem(CODEX_SESSION_KEY, '1')
  })

  it('opens on the three closed volumes at the desk', () => {
    const { container } = renderAt('/characters')

    expect(screen.getByRole('heading', { level: 2, name: 'Three volumes rest on the desk' })).toBeInTheDocument()
    expect(container.querySelectorAll('[data-testid^="volume-cover-"]')).toHaveLength(3)
  })

  it('opens Volume II from its closed cover', async () => {
    renderAt('/characters')

    await userEvent.click(screen.getByRole('button', { name: /^Open Volume II:/ }))
    expect(await screen.findByRole('heading', { level: 2, name: 'Bloodlines & Connections' })).toBeInTheDocument()
  })

  it('opens Volume III from its closed cover', async () => {
    renderAt('/characters')

    await userEvent.click(screen.getByRole('button', { name: /^Open Volume III:/ }))
    expect(await screen.findByRole('heading', { level: 1, name: /ARS\s*ARCANUM/i })).toBeInTheDocument()
  })

  it('opens the Volume I contents with all 93 records in eight ranges', () => {
    const { container } = renderAt('/characters?spread=records-contents')

    expect(screen.getByRole('heading', { level: 2, name: 'Biographical Records' })).toBeInTheDocument()
    expect(container.querySelectorAll('[data-contents-kind="record"]')).toHaveLength(93)
    expect(container.querySelectorAll('[data-contents-kind="range"]')).toHaveLength(8)
    expect(container.querySelectorAll('[data-records-index] section')).toHaveLength(8)
  })

  it('filters the index by name, description and world, then clears', async () => {
    const { container } = renderAt('/characters?spread=records-contents')
    const input = screen.getByLabelText('Search records')

    await userEvent.type(input, 'kaladin')
    await waitFor(() => {
      const count = container.querySelectorAll('[data-contents-kind="record"]').length
      expect(count).toBeGreaterThan(0)
      expect(count).toBeLessThan(93)
    })

    await userEvent.clear(input)
    await userEvent.type(input, 'scadrial')
    expect(container.querySelectorAll('[data-contents-kind="record"]').length).toBeGreaterThan(0)

    await userEvent.clear(input)
    await userEvent.type(input, 'zzzzz')
    expect(screen.getByText(/No records match/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(container.querySelectorAll('[data-contents-kind="record"]')).toHaveLength(93)
  })

  it('opens Adolin’s record from the legacy ?character= deep link', async () => {
    renderAt('/characters?character=adolin')

    expect(await screen.findByRole('heading', { level: 2, name: 'Adolin Kholin' })).toBeInTheDocument()

    const section = screen.getByRole('heading', { name: 'Relationships' }).closest('section')
    expect(section).not.toBeNull()
    expect(within(section!).getAllByText('Shallan Davar')).toHaveLength(1)
  })

  it('turns from a contents entry to that person’s spread', async () => {
    renderAt('/characters?spread=records-contents')

    await userEvent.click(screen.getByRole('button', { name: 'Adolin Kholin' }))
    expect(await screen.findByRole('heading', { level: 2, name: 'Adolin Kholin' })).toBeInTheDocument()
  })

  it('shows a real 404 state for an unknown character id', () => {
    renderAt('/characters?character=no-such-person')

    expect(screen.getByRole('heading', { name: 'No such record' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back to the index' })).toBeInTheDocument()
  })
})
