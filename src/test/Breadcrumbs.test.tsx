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
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing for a single-segment path', () => {
    const { container } = renderAt('/library')
    expect(container).toBeEmptyDOMElement()
  })

  it('shows breadcrumb trail for a nested path', () => {
    renderAt('/records/shards/honor')
    expect(screen.getByText('records')).toBeInTheDocument()
    expect(screen.getByText('honor')).toBeInTheDocument()
    expect(screen.getByLabelText('Breadcrumb')).toBeInTheDocument()
  })

  it('links the parent segment to the correct path', () => {
    renderAt('/records/shards/honor')
    const link = screen.getByText('records')
    expect(link.closest('a')).toHaveAttribute('href', '/records')
  })

  it('marks the current page with aria-current', () => {
    renderAt('/records/shards/honor')
    const current = screen.getByText('honor')
    expect(current).toHaveAttribute('aria-current', 'page')
  })

  it('names the library in the trail when nested', () => {
    renderAt('/library/archive')
    expect(screen.getByText('Library')).toBeInTheDocument()
  })
})
