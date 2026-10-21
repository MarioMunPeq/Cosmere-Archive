import ChronologyPage from './ChronologyPage'

export default function StandaloneChronologyPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--surface-void)]">
      <div className="relative flex shrink-0 flex-col items-center gap-2 px-5 pt-5 pb-3">
        <div
          className="relative px-6 py-2"
          style={{
            background: 'linear-gradient(180deg, #3a2a14 0%, #24180a 100%)',
            border: '1px solid #5a3e1e',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(190,150,100,0.12)',
          }}
        >
          <h1 className="font-[var(--font-display)] text-[var(--text-h3)] tracking-[0.04em] text-[#d8b878]">
            Cosmere Chronology
          </h1>
        </div>
        <span className="max-w-2xl text-center font-[var(--font-display)] text-[13px] italic text-[#8a6840]">
          A chronological record of known historical events, compiled by an anonymous archivist of Silverlight.
        </span>
        <a
          href="#/"
          className="font-[var(--font-display)] text-[12px] text-[#d8b878] transition-colors hover:text-[#f0d0a0]"
        >
          Archive
        </a>
      </div>
      <div className="mt-2 flex min-h-0 flex-1 flex-col">
        <ChronologyPage />
      </div>
    </div>
  )
}
