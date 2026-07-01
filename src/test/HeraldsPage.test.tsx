import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import HeraldsPage from '@/pages/HeraldsPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <HeraldsPage />
    </MemoryRouter>,
  )
}

describe('HeraldsPage', () => {
  it('renders the heading "The Oathpact"', () => {
    renderPage()
    expect(screen.getByText('The Oathpact')).toBeInTheDocument()
  })

  it('renders SVG with accessible role and label', () => {
    renderPage()
    const svg = screen.getByRole('img', { name: 'Honorblades of the Heralds' })
    expect(svg).toBeInTheDocument()
  })

  it('renders known herald names as button labels', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Jezrien' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nale' })).toBeInTheDocument()
  })

  it('shows detail panel when a herald is selected', async () => {
    renderPage()
    const btn = screen.getByRole('button', { name: 'Jezrien' })
    await userEvent.click(btn)
    expect(screen.getByText('Herald of Kings')).toBeInTheDocument()
  })

  it('shows surges after selection', async () => {
    renderPage()
    const btn = screen.getByRole('button', { name: 'Jezrien' })
    await userEvent.click(btn)
    expect(screen.getByText('Adhesion')).toBeInTheDocument()
    expect(screen.getByText('Gravitation')).toBeInTheDocument()
  })

  it('shows placeholder text when no herald is selected', () => {
    renderPage()
    expect(screen.getByText("Select a Herald's Honorblade")).toBeInTheDocument()
  })

  it('shows Taln special badge when Taln is selected', async () => {
    renderPage()
    const btn = screen.getByRole('button', { name: 'Taln' })
    await userEvent.click(btn)
    expect(screen.getByText('The only Herald who never abandoned the Oathpact.')).toBeInTheDocument()
  })

  it('displays the subtitle about abandonment', () => {
    renderPage()
    expect(screen.getByText(/Nine abandoned it/)).toBeInTheDocument()
  })

  it('shows the sword count hint in placeholder', () => {
    renderPage()
    expect(screen.getByText(/9 swords fallen/)).toBeInTheDocument()
  })

  it('supports keyboard selection via Enter', async () => {
    renderPage()
    const btn = screen.getByRole('button', { name: 'Jezrien' })
    btn.focus()
    await userEvent.keyboard('{Enter}')
    expect(await screen.findByText('Herald of Kings')).toBeInTheDocument()
  })

  it('renders all 10 Heralds as interactive buttons', () => {
    renderPage()
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(10)
  })

  it('shows the standing sword hint in placeholder', () => {
    renderPage()
    expect(screen.getByText(/1 remains standing/)).toBeInTheDocument()
  })
})
