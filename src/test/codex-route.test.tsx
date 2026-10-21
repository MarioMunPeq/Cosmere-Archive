import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { useCodexRoute } from '@/hooks/useCodexRoute'
import { buildSpreads, type CodexLeaf, type CodexSection } from '@/utils/codex-pages'

function leaf(id: string, extra: Partial<CodexLeaf> = {}): CodexLeaf {
  return { id, title: id, ...extra }
}

const SECTIONS: CodexSection[] = [
  {
    leaves: [leaf('contents', { frontMatter: true, view: 'contents' }), leaf('title', { frontMatter: true })],
  },
  {
    leaves: [
      leaf('chapter-roshar', { title: 'Roshar', chapterId: 'roshar', view: 'chapter' }),
      leaf('system-surgebinding', { title: 'Surgebinding', chapterId: 'roshar', systemIds: ['surgebinding'] }),
      leaf('system-voidbinding', { title: 'Voidbinding', chapterId: 'roshar', systemIds: ['voidbinding'] }),
      leaf('system-old-magic', { title: 'Old Magic', chapterId: 'roshar', systemIds: ['old-magic'] }),
    ],
  },
  {
    leaves: [
      leaf('record-kaladin', { title: 'Kaladin', characterIds: ['kaladin'], view: 'records' }),
      leaf('record-shallan', { title: 'Shallan', characterIds: ['shallan'], view: 'records' }),
    ],
  },
  {
    leaves: [leaf('family-kholin', { title: 'Kholin', familyIds: ['kholin'], view: 'bloodlines' })],
  },
  {
    leaves: [leaf('search', { title: 'Search', view: 'search' }), leaf('search-worlds', { title: 'Worlds' })],
  },
  {
    leaves: [leaf('index', { title: 'Index', view: 'index' }), leaf('index-world', { title: 'Worlds' })],
  },
]

const SPREADS = buildSpreads(SECTIONS)

function Probe() {
  const route = useCodexRoute({ spreads: SPREADS, fallbackId: 'contents' })
  const location = useLocation()
  const navigationType = useNavigationType()
  const navigate = useNavigate()

  return (
    <div>
      <span data-testid="spread">{route.spread?.id ?? 'none'}</span>
      <span data-testid="search">{location.search}</span>
      <span data-testid="type">{navigationType}</span>
      <span data-testid="position">
        {route.index + 1}/{route.total}
      </span>
      <button type="button" onClick={() => route.openSpread('chapter-roshar')}>
        open chapter
      </button>
      <button type="button" onClick={() => route.openSpread('search')}>
        open search
      </button>
      <button type="button" onClick={() => route.turnTo('system-voidbinding')}>
        turn one
      </button>
      <button type="button" onClick={() => route.turnTo('record-kaladin')}>
        turn two
      </button>
      <button type="button" onClick={() => route.turnBy(1)}>
        turn by
      </button>
      <button type="button" onClick={route.first}>
        first
      </button>
      <button type="button" onClick={route.last}>
        last
      </button>
      <button type="button" onClick={() => navigate(-1)}>
        back
      </button>
    </div>
  )
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Probe />
    </MemoryRouter>,
  )
}

async function expectSpread(id: string) {
  await waitFor(() => expect(screen.getByTestId('spread')).toHaveTextContent(id))
}

describe('useCodexRoute', () => {
  it('resolves a legacy system parameter and rewrites the URL', async () => {
    renderAt('/magic?system=voidbinding')

    await expectSpread('system-voidbinding')
    await waitFor(() => expect(screen.getByTestId('search')).toHaveTextContent('?spread=system-voidbinding'))
    expect(screen.getByTestId('search')).not.toHaveTextContent('system=')
  })

  it('resolves character and family parameters', async () => {
    const { unmount } = renderAt('/characters?character=shallan')
    await expectSpread('record-kaladin')
    await waitFor(() => expect(screen.getByTestId('search')).toHaveTextContent('?spread=record-kaladin'))
    unmount()

    renderAt('/characters?family=kholin')
    await expectSpread('family-kholin')
    await waitFor(() => expect(screen.getByTestId('search')).toHaveTextContent('?spread=family-kholin'))
  })

  it('keeps q only on the search spread', async () => {
    renderAt('/characters?q=kaladin')

    await expectSpread('search')
    await waitFor(() => expect(screen.getByTestId('search')).toHaveTextContent('?spread=search&q=kaladin'))

    await userEvent.click(screen.getByRole('button', { name: 'open chapter' }))
    await expectSpread('chapter-roshar')
    await waitFor(() => expect(screen.getByTestId('search')).toHaveTextContent('?spread=chapter-roshar'))
  })

  it('falls back when a parameter points nowhere and canonicalises the URL', async () => {
    renderAt('/magic?system=nope')

    await expectSpread('contents')
    await waitFor(() => expect(screen.getByTestId('search')).toHaveTextContent('?spread=contents'))
  })

  it('lets an explicit spread win over a legacy parameter', async () => {
    renderAt('/magic?spread=chapter-roshar&system=voidbinding')

    await expectSpread('chapter-roshar')
    await waitFor(() => expect(screen.getByTestId('search')).toHaveTextContent('?spread=chapter-roshar'))
  })

  it('pushes entry changes but replaces page turns', async () => {
    renderAt('/magic?spread=contents')
    await expectSpread('contents')

    await userEvent.click(screen.getByRole('button', { name: 'open chapter' }))
    await expectSpread('chapter-roshar')
    await waitFor(() => expect(screen.getByTestId('type')).toHaveTextContent('PUSH'))

    await userEvent.click(screen.getByRole('button', { name: 'turn one' }))
    await expectSpread('system-voidbinding')
    await waitFor(() => expect(screen.getByTestId('type')).toHaveTextContent('REPLACE'))

    await userEvent.click(screen.getByRole('button', { name: 'turn two' }))
    await expectSpread('record-kaladin')
    await waitFor(() => expect(screen.getByTestId('type')).toHaveTextContent('REPLACE'))

    await userEvent.click(screen.getByRole('button', { name: 'back' }))
    await expectSpread('contents')
    expect(screen.getByTestId('search')).toHaveTextContent('?spread=contents')
  })

  it('turns by delta and jumps to first/last with replace', async () => {
    renderAt('/magic?spread=chapter-roshar')
    await expectSpread('chapter-roshar')

    await userEvent.click(screen.getByRole('button', { name: 'turn by' }))
    await expectSpread('system-voidbinding')

    await userEvent.click(screen.getByRole('button', { name: 'last' }))
    await expectSpread('index')
    expect(screen.getByTestId('position')).toHaveTextContent(`${SPREADS.length}/${SPREADS.length}`)

    await userEvent.click(screen.getByRole('button', { name: 'first' }))
    await expectSpread('contents')
  })

  it('does not record a history entry for the spread already open', async () => {
    renderAt('/magic?spread=chapter-roshar')
    await expectSpread('chapter-roshar')

    await userEvent.click(screen.getByRole('button', { name: 'open chapter' }))
    await expectSpread('chapter-roshar')
    expect(screen.getByTestId('type')).toHaveTextContent('POP')
  })
})
