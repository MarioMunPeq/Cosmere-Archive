import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import About from '@/pages/About'

function renderPage() {
  return render(
    <MemoryRouter>
      <About />
    </MemoryRouter>,
  )
}

describe('About', () => {
  it('renders heading', () => {
    renderPage()
    expect(screen.getByText('About')).toBeInTheDocument()
  })

  it('renders feature list', () => {
    renderPage()
    expect(screen.getByText(/Interactive map/i)).toBeInTheDocument()
    expect(screen.getByText(/Global search/i)).toBeInTheDocument()
  })

  it('has a link back to the map', () => {
    renderPage()
    const link = screen.getByText('Back to the map')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', '/')
  })

  it('renders data source links', () => {
    renderPage()
    const coppermind = screen.getByText('The Coppermind')
    expect(coppermind.closest('a')).toHaveAttribute('href', 'https://coppermind.net')
  })
})
