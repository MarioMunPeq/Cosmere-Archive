import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ReadingOrderPage from '@/pages/ReadingOrderPage'
import { READING_ORDER_KEY } from '@/data/static/reading-order'

function renderPage() {
  return render(
    <MemoryRouter>
      <ReadingOrderPage />
    </MemoryRouter>,
  )
}

describe('ReadingOrderPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders heading', () => {
    renderPage()
    expect(screen.getByText('Reading Order')).toBeInTheDocument()
  })

  it('shows recommended reading order text', () => {
    renderPage()
    expect(screen.getByText(/Brandon Sanderson/)).toBeInTheDocument()
  })

  it('renders books from the reading order list', () => {
    renderPage()
    expect(screen.getByText('The Way of Kings')).toBeInTheDocument()
    expect(screen.getByText('Elantris')).toBeInTheDocument()
  })

  it('displays progress bar with 0 of N', () => {
    renderPage()
    expect(screen.getByText(/0 of/)).toBeInTheDocument()
  })

  it('restores progress from localStorage on mount', () => {
    localStorage.setItem(READING_ORDER_KEY, JSON.stringify(['elantris']))
    renderPage()
    expect(screen.getByText(/1 of/)).toBeInTheDocument()
  })
})
