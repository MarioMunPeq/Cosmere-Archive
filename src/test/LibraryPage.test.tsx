import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LibraryPage from '@/pages/LibraryPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <LibraryPage />
    </MemoryRouter>,
  )
}

describe('LibraryPage', () => {
  it('renders the page title', () => {
    renderPage()
    expect(screen.getByText('The Cosmere Collection')).toBeInTheDocument()
  })

  it('renders volume count', () => {
    renderPage()
    expect(screen.getByText(/volumes/)).toBeInTheDocument()
  })

  it('has a back link to the map', () => {
    renderPage()
    expect(screen.getByText('Back to the map')).toBeInTheDocument()
  })
})
