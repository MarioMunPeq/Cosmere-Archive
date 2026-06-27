import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TransitionLink from '@/components/ui/TransitionLink'

function renderLink(to: string, label: string) {
  return render(
    <MemoryRouter>
      <TransitionLink to={to}>{label}</TransitionLink>
    </MemoryRouter>,
  )
}

describe('TransitionLink', () => {
  it('renders an anchor with the given href', () => {
    renderLink('/books', 'Books')
    const link = screen.getByText('Books')
    expect(link.closest('a')).toHaveAttribute('href', '/books')
  })

  it('prevents default on click and navigates', () => {
    renderLink('/books', 'Books')
    const link = screen.getByText('Books')
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true })
    const prevented = !link.dispatchEvent(clickEvent)
    expect(prevented).toBe(true)
  })
})
