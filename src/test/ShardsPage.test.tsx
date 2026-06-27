import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ShardsPage from '@/pages/ShardsPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <ShardsPage />
    </MemoryRouter>,
  )
}

describe('ShardsPage', () => {
  it('renders the page title', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /shards of adonalsium/i })).toBeInTheDocument()
  })

  it('renders major shards', () => {
    renderPage()
    expect(screen.getByText('Honor')).toBeInTheDocument()
    expect(screen.getByText('Cultivation')).toBeInTheDocument()
    expect(screen.getByText('Odium')).toBeInTheDocument()
    expect(screen.getByText('Preservation')).toBeInTheDocument()
    expect(screen.getByText('Ruin')).toBeInTheDocument()
  })

  it('shows which planets each shard is on', () => {
    renderPage()
    expect(screen.getAllByText('Roshar').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Scadrial').length).toBeGreaterThanOrEqual(1)
  })

  it('has a back link to the map', () => {
    renderPage()
    expect(screen.getByText('Back to the map')).toBeInTheDocument()
  })
})
