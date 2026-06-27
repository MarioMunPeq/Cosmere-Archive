import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CharactersPage from '@/pages/CharactersPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <CharactersPage />
    </MemoryRouter>,
  )
}

describe('CharactersPage', () => {
  it('renders the page title', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /characters/i })).toBeInTheDocument()
  })

  it('renders character cards', () => {
    renderPage()
    expect(screen.getByText('Kaladin')).toBeInTheDocument()
    expect(screen.getByText('Vin')).toBeInTheDocument()
  })

  it('renders planet filter dropdown', () => {
    renderPage()
    expect(screen.getByRole('combobox', { name: /filter by planet/i })).toBeInTheDocument()
  })

  it('renders saga filter dropdown', () => {
    renderPage()
    expect(screen.getByRole('combobox', { name: /filter by saga/i })).toBeInTheDocument()
  })

  it('has a search input', () => {
    renderPage()
    expect(screen.getByPlaceholderText('Search characters...')).toBeInTheDocument()
  })

  it('has a back link to the map', () => {
    renderPage()
    expect(screen.getByText('Back to the map')).toBeInTheDocument()
  })
})
