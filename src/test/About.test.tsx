import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import About from '@/pages/About'

function renderPage() {
  return render(
    <MemoryRouter>
      <About />
    </MemoryRouter>,
  )
}

describe('About', () => {
  it('renders the main title', () => {
    renderPage()
    expect(screen.getByText('About the Archive')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    renderPage()
    expect(screen.getByText(/A personal project inspired by/)).toBeInTheDocument()
  })

  it('renders author name in info block', () => {
    renderPage()
    expect(screen.getAllByText('Mario Muñoz Pequeño').length).toBeGreaterThanOrEqual(1)
  })

  it('renders Sources and Thanks sections', () => {
    renderPage()
    expect(screen.getByText('Sources')).toBeInTheDocument()
    expect(screen.getByText('Thanks')).toBeInTheDocument()
  })

  it('renders Contact section with links', () => {
    renderPage()
    expect(screen.getByText('Contact')).toBeInTheDocument()
    const linkedin = screen.getByText('LinkedIn')
    expect(linkedin.closest('a')).toHaveAttribute('href', 'https://www.linkedin.com/in/mario-mu%C3%B1oz-peque%C3%B1o/')
    const github = screen.getByText('GitHub')
    expect(github.closest('a')).toHaveAttribute('href', 'https://github.com/MarioMunPeq')
  })

  it('renders Coppermind source link', () => {
    renderPage()
    const coppermind = screen.getByText('The Coppermind')
    expect(coppermind.closest('a')).toHaveAttribute('href', 'https://coppermind.net')
  })
})
