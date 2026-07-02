import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BooksPage from '@/pages/BooksPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <BooksPage />
    </MemoryRouter>,
  )
}

describe('BooksPage', () => {
  it('renders saga filter buttons', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mistborn era 1/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /stormlight/i })).toBeInTheDocument()
  })

  it('renders book links', () => {
    renderPage()
    expect(screen.getAllByText('The Final Empire').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('The Way of Kings').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Elantris').length).toBeGreaterThanOrEqual(1)
  })

  it('has a search input', () => {
    renderPage()
    expect(screen.getByPlaceholderText('Search books...')).toBeInTheDocument()
  })

  it('links each book to its detail page', () => {
    renderPage()
    const cover = screen.getByRole('link', { name: /the way of kings/i })
    expect(cover).toHaveAttribute('href', '/books/the_way_of_kings')
  })
})
