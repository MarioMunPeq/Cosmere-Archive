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
  it('renders the archive title', () => {
    renderPage()
    expect(screen.getByText('The Cosmere Archive')).toBeInTheDocument()
  })

  it('renders stat cards with counts', () => {
    renderPage()
    expect(screen.getAllByText('Books').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Characters').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Planets').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Sagas').length).toBeGreaterThanOrEqual(1)
  })

  it('renders volumes by cycle section', () => {
    renderPage()
    expect(screen.getByText('VOLUMES BY CYCLE')).toBeInTheDocument()
  })

  it('renders population census section', () => {
    renderPage()
    expect(screen.getByText('POPULATION CENSUS')).toBeInTheDocument()
  })

  it('renders word count note', () => {
    renderPage()
    expect(screen.getByText(/Total words recorded/i)).toBeInTheDocument()
  })

  it('renders publication chronology section', () => {
    renderPage()
    expect(screen.getByText('PUBLICATION CHRONOLOGY')).toBeInTheDocument()
  })

  it('renders shardic distribution section', () => {
    renderPage()
    expect(screen.getByText('SHARDIC DISTRIBUTION')).toBeInTheDocument()
  })

  it('renders the heralds section', () => {
    renderPage()
    expect(screen.getByText('THE HERALDS OF THE ALMIGHTY')).toBeInTheDocument()
  })

  it('has a back link to the map', () => {
    renderPage()
    expect(screen.getByText(/Back to map/i)).toBeInTheDocument()
  })
})
