import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import BookCover from '@/components/common/BookCover'
import type { Book } from '@/types/book'

const mockBook: Book = {
  id: 'the_way_of_kings',
  title: 'The Way of Kings',
  saga: 'stormlight_archive',
  order: 1,
  year: 2010,
  description: 'The first book of The Stormlight Archive.',
}

describe('BookCover', () => {
  it('renders book title', () => {
    render(<BookCover book={mockBook} />)
    expect(screen.getByLabelText('Cover of The Way of Kings')).toBeInTheDocument()
  })

  it('renders with md size', () => {
    const { container } = render(<BookCover book={mockBook} size="md" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})
