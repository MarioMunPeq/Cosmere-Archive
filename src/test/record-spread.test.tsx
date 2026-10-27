import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RecordSpread, { buildRecordSpread } from '@/components/records/RecordSpread'
import { ALL_CHARACTERS } from '@/data/static'

function character(id: string) {
  const found = ALL_CHARACTERS.find((candidate) => candidate.id === id)
  if (!found) throw new Error(`Missing fixture character: ${id}`)
  return found
}

function renderSpread(id: string, locked = false, onUnlock?: () => void) {
  return render(
    <MemoryRouter>
      <RecordSpread character={character(id)} locked={locked} onUnlock={onUnlock} />
    </MemoryRouter>,
  )
}

describe('RecordSpread', () => {
  it('draws the portrait plate, title, status stamp and 132px identity ledger', () => {
    renderSpread('adolin')

    expect(screen.getByRole('heading', { level: 2, name: 'Adolin Kholin' })).toBeInTheDocument()
    expect(screen.getByText('Duelist')).toBeInTheDocument()
    expect(screen.getByText('Living')).toBeInTheDocument()
    expect(screen.getByText('1476 FE')).toBeInTheDocument()
    expect(screen.getByText(/^CA-[A-Z0-9]{3}-\d{4}$/)).toBeInTheDocument()

    const ledger = screen.getByText('Born').closest('dl')
    expect(ledger).not.toBeNull()
    expect(within(ledger!).getByRole('link', { name: 'The Way of Kings' })).toHaveAttribute(
      'href',
      '/library?book=the_way_of_kings',
    )
    expect(screen.getByRole('link', { name: 'Roshar' })).toHaveAttribute(
      'href',
      '/celestial-charts?focus=planet&id=roshar',
    )

    const row = screen.getByText('Born').closest('.record-ledger__row')
    expect(row).not.toBeNull()
  })

  it('lists Shallan once in Adolin’s relationships, not twice from the mirrored row', () => {
    renderSpread('adolin')

    const heading = screen.getByRole('heading', { name: 'Relationships' })
    const section = heading.closest('section')
    expect(section).not.toBeNull()

    expect(within(section!).getAllByText('Shallan Davar')).toHaveLength(1)
    expect(within(section!).getAllByRole('link', { name: /Shallan Davar/ })).toHaveLength(1)
  })

  it('says so when a record has no relationships', () => {
    renderSpread('dabbid')
    expect(screen.getByText('No recorded relationships.')).toBeInTheDocument()
  })

  it('keeps name, portrait and origin visible but removes the biography when locked', () => {
    renderSpread('kaladin', true, vi.fn())

    expect(screen.getByRole('heading', { level: 2, name: 'Kaladin' })).toBeInTheDocument()
    expect(screen.getByText('Roshar')).toBeInTheDocument()
    expect(screen.getByText('Spoilers locked')).toBeInTheDocument()
    expect(screen.getByText('The Way of Kings')).toBeInTheDocument()

    expect(screen.queryByText('1475 FE')).not.toBeInTheDocument()
    expect(screen.queryByText(/darkeyed surgeon/)).not.toBeInTheDocument()
    expect(screen.queryByText('Relationships')).not.toBeInTheDocument()
  })

  it('asks the page to open the read-books panel from the locked panel', async () => {
    const onUnlock = vi.fn()
    renderSpread('kaladin', true, onUnlock)

    await userEvent.click(screen.getByRole('button', { name: 'Mark books as read' }))
    expect(onUnlock).toHaveBeenCalledOnce()
  })

  it('builds a codex spread with a stable record id', () => {
    const view = buildRecordSpread({ character: character('adolin') })
    expect(view.id).toBe('record-adolin')
    expect(view.recordId).toBe('adolin')
    expect(view.title).toBe('Adolin Kholin')
  })
})
