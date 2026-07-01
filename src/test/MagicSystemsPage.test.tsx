import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import MagicSystemsPage from '@/pages/MagicSystemsPage'

function renderMagicTab() {
  return render(
    <MemoryRouter initialEntries={['/magic']}>
      <MagicSystemsPage />
    </MemoryRouter>,
  )
}

describe('MagicSystemsPage', () => {
  it('renders heading', () => {
    renderMagicTab()
    expect(screen.getByRole('heading', { name: 'Magic Systems' })).toBeInTheDocument()
  })

  it('renders planet filter dropdown', () => {
    renderMagicTab()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('All Planets')).toBeInTheDocument()
  })

  it('has a search input', () => {
    renderMagicTab()
    expect(screen.getByPlaceholderText('Search systems...')).toBeInTheDocument()
  })

  it('shows planet groupings by default', () => {
    renderMagicTab()
    expect(screen.getAllByText('Scadrial').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Roshar').length).toBeGreaterThanOrEqual(1)
  })

  it('shows magic system names under planets', () => {
    renderMagicTab()
    expect(screen.getAllByText('Allomancy').length).toBeGreaterThanOrEqual(1)
  })

  it('shows system shard info in cards', () => {
    renderMagicTab()
    expect(screen.getAllByText('Honor').length).toBeGreaterThanOrEqual(1)
  })

  it('filters by planet when dropdown changes', async () => {
    renderMagicTab()
    const select = screen.getByRole('combobox')
    await userEvent.selectOptions(select, 'scadrial')
    expect(screen.getAllByText('Allomancy').length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByText('Surgebinding')).not.toBeInTheDocument()
  })

  it('opens detail panel when a system is clicked', async () => {
    renderMagicTab()
    await userEvent.click(screen.getAllByText('Allomancy')[0]!)
    expect(await screen.findByText(/Appears in/)).toBeInTheDocument()
  })

  it('shows detail content in the panel', async () => {
    renderMagicTab()
    await userEvent.click(screen.getByText('AonDor'))
    expect(await screen.findByText(/Appears in/i)).toBeInTheDocument()
  })

  it('shows AllomanticTable for allomancy when expanded', async () => {
    renderMagicTab()
    await userEvent.click(screen.getAllByText('Allomancy')[0]!)
    await userEvent.click(await screen.findByText('The Sixteen Metals'))
    expect(await screen.findByText('Steel')).toBeInTheDocument()
    expect(await screen.findByText('Iron')).toBeInTheDocument()
  })

  it('shows known users in detail panel', async () => {
    renderMagicTab()
    await userEvent.click(screen.getByText('AonDor'))
    expect(await screen.findByText(/Known users/i)).toBeInTheDocument()
  })

  it('does not show detail panel by default', () => {
    renderMagicTab()
    expect(screen.queryByText('Appears in')).not.toBeInTheDocument()
  })

  it('filters systems by search input', async () => {
    renderMagicTab()
    const search = screen.getByPlaceholderText('Search systems...')
    await userEvent.type(search, 'AonDor')
    await waitFor(() => {
      expect(screen.queryByText('Allomancy')).not.toBeInTheDocument()
    })
    expect(screen.getByText('AonDor')).toBeInTheDocument()
  })

  it('has a close button on the detail panel', async () => {
    renderMagicTab()
    await userEvent.click(screen.getByText('AonDor'))
    expect(await screen.findByLabelText('Close detail')).toBeInTheDocument()
  })
})
