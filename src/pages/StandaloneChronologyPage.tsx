import ChronologyPage from './ChronologyPage'
import CodexObject from '@/components/codex/CodexObject'

export default function StandaloneChronologyPage() {
  return (
    <CodexObject>
      <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden">
        <div className="relative z-[2] flex shrink-0 flex-col items-center gap-2 px-6 pt-6 pb-4">
          <div
            className="relative px-8 py-2"
            style={{
              background: 'linear-gradient(180deg, #3a2a14 0%, #24180a 100%)',
              border: '1px solid #5a3e1e',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(190,150,100,0.12)',
            }}
          >
            <h1 className="whitespace-nowrap font-[var(--font-display)] text-[clamp(24px,4vw,40px)] tracking-[0.12em] uppercase text-[#d8b878]">
              Chronicon Cosmerae
            </h1>
          </div>
          <span className="w-full max-w-[1100px] whitespace-normal break-words px-4 text-center font-[var(--font-display)] text-[13px] italic text-[#c9b08a]">
            A chronological record of known events, transcribed from the archives of Silverlight.
          </span>
          <a
            href="#/"
            className="font-[var(--font-display)] text-[12px] tracking-[0.12em] uppercase text-[#d8b878] transition-colors hover:text-[#f0d0a0]"
          >
            Archive
          </a>
        </div>
        <div className="relative z-[2] mt-2 flex min-h-0 flex-1 flex-col overflow-hidden">
          <ChronologyPage />
        </div>
      </div>
    </CodexObject>
  )
}
