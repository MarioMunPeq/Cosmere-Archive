/**
 * M2 · Block 1 — the primitives.
 *
 * These tests deliberately check behaviour that is invisible in a screenshot
 * and absent from the type signature: the ARIA wiring, the touch-target
 * minimums, and the rules that stop a primitive being used the wrong way.
 * A regression here is a regression every screen inherits at once, so it is
 * worth pinning down.
 */

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import type { ReactElement } from 'react'
import { useState } from 'react'

import Button from '@/components/primitives/Button'
import Chip, { ToggleChip } from '@/components/primitives/Chip'
import Dialog from '@/components/primitives/Dialog'
import EmptyState from '@/components/primitives/EmptyState'
import Field from '@/components/primitives/Field'
import Icon, { SearchGlyph } from '@/components/primitives/Icon'
import Link from '@/components/primitives/Link'
import ScrollArea from '@/components/primitives/ScrollArea'
import SegmentedControl from '@/components/primitives/SegmentedControl'
import Tabs from '@/components/primitives/Tabs'
import { SkeletonBlock } from '@/components/primitives/Skeleton'
import Tooltip from '@/components/primitives/Tooltip'
import VisuallyHidden from '@/components/primitives/VisuallyHidden'

const wrap = (ui: ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('Button', () => {
  it('defaults to type=button so it never submits a form by accident', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'button')
  })

  it('keeps its accessible name while loading', () => {
    render(<Button loading>Publish</Button>)
    const btn = screen.getByRole('button', { name: 'Publish' })
    expect(btn).toHaveAttribute('aria-busy', 'true')
    expect(btn).toBeDisabled()
  })

  it('stays disabled when either disabled or loading is set', () => {
    const { rerender } = render(<Button disabled>Go</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
    rerender(<Button loading>Go</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('md and lg meet the 44px touch target minimum (WCAG 2.5.8)', () => {
    // md is h-11 and lg is h-12; sm (h-8) is the documented exception.
    const cases = [
      ['md', 'h-11'],
      ['lg', 'h-12'],
    ] as const
    for (const [size, expected] of cases) {
      const { unmount } = render(<Button size={size}>Go</Button>)
      expect(screen.getByRole('button').className).toContain(expected)
      unmount()
    }
  })
})

describe('Link', () => {
  it('renders a real anchor so it can be opened in a new tab', () => {
    wrap(<Link to="/library">Library</Link>)
    const a = screen.getByRole('link', { name: 'Library' })
    expect(a.tagName).toBe('A')
    expect(a).toHaveAttribute('href', '/library')
  })

  it('marks the current destination with aria-current, not colour alone', () => {
    wrap(<Link to="/library">Library</Link>)
    // MemoryRouter starts at "/", so nothing is current yet.
    const link = screen.getByRole('link', { name: 'Library' })
    expect(link.querySelector('[aria-current]')).toBeNull()
  })

  it('sets aria-current="page" on the active destination', () => {
    render(
      <MemoryRouter initialEntries={['/library']}>
        <Link to="/library">Library</Link>
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Library' }).querySelector('[aria-current]')).toHaveAttribute(
      'aria-current',
      'page',
    )
  })
})

describe('Chip', () => {
  it('a static Chip is not exposed as a control', () => {
    render(<Chip>Roshar</Chip>)
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByText('Roshar')).toBeInTheDocument()
  })

  it('ToggleChip owns aria-pressed and reflects the selected state', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const { rerender } = render(
      <ToggleChip selected={false} onClick={onClick}>
        Honor
      </ToggleChip>,
    )
    expect(screen.getByRole('button', { name: /Honor/ })).toHaveAttribute('aria-pressed', 'false')
    rerender(
      <ToggleChip selected onClick={onClick}>
        Honor
      </ToggleChip>,
    )
    expect(screen.getByRole('button', { name: /Honor/ })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('hides the decorative dot from assistive tech', () => {
    const { container } = render(<Chip dot="#fff">Roshar</Chip>)
    const dot = container.querySelector('span[aria-hidden]')
    expect(dot).toBeTruthy()
  })
})

describe('Field', () => {
  it('always associates a label with the input (WCAG 3.3.2)', () => {
    render(<Field label="Search the archives" />)
    const input = screen.getByLabelText('Search the archives')
    expect(input).toBeInTheDocument()
  })

  it('keeps the label in the accessibility tree when hideLabel is set', () => {
    render(<Field label="Filter" hideLabel />)
    // Visually clipped, still announced.
    expect(screen.getByLabelText('Filter')).toBeInTheDocument()
  })

  it('marks the field invalid and links the error message', () => {
    render(<Field label="Query" error="Too short" />)
    const input = screen.getByLabelText('Query')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    const described = input.getAttribute('aria-describedby')
    expect(described).toBeTruthy()
    expect(document.getElementById(described!)).toHaveTextContent('Too short')
  })

  it('only shows the clear button when there is something to clear', async () => {
    const { rerender } = render(<Field label="Query" clearable value="" onClear={() => {}} />)
    expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull()
    rerender(<Field label="Query" clearable value="kal" onClear={() => {}} />)
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument()
  })

  it('announces status through a polite live region', () => {
    render(<Field label="Query" status="12 results" />)
    expect(screen.getByRole('status')).toHaveTextContent('12 results')
  })
})

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

describe('Tabs', () => {
  const items = [
    { id: 'records', label: 'Character Records' },
    { id: 'bloodlines', label: 'Bloodlines' },
    { id: 'connections', label: 'Connections' },
  ]

  it('exposes a tablist with a name and links each tab to its panel', () => {
    render(<Tabs items={items} value="records" onChange={() => {}} label="Archive chapters" />)
    const list = screen.getByRole('tablist', { name: 'Archive chapters' })
    expect(list).toBeInTheDocument()
    const tab = screen.getByRole('tab', { name: 'Character Records' })
    const controls = tab.getAttribute('aria-controls')
    expect(controls).toBeTruthy()
  })

  it('puts only the selected tab in the page tab order (roving tabindex)', () => {
    render(<Tabs items={items} value="bloodlines" onChange={() => {}} label="Chapters" />)
    expect(screen.getByRole('tab', { name: 'Bloodlines' })).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('tab', { name: 'Connections' })).toHaveAttribute('tabindex', '-1')
  })

  it('moves the selection with the arrow keys', async () => {
    const user = userEvent.setup()
    // Controlled, so the wrapper owns the value; otherwise a second arrow press
    // would compute its index from the original selection.
    function Harness() {
      const [value, setValue] = useState('records')
      return <Tabs items={items} value={value} onChange={setValue} label="Chapters" />
    }
    render(<Harness />)
    screen.getByRole('tab', { name: 'Character Records' }).focus()

    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Bloodlines' })).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('tab', { name: 'Character Records' })).toHaveAttribute('aria-selected', 'true')
  })

  it('wraps around and jumps to the ends', async () => {
    const user = userEvent.setup()
    function Harness() {
      const [value, setValue] = useState('records')
      return <Tabs items={items} value={value} onChange={setValue} label="Chapters" />
    }
    render(<Harness />)
    screen.getByRole('tab', { name: 'Character Records' }).focus()
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('tab', { name: 'Connections' })).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{Home}')
    expect(screen.getByRole('tab', { name: 'Character Records' })).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{End}')
    expect(screen.getByRole('tab', { name: 'Connections' })).toHaveAttribute('aria-selected', 'true')
  })
})

describe('SegmentedControl', () => {
  const segments = [
    { value: 'shelves', label: 'Shelves' },
    { value: 'list', label: 'List' },
  ]

  it('is a radiogroup, not a pair of buttons', () => {
    render(<SegmentedControl segments={segments} value="shelves" onChange={() => {}} label="View" />)
    expect(screen.getByRole('radiogroup', { name: 'View' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Shelves' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'List' })).toHaveAttribute('aria-checked', 'false')
  })

  it('cycles with the arrow keys', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SegmentedControl segments={segments} value="shelves" onChange={onChange} label="View" />)
    screen.getByRole('radio', { name: 'Shelves' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenCalledWith('list')
  })
})

describe('Tooltip', () => {
  it('appears on keyboard focus, not only on hover', async () => {
    const user = userEvent.setup()
    render(
      <Tooltip content="Return to the index">
        <button type="button">Home</button>
      </Tooltip>,
    )
    expect(screen.queryByRole('tooltip')).toBeNull()
    // userEvent.tab dispatches the focusin that React's onFocus listens for;
    // a bare .focus() does not reach React in jsdom.
    await user.tab()
    expect(screen.getByRole('tooltip')).toHaveTextContent('Return to the index')
  })

  it('is dismissible with Escape (WCAG 1.4.13)', async () => {
    const user = userEvent.setup()
    render(
      <Tooltip content="Tip">
        <button type="button">Home</button>
      </Tooltip>,
    )
    await user.tab()
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('tooltip')).toBeNull()
  })
})

describe('EmptyState', () => {
  it('names the situation and offers a way out', () => {
    render(
      <EmptyState
        title="No worldhopper matches Taln"
        description="Taln never left Canticle, so he has no recorded journey."
        action={<Button>Clear filters</Button>}
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

describe('SkeletonBlock', () => {
  it('is hidden from assistive tech and does not announce layout', () => {
    const { container } = render(<SkeletonBlock width="40%" />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('ScrollArea', () => {
  it('renders a single scroll container with the content inside', () => {
    render(
      <ScrollArea>
        <p>shelves</p>
      </ScrollArea>,
    )
    expect(screen.getByText('shelves')).toBeInTheDocument()
  })
})
