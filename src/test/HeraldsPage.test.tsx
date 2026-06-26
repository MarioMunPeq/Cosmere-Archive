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
  it('renders heading', () => {
    renderPage()
    expect(screen.getByText('The Heralds of the Almighty')).toBeInTheDocument()
  })

  it('renders SVG with accessible role and label', () => {
    renderPage()
    const svg = screen.getByRole('img', { name: 'Heralds circle' })
    expect(svg).toBeInTheDocument()
  })

  it('renders known herald names in the SVG', () => {
    renderPage()
    expect(screen.getByText('Jezrien')).toBeInTheDocument()
    expect(screen.getByText('Nale')).toBeInTheDocument()
  })

  it('shows detail panel when a herald is selected via role=button', async () => {
    renderPage()
    const btn = screen.getByRole('button', { name: /Jezrien/i })
    await userEvent.click(btn)
    expect(screen.getByText('Herald of Kings')).toBeInTheDocument()
  })

  it('shows surges after selection', async () => {
    renderPage()
    const btn = screen.getByRole('button', { name: /Jezrien/i })
    await userEvent.click(btn)
    expect(screen.getByText('Adhesion')).toBeInTheDocument()
    expect(screen.getByText('Gravitation')).toBeInTheDocument()
  })

  it('shows placeholder when no herald is selected', () => {
    renderPage()
    expect(screen.getByText('Select a Herald from the circle')).toBeInTheDocument()
  })

  it('supports keyboard selection via Enter', async () => {
    renderPage()
    const btn = screen.getByRole('button', { name: /Jezrien/i })
    btn.focus()
    await userEvent.keyboard('{Enter}')
    expect(await screen.findByText('Herald of Kings')).toBeInTheDocument()
  })
})
