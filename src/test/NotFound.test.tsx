import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NotFound from '@/pages/NotFound'

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/nope']}>
      <NotFound />
    </MemoryRouter>,
  )
}

describe('NotFound', () => {
  it('renders 404 heading', () => {
    renderPage()
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('shows descriptive message', () => {
    renderPage()
    expect(screen.getByText('This page does not exist in the Cosmere.')).toBeInTheDocument()
  })

  it('has a link back to the map', () => {
    renderPage()
    const link = screen.getByText('Back to the map')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', '/')
  })

  it('has a Go back button', () => {
    renderPage()
    expect(screen.getByText('Go back')).toBeInTheDocument()
  })
})
