import type { ReactNode } from 'react'

/**
 * ContentsPage — the printed table of contents shared by both parts.
 *
 * Part I is a list of world chapters. Part II is the alphabet of records,
 * grouped into the same eight ranges as the fore-edge tabs so the contents and
 * the thumb index never disagree about where a letter lives. All of it is
 * supplied by the page; this component owns only the typography.
 */

const TEXT_BUTTON = 'cursor-pointer border-0 bg-transparent p-0 text-left'

export interface ContentsEntry {
  id: string
  label: string
  numeral?: string
  meta?: string
  onOpen: () => void
}

export interface ContentsRange {
  id: string
  /** The printed range, e.g. `A–C`. */
  label: string
  count: number
  /** First record in the range, used to make the tab's destination legible. */
  firstRecordName?: string
  entries: ContentsEntry[]
  /** Open the first record of the range. */
  onOpen: () => void
}

export interface ContentsPart {
  id: string
  /** `Part I`, `Part II`. */
  kicker: string
  title: string
  description?: string
  total?: number
  totalLabel?: string
  /** Part I: one entry per world chapter. */
  entries?: ContentsEntry[]
  /** Part II: the eight alphabet ranges, each with every record. */
  ranges?: ContentsRange[]
  indexLabel?: string
  onOpenIndex?: () => void
}

export interface ContentsCompanion {
  kicker: string
  title: string
  count: number
  countLabel?: string
  onOpen: () => void
}

interface Props {
  part: ContentsPart
  /** The other part, shown as a single cross-reference at the foot. */
  companion?: ContentsCompanion
  /** A page-specific slot between the part heading and its entries. */
  children?: ReactNode
}

function PartHeader({ part }: { part: ContentsPart }) {
  return (
    <header className="mb-5">
      <p
        className="text-[11px] uppercase tracking-[0.16em] [font-family:var(--font-ui)]"
        style={{ color: 'var(--text-on-page-tertiary)' }}
      >
        {part.kicker}
      </p>
      <h3
        className="mt-1 text-[clamp(18px,1.7vw,24px)] font-bold leading-tight tracking-[0.04em] [font-family:var(--font-display)]"
        style={{ color: 'var(--text-on-page-primary)' }}
      >
        {part.title}
      </h3>
      {part.description && (
        <p
          className="mt-2 max-w-[42ch] text-[12px] italic leading-relaxed [font-family:var(--font-display)]"
          style={{ color: 'var(--text-on-page-secondary)' }}
        >
          {part.description}
        </p>
      )}
      {part.total !== undefined && (
        <p
          className="mt-2 text-[11px] uppercase tracking-[0.1em] [font-family:var(--font-ui)]"
          style={{ color: 'var(--text-on-page-tertiary)' }}
        >
          {part.total}
          {part.totalLabel ? ` ${part.totalLabel}` : ''}
        </p>
      )}
    </header>
  )
}

function WorldEntries({ part }: { part: ContentsPart }) {
  if (!part.entries?.length) return null

  return (
    <nav aria-label={`${part.title} chapters`}>
      <ul className="space-y-[3px]">
        {part.entries.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              onClick={entry.onOpen}
              data-contents-kind="world"
              className={`${TEXT_BUTTON} group flex w-full flex-wrap items-baseline gap-x-2 gap-y-0.5`}
            >
              {entry.numeral && (
                <span
                  className="min-w-[22px] text-right text-[11px] [font-family:var(--font-display)]"
                  style={{ color: 'var(--text-on-page-tertiary)' }}
                >
                  {entry.numeral}.
                </span>
              )}
              <span
                className="min-w-0 text-[15px] tracking-[0.02em] transition-colors duration-150 group-hover:text-[color:var(--text-on-page-link)] [font-family:var(--font-display)]"
                style={{ color: 'var(--text-on-page-primary)' }}
              >
                {entry.label}
              </span>
              <span
                aria-hidden="true"
                className="hidden min-w-[12px] flex-1 sm:block"
                style={{ borderBottom: '1px dotted rgba(107,87,68,0.45)' }}
              />
              {entry.meta && (
                <span
                  className="w-full pl-[30px] text-left text-[11px] [font-family:var(--font-ui)] sm:w-auto sm:pl-0 sm:text-right"
                  style={{ color: 'var(--text-on-page-secondary)' }}
                >
                  {entry.meta}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function RecordEntries({ part }: { part: ContentsPart }) {
  if (!part.ranges?.length) return null

  return (
    <nav aria-label={`${part.title} index`}>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 max-sm:grid-cols-1">
        {part.ranges.map((range) => (
          <section key={range.id} aria-label={`${range.label} records`}>
            <button
              type="button"
              onClick={range.onOpen}
              data-contents-kind="range"
              aria-label={
                range.firstRecordName
                  ? `${range.label}: ${range.count} records, starting with ${range.firstRecordName}`
                  : `${range.label}: ${range.count} records`
              }
              className={`${TEXT_BUTTON} group flex w-full items-baseline justify-between gap-2 border-b pb-1`}
              style={{ borderColor: 'rgba(80,60,40,0.18)' }}
            >
              <span
                className="text-[12px] font-bold tracking-[0.04em] transition-colors duration-150 group-hover:text-[color:var(--text-on-page-link)] [font-family:var(--font-display)]"
                style={{ color: 'var(--text-on-page-secondary)' }}
              >
                {range.label}
              </span>
              <span
                className="text-[11px] [font-family:var(--font-ui)]"
                style={{ color: 'var(--text-on-page-tertiary)' }}
              >
                {range.count}
              </span>
            </button>
            <ul className="mt-1.5 space-y-0">
              {range.entries.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={entry.onOpen}
                    data-contents-kind="record"
                    className={`${TEXT_BUTTON} block w-full text-[11px] leading-[1.5] underline-offset-2 transition-colors duration-150 hover:text-[color:var(--text-on-page-link)] hover:underline [font-family:var(--font-display)]`}
                    style={{ color: 'var(--text-on-page-secondary)' }}
                  >
                    {entry.label}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </nav>
  )
}

function IndexLink({ part }: { part: ContentsPart }) {
  if (!part.onOpenIndex) return null

  return (
    <div className="mt-7">
      <button
        type="button"
        onClick={part.onOpenIndex}
        className={`${TEXT_BUTTON} group text-[11px] uppercase tracking-[0.1em] [font-family:var(--font-ui)]`}
        style={{ color: 'var(--text-on-page-tertiary)' }}
      >
        <span className="transition-colors duration-150 group-hover:text-[color:var(--text-on-page-link)]">
          {part.indexLabel ?? 'Index →'}
        </span>
      </button>
    </div>
  )
}

function Companion({ companion }: { companion?: ContentsCompanion }) {
  if (!companion) return null

  const countLabel = companion.countLabel ?? 'records'

  return (
    <div className="mt-6 border-t pt-3" style={{ borderColor: 'rgba(80,60,40,0.16)' }}>
      <p
        className="text-[11px] uppercase tracking-[0.14em] [font-family:var(--font-ui)]"
        style={{ color: 'var(--text-on-page-tertiary)' }}
      >
        {companion.kicker}
      </p>
      <p
        className="mt-0.5 text-[13px] [font-family:var(--font-display)]"
        style={{ color: 'var(--text-on-page-secondary)' }}
      >
        {companion.title}
      </p>
      <button
        type="button"
        onClick={companion.onOpen}
        className={`${TEXT_BUTTON} group mt-1 text-[11px] [font-family:var(--font-ui)]`}
        style={{ color: 'var(--text-on-page-link)' }}
      >
        <span className="underline underline-offset-2 transition-colors duration-150 group-hover:text-[color:var(--text-on-page-primary)]">
          {companion.count} {countLabel} — open {companion.kicker} →
        </span>
      </button>
    </div>
  )
}

export default function ContentsPage({ part, companion, children }: Props): ReactNode {
  return (
    <div>
      <h2
        className="mb-5 text-[12px] uppercase tracking-[0.15em] [font-family:var(--font-ui)]"
        style={{ color: 'var(--text-on-page-tertiary)' }}
      >
        Contents
      </h2>

      <PartHeader part={part} />
      {children}
      <WorldEntries part={part} />
      <RecordEntries part={part} />
      <IndexLink part={part} />
      <Companion companion={companion} />
    </div>
  )
}
