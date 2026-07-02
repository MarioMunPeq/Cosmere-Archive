import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import StatsPage from '@/pages/StatsPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <StatsPage />
    </MemoryRouter>,
  )
}

describe('StatsPage', () => {
  it('renders the hero title', () => {
    renderPage()
    const headings = screen.getAllByRole('heading', { name: /cosmere in numbers/i })
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })

  it('renders stat cards with counts', () => {
    renderPage()
    expect(screen.getAllByText('Books').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Characters').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Planets').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Sagas').length).toBeGreaterThanOrEqual(1)
  })

  it('renders books by saga section', () => {
    renderPage()
    expect(screen.getByText('Books by Saga')).toBeInTheDocument()
  })

  it('renders characters by planet section', () => {
    renderPage()
    expect(screen.getByText('Characters by Planet')).toBeInTheDocument()
  })

  it('renders word count section', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Word Count' })).toBeInTheDocument()
  })

  it('renders publication timeline section', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /publication timeline/i })).toBeInTheDocument()
  })

  it('renders shards section', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Shards' })).toBeInTheDocument()
  })

  it('renders magic systems section', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Magic Systems' })).toBeInTheDocument()
  })

  it('renders timeline density section', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Event Density' })).toBeInTheDocument()
  })

  it('renders the heralds section', () => {
    renderPage()
    expect(screen.getByText('The Heralds')).toBeInTheDocument()
  })

  it('has a back link to the map', () => {
    renderPage()
    expect(screen.getByText('Back to the map')).toBeInTheDocument()
  })
})
