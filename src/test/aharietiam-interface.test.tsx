import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import InfoMonolith from '@/components/aharietiam/InfoMonolith'
import { formatQuote } from '@/components/aharietiam/quote'
import { HONORBLADES } from '@/data/static/aharietiam'
import type { HonorbladeData } from '@/types/aharietiam'

function blade(id: string): HonorbladeData {
  const found = HONORBLADES.find((entry) => entry.id === id)
  if (!found) throw new Error(`Missing test blade: ${id}`)
  return found
}

function renderPanel(entry: HonorbladeData, light = false) {
  const onClose = vi.fn()
  render(
    <MemoryRouter>
      <InfoMonolith blade={entry} light={light} reducedMotion onClose={onClose} />
    </MemoryRouter>,
  )
  return onClose
}

describe('Aharietiam quote typography', () => {
  it('replaces the source quotation marks with one typographic pair', () => {
    expect(formatQuote('"I have given you the sky."')).toBe('“I have given you the sky.”')
  })

  it('does not double a quote that is already typographic', () => {
    expect(formatQuote('“The law is not a suggestion.”')).toBe('“The law is not a suggestion.”')
  })

  it('wraps a bare sentence and strips matched single quotes', () => {
    expect(formatQuote('  The rest you must earn.  ')).toBe('“The rest you must earn.”')
    expect(formatQuote("'A small truth.'")).toBe('“A small truth.”')
  })
})

describe('Aharietiam record', () => {
  it('names the Herald, renders one clean quote and opens the books', () => {
    const entry = blade('jezrien')
    renderPanel(entry)

    expect(screen.getByRole('heading', { level: 2, name: entry.name })).toBeInTheDocument()
    expect(screen.getByText('“I have given you the sky. The rest you must earn.”')).toBeInTheDocument()
    expect(screen.queryByText(/"I have given you the sky/)).not.toBeInTheDocument()

    const book = screen.getByRole('link', { name: /open the way of kings in the library/i })
    expect(book).toHaveAttribute('href', '/books/the_way_of_kings')
    expect(screen.getByRole('link', { name: /open words of radiance in the library/i })).toBeInTheDocument()
  })

  it('offers a real step back control', () => {
    const entry = blade('jezrien')
    const onClose = renderPanel(entry)
    fireEvent.click(screen.getByRole('button', { name: /step back from jezrien/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('turns into a paper sheet on a phone', () => {
    const entry = blade('jezrien')
    renderPanel(entry, true)
    expect(screen.getByText('Swipe the field to turn the ring.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /step back from jezrien/i })).toBeInTheDocument()
  })
})
