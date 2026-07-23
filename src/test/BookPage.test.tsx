import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import BookPage from '@/pages/BookPage'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="books/:id" element={<BookPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('BookPage', () => {
  it('renders book title as heading for a known book', async () => {
    renderAt('/books/the_way_of_kings')
    expect(await screen.findByRole('heading', { name: 'The Way of Kings' })).toBeInTheDocument()
  })

  it('renders description for a known book', async () => {
    renderAt('/books/the_final_empire')
    expect(await screen.findByText(/Vin, a young street urchin/)).toBeInTheDocument()
  })

  it('shows 404 for unknown book id', async () => {
    renderAt('/books/nonexistent')
    expect(await screen.findByText('DOCUMENT NOT FOUND')).toBeInTheDocument()
  })

  it('provides previous/next navigation within the saga', async () => {
    renderAt('/books/words_of_radiance')
    expect(await screen.findByText('The Way of Kings')).toBeInTheDocument()
    expect(await screen.findByText('Oathbringer')).toBeInTheDocument()
  })

  it('shows planets section for a book', async () => {
    renderAt('/books/the_final_empire')
    expect(await screen.findByText('Scadrial')).toBeInTheDocument()
  })

  it('shows magic systems section for a book', async () => {
    renderAt('/books/the_final_empire')
    expect(await screen.findByText('Allomancy')).toBeInTheDocument()
  })

  it('shows characters section for a book', async () => {
    renderAt('/books/the_final_empire')
    expect(await screen.findByText(/^Characters/)).toBeInTheDocument()
    expect(await screen.findByText('Kelsier')).toBeInTheDocument()
  })
})
