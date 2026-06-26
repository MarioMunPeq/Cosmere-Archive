import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import MagicSystemsPage from '@/pages/MagicSystemsPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <MagicSystemsPage />
    </MemoryRouter>,
  )
}

describe('MagicSystemsPage', () => {
  it('renders heading', () => {
    renderPage()
    expect(screen.getByText('Magic Systems')).toBeInTheDocument()
  })

  it('renders planet filter dropdown', () => {
    renderPage()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('All Planets')).toBeInTheDocument()
  })

  it('shows planet groupings by default', () => {
    renderPage()
    expect(screen.getAllByText('Scadrial').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Roshar').length).toBeGreaterThanOrEqual(1)
  })

  it('shows magic system names under planets', () => {
    renderPage()
    expect(screen.getAllByText('Allomancy').length).toBeGreaterThanOrEqual(1)
  })

  it('shows system count per planet', () => {
    renderPage()
    expect(screen.getAllByText(/\d system/).length).toBeGreaterThanOrEqual(1)
  })

  it('shows detail panel when a system is selected', async () => {
    renderPage()
    await userEvent.click(screen.getAllByText('Allomancy')[0]!)
    expect(await screen.findByText(/Burning metals/i)).toBeInTheDocument()
  })

  it('shows AllomanticTable for allomancy', async () => {
    renderPage()
    await userEvent.click(screen.getAllByText('Allomancy')[0]!)
    expect(await screen.findByText('Steel')).toBeInTheDocument()
    expect(await screen.findByText('Iron')).toBeInTheDocument()
  })

  it('shows detail panel content when a system is selected', async () => {
    renderPage()
    await userEvent.click(screen.getByText('AonDor'))
    const heading = await screen.findByRole('heading', { name: 'AonDor' })
    expect(heading).toBeInTheDocument()
    expect(screen.getByText('Category')).toBeInTheDocument()
  })

  it('shows placeholder when no system is selected', () => {
    renderPage()
    expect(screen.getByText('Select a magic system')).toBeInTheDocument()
  })

  it('shows system shard info in cards', () => {
    renderPage()
    expect(screen.getAllByText('Honor').length).toBeGreaterThanOrEqual(1)
  })

  it('filters by planet when dropdown changes', async () => {
    renderPage()
    const select = screen.getByRole('combobox')
    await userEvent.selectOptions(select, 'scadrial')
    expect(screen.getAllByText('Allomancy').length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByText('Surgebinding')).not.toBeInTheDocument()
  })

  it('shows SVG diagram when a planet is selected in filter', async () => {
    renderPage()
    const select = screen.getByRole('combobox')
    await userEvent.selectOptions(select, 'scadrial')
    expect(await screen.findByRole('img', { name: /Scadrial/i })).toBeInTheDocument()
  })
})
