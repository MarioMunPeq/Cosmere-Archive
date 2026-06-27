import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Breadcrumbs from '@/components/ui/Breadcrumbs'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Breadcrumbs />
    </MemoryRouter>,
  )
}

describe('Breadcrumbs', () => {
  it('renders nothing on the root path', () => {
    const { container } = renderAt('/')
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing for a single-segment path', () => {
    const { container } = renderAt('/books')
    expect(container.innerHTML).toBe('')
  })

  it('shows breadcrumb trail for a nested path', () => {
    renderAt('/books/the_final_empire')
    expect(screen.getByText('Books')).toBeInTheDocument()
    expect(screen.getByText('The Final Empire')).toBeInTheDocument()
    expect(screen.getByLabelText('Breadcrumb')).toBeInTheDocument()
  })

  it('links the parent segment to the correct path', () => {
    renderAt('/books/the_final_empire')
    const link = screen.getByText('Books')
    expect(link.closest('a')).toHaveAttribute('href', '/books')
  })

  it('marks the current page with aria-current', () => {
    renderAt('/books/the_final_empire')
    const current = screen.getByText('The Final Empire')
    expect(current).toHaveAttribute('aria-current', 'page')
  })

  it('shows breadcrumbs for a non-book nested path', () => {
    renderAt('/magic')
    const { container } = renderAt('/magic')
    expect(container.innerHTML).toBe('')
  })
})
