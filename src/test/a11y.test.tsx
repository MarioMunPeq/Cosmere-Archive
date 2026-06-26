import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
  it('renders a search combobox', () => {
    renderSearchBar()
    const input = screen.getByRole('combobox')
    expect(input).toBeTruthy()
  })

  it('input has accessible name via placeholder', () => {
    renderSearchBar()
    const input = screen.getByRole('combobox')
    expect(input.getAttribute('placeholder')).toBeTruthy()
  })

  it('has a labelled input', () => {
    renderSearchBar()
    expect(screen.getByLabelText('Search the Cosmere')).toBeInTheDocument()
  })

  it('renders search results with listbox role when results exist', async () => {
    renderSearchBar()
    const input = screen.getByRole('combobox')
    await userEvent.type(input, 'Kelsier')
    expect(await screen.findByRole('listbox')).toBeInTheDocument()
  })
})
