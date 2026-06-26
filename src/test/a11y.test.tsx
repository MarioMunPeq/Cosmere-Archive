import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SearchBar from '@/components/common/SearchBar'

function renderSearchBar() {
  return render(
    <MemoryRouter>
      <SearchBar />
    </MemoryRouter>,
  )
}

describe('SearchBar — accessibility', () => {
  it('renders a search input', () => {
    renderSearchBar()
    const input = screen.getByRole('combobox')
    expect(input).toBeTruthy()
  })

  it('input has a placeholder for accessible name', () => {
    renderSearchBar()
    const input = screen.getByRole('combobox')
    expect(input.getAttribute('placeholder')).toBeTruthy()
  })
})
