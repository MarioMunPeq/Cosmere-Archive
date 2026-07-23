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
  it('renders the document not found title', () => {
    renderPage()
    expect(screen.getByText('DOCUMENT NOT FOUND')).toBeInTheDocument()
  })

  it('shows the archive-style description', () => {
    renderPage()
    expect(screen.getByText(/No known record exists under this designation/)).toBeInTheDocument()
  })

  it('has a Restore Record button', () => {
    renderPage()
    expect(screen.getByText('Restore Record')).toBeInTheDocument()
  })

  it('has a Return to Archive button', () => {
    renderPage()
    expect(screen.getByText('Return to Archive')).toBeInTheDocument()
  })

  it('has an Open Index link', () => {
    renderPage()
    expect(screen.getByText('Open Index')).toBeInTheDocument()
  })
})
