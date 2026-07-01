import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CharactersPage from '@/pages/CharactersPage'

function renderPage(initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
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
    expect(screen.getAllByText('Kaladin').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Vin').length).toBeGreaterThanOrEqual(1)
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

  describe('relationships tab', () => {
    it('renders the relationships heading', () => {
      renderPage(['/characters?tab=relationships'])
      expect(screen.getByText('Character Relationships')).toBeInTheDocument()
    })

    it('shows search input in single view', () => {
      renderPage(['/characters?tab=relationships'])
      expect(screen.getByPlaceholderText('Search characters...')).toBeInTheDocument()
    })

    it('preselects Hoid by default in single view', () => {
      renderPage(['/characters?tab=relationships'])
      expect(screen.getAllByText('Hoid').length).toBeGreaterThanOrEqual(1)
    })

    it('shows character names from the character list', () => {
      renderPage(['/characters?tab=relationships'])
      expect(screen.getAllByText('Kelsier').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Vin').length).toBeGreaterThanOrEqual(1)
    })

    it('shows planet groupings', () => {
      renderPage(['/characters?tab=relationships'])
      expect(screen.getByText('Scadrial')).toBeInTheDocument()
    })

    it('has graph view and single view toggle buttons', () => {
      renderPage(['/characters?tab=relationships'])
      expect(screen.getByText('Single View')).toBeInTheDocument()
      expect(screen.getByText('Graph View')).toBeInTheDocument()
    })
  })
})
