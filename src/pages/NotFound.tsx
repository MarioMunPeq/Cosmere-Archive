import { useSEOMeta } from '@/hooks/useSEOMeta'
import DestroyedManuscript from '@/components/error/DestroyedManuscript'
import { Link } from 'react-router-dom'
import { CORE_DESTINATIONS, HISTORICAL_DESTINATIONS } from '@/navigation'

export default function NotFound() {
  useSEOMeta({
    title: 'Record not found — Cosmere Archive',
    description: 'That page is not part of the archive.',
  })

  return (
    <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-6 bg-[var(--surface-void)] p-8">
      <h1 className="sr-only">Record not found</h1>
      <div className="h-[280px] w-full max-w-[480px]">
        <DestroyedManuscript inscription="Record not found" seed={7} />
      </div>
      <p className="max-w-[40ch] text-center font-[var(--font-display)] text-[14px] italic text-[var(--text-secondary)]">
        No entry under that designation. It may have been filed elsewhere, or never recorded.
      </p>
      <Link
        to="/"
        className="border border-[#5a3e1e] bg-[#2a180c] px-4 py-2 font-[var(--font-display)] text-[12px] text-[#d8b878] transition-colors hover:text-[#f0d0a0]"
      >
        Back to the archive
      </Link>
      <div className="flex flex-wrap justify-center gap-2">
        {CORE_DESTINATIONS.map((dest) => (
          <Link
            key={dest.id}
            to={dest.to}
            className="border border-[#5a3e1e] bg-[#2a180c] px-3 py-1.5 font-[var(--font-display)] text-[12px] text-[#d8b878] transition-colors hover:text-[#f0d0a0]"
          >
            {dest.label}
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {HISTORICAL_DESTINATIONS.map((dest) => (
          <Link
            key={dest.id}
            to={dest.to}
            className="border border-[#5a3e1e] bg-[#2a180c] px-3 py-1.5 font-[var(--font-display)] text-[12px] text-[#d8b878] transition-colors hover:text-[#f0d0a0]"
          >
            {dest.label}
          </Link>
        ))}
      </div>
      <p className="max-w-[40ch] text-center font-[var(--font-mono)] text-[10px] text-[#8a6840]">
        Search reaches every record. Press <kbd className="border border-[#5a3e1e] px-1.5 py-0.5">Ctrl</kbd> +{' '}
        <kbd className="border border-[#5a3e1e] px-1.5 py-0.5">K</kbd> to search.
      </p>
    </div>
  )
}
