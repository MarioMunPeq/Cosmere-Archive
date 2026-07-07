import type { Book } from '@/types'

interface Props {
  book: Book
}

function getSagaLabel(saga: string): string {
  const labels: Record<string, string> = {
    stormlight: 'The Stormlight Archive',
    'mistborn-era-1': 'Mistborn Era One',
    'mistborn-era-2': 'Mistborn Era Two',
    elantris: 'Elantris',
    warbreaker: 'Warbreaker',
    'white-sand': 'White Sand',
    'secret-projects': 'Secret Projects',
    'arcanum-unbounded': 'Arcanum Unbounded',
  }
  return labels[saga] ?? saga
}

export default function BookPageContent({ book }: Props) {
  const wordCountStr = book.wordCount ? `${book.wordCount.toLocaleString()} words` : '—'
  const yearStr = book.year ?? '—'

  return (
    <div className="flex h-full" style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', 'Georgia', serif" }}>
      {/* Left page */}
      <div
        className="flex w-1/2 flex-col overflow-y-auto p-6 pr-4"
        style={{ borderRight: '1px solid rgba(0,0,0,0.06)' }}
      >
        <div className="mb-3">
          <h1 className="text-2xl font-semibold leading-tight tracking-wide" style={{ color: '#1a1a2e' }}>
            {book.title}
          </h1>
          <p
            className="mt-1 text-xs tracking-[0.15em] uppercase opacity-50"
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}
          >
            Brandon Sanderson
          </p>
        </div>

        <div className="mt-4 space-y-3 text-xs leading-relaxed" style={{ color: '#2a2a3e' }}>
          <div>
            <span className="text-[10px] uppercase tracking-[0.12em] opacity-40 block">Saga</span>
            <span className="text-sm">{getSagaLabel(book.saga)}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.12em] opacity-40 block">Published</span>
            <span className="text-sm">{yearStr}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.12em] opacity-40 block">Length</span>
            <span className="text-sm">{wordCountStr}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.12em] opacity-40 block">Cosmere</span>
            <span className="text-sm">Cosmere novel</span>
          </div>
        </div>

        <div
          className="mt-auto pt-6 text-[10px] opacity-30 text-center"
          style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}
        >
          — {getSagaLabel(book.saga)} —
        </div>
      </div>

      {/* Right page */}
      <div className="flex w-1/2 flex-col overflow-y-auto p-6 pl-4">
        <h2 className="text-base font-semibold tracking-wide mb-3" style={{ color: '#1a1a2e' }}>
          Synopsis
        </h2>

        <div className="text-xs leading-relaxed space-y-2" style={{ color: '#2a2a3e' }}>
          {book.description && (
            <p>
              <span
                className="float-left mr-1 mt-0 leading-none"
                style={{
                  fontSize: '2.8em',
                  fontFamily: "'Playfair Display', serif",
                  color: '#1a1a2e',
                  lineHeight: 0.85,
                }}
              >
                {book.description.charAt(0)}
              </span>
              {book.description.slice(1)}
            </p>
          )}
        </div>

        <div className="mt-auto pt-4 text-[9px] uppercase tracking-[0.15em] opacity-25 text-center">
          — Fine edition —
        </div>
      </div>
    </div>
  )
}
