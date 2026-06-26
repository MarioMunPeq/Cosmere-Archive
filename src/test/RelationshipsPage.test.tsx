import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RelationshipsPage from '@/pages/RelationshipsPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <RelationshipsPage />
    </MemoryRouter>,
  )
}

describe('RelationshipsPage', () => {
  it('renders heading', () => {
    renderPage()
    expect(screen.getByText('Character Relationships')).toBeInTheDocument()
  })

  it('renders search input', () => {
    renderPage()
    expect(screen.getByPlaceholderText('Search characters...')).toBeInTheDocument()
  })

  it('shows placeholder when no character selected', () => {
    renderPage()
    expect(screen.getByText('Select a character from the left to see their relationships.')).toBeInTheDocument()
  })

  it('shows character names from the character list', () => {
    renderPage()
    expect(screen.getByText('Kelsier')).toBeInTheDocument()
    expect(screen.getByText('Vin')).toBeInTheDocument()
  })

  it('shows planet groupings for characters', () => {
    renderPage()
    expect(screen.getByText('Scadrial')).toBeInTheDocument()
  })

  it('shows relationship count badges', () => {
    renderPage()
    const badges = screen.getAllByText(/\d+/)
    expect(badges.length).toBeGreaterThan(0)
  })

  it('shows empty state when search matches nothing', async () => {
    renderPage()
    const input = screen.getByPlaceholderText('Search characters...')
    await userEvent.type(input, 'xyznonexistent')
    expect(screen.getByText('No characters match your search.')).toBeInTheDocument()
  })
})
