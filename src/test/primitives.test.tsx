/**
 * M2 · Block 1 — the primitives that survive.
 *
 * These tests deliberately check behaviour that is invisible in a screenshot
 * and absent from the type signature: the ARIA wiring and the rules that stop
 * a primitive being used the wrong way. A regression here is a regression every
 * screen inherits at once, so it is worth pinning down.
 */

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import Dialog from '@/components/primitives/Dialog'
import EmptyState from '@/components/primitives/EmptyState'
import Icon, { SearchGlyph } from '@/components/primitives/Icon'
import VisuallyHidden from '@/components/primitives/VisuallyHidden'

describe('Dialog', () => {
  it('names itself with aria-labelledby', () => {
    render(
      <Dialog open onClose={() => {}} title="Command palette">
        <p>body</p>
      </Dialog>,
    )
    const dialog = document.querySelector('dialog')
    const labelledby = dialog?.getAttribute('aria-labelledby')
    expect(labelledby).toBeTruthy()
    expect(document.getElementById(labelledby!)).toHaveTextContent('Command palette')
  })

  it('renders no visible heading when hideTitle is set', () => {
    render(
      <Dialog open onClose={() => {}} title="Search" hideTitle>
        <p>body</p>
      </Dialog>,
    )
    const heading = screen.getByRole('heading', { name: 'Search', level: 2 })
    expect(heading.className).toContain('sr-only')
  })
})

describe('EmptyState', () => {
  it('names the situation and offers a way out', () => {
    render(
      <EmptyState
        title="No worldhopper matches Taln"
        description="Taln never left Canticle, so he has no recorded journey."
        action={<button type="button">Clear filters</button>}
      />,
    )
    expect(screen.getByText('No worldhopper matches Taln')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument()
  })
})

describe('Icon', () => {
  it('is hidden from assistive tech when decorative', () => {
    const { container } = render(
      <Icon>
        <SearchGlyph />
      </Icon>,
    )
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('becomes an image with a name when a title is given', () => {
    render(
      <Icon title="Search">
        <SearchGlyph />
      </Icon>,
    )
    expect(screen.getByRole('img', { name: 'Search' })).toBeInTheDocument()
  })
})

describe('VisuallyHidden', () => {
  it('keeps content available to the accessibility tree', () => {
    render(<VisuallyHidden>Archive status</VisuallyHidden>)
    expect(screen.getByText('Archive status')).toBeInTheDocument()
  })

  it('renders the requested tag so the document outline stays correct', () => {
    const { container } = render(<VisuallyHidden as="label">Name</VisuallyHidden>)
    expect(container.querySelector('label')).toBeTruthy()
  })
})
