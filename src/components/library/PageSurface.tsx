/**
 * PageSurface — the paper, and the type on it.
 *
 * M3 · block 4. This is the half of the reader that does not move. It renders
 * one `PageData` onto a cream page using the `--surface-page` / `--text-on-page-*`
 * token set from M1, which is the one token group in the project designed to
 * clear AA *on paper* (14.87:1 for ink, 5.96:1 for the folio).
 *
 * It is deliberately plain HTML. The old reader put this text inside a
 * `<Html transform>` overlay on a Three.js plane, which meant the text was
 * rasterised at whatever angle the camera happened to be at, could not be
 * selected reliably, and shipped a 243 KB WebGL runtime to typeset a paragraph.
 */

import type { PageContent, PageData } from './BookContent'
import { spineMaterial } from '@/navigation'

interface Props {
  page: PageData
  /** Printed at the foot of the page. */
  folio: number
  /** Running head at the top of the page. */
  runningHead: string
  /** Series id, for the seal colour. */
  series: string
  /** Flipped side, which changes where the gutter shadow falls. */
  side: 'left' | 'right'
}

function Content({ item, series }: { item: PageContent; series: string }) {
  const accent = spineMaterial(series).foil

  switch (item.type) {
    case 'hero':
      return (
        <h2
          className="text-[clamp(1.6rem,3.2vw,2.4rem)] leading-[1.06] font-[var(--font-display)] text-[var(--text-on-page-primary)]"
          style={{ textWrap: 'balance' }}
        >
          {item.value}
        </h2>
      )

    case 'subtitle':
      return (
        <p className="text-[var(--text-on-page-secondary)] text-[var(--text-meta)] uppercase tracking-[0.14em]">
          {item.value}
        </p>
      )

    case 'heading':
      return (
        <>
          <h3 className="text-[var(--text-h4)] font-[var(--font-display)] text-[var(--text-on-page-primary)]">
            {item.value}
          </h3>
          <div
            aria-hidden
            className="mb-[0.7em] h-px w-full"
            style={{ background: 'var(--border-interactive-on-page)' }}
          />
        </>
      )

    case 'small-heading':
      return (
        <h4 className="mt-[1em] mb-[0.4em] text-[var(--text-micro)] font-semibold uppercase tracking-[0.16em] text-[var(--text-on-page-secondary)]">
          {item.value}
        </h4>
      )

    case 'text':
      return (
        <p className="text-[clamp(0.95rem,1.05vw,1.1rem)] leading-[1.62] text-[var(--text-on-page-primary)]">
          {item.value}
        </p>
      )

    case 'dropcap-text': {
      // The drop cap is a float, so the lines beside it stay indented until they
      // clear its height. An earlier version rendered the letter separately and
      // the second line ran underneath it.
      const text = item.value ?? ''
      const [first, ...rest] = [...text]
      return (
        <p className="text-[clamp(0.95rem,1.05vw,1.1rem)] leading-[1.62] text-[var(--text-on-page-primary)]">
          <span
            className="float-left mt-[0.04em] mr-[0.11em] font-[var(--font-display)] leading-[0.8] text-[3.1em] text-[var(--text-on-page-accent)]"
            aria-hidden
          >
            {first}
          </span>
          {rest.join('')}
        </p>
      )
    }

    case 'list':
      return (
        <ul className="list-disc pl-[1.4em] text-[var(--text-on-page-primary)]">
          {(item.items ?? []).map((li, i) => (
            <li key={i}>{li}</li>
          ))}
        </ul>
      )

    case 'entry':
      return (
        <dl className="space-y-[0.55em]">
          {(item.entries ?? []).map((e, i) => (
            <div key={i} className="grid grid-cols-[minmax(0,1fr)_minmax(0,2.1fr)] gap-x-[1em]">
              <dt className="text-[var(--text-meta)] font-semibold text-[var(--text-on-page-secondary)]">{e.label}</dt>
              <dd className="text-[var(--text-on-page-primary)]">{e.value}</dd>
            </div>
          ))}
        </dl>
      )

    case 'grid':
      return (
        <dl className="space-y-[0.7em]">
          {(item.entries ?? []).map((e, i) => (
            <div key={i}>
              <dt className="text-[var(--text-body-s)] font-semibold text-[var(--text-on-page-accent)]">{e.label}</dt>
              <dd className="text-[var(--text-on-page-secondary)]">{e.value}</dd>
            </div>
          ))}
        </dl>
      )

    case 'separator':
    case 'divider':
      return (
        <div aria-hidden className="my-[1.1em] flex items-center gap-[0.7em]">
          <span className="h-px flex-1" style={{ background: 'var(--border-interactive-on-page)' }} />
          <span className="inline-block size-[4px] rounded-full" style={{ background: accent }} />
          <span className="h-px flex-1" style={{ background: 'var(--border-interactive-on-page)' }} />
        </div>
      )

    case 'archive-header':
      return (
        <p className="text-[var(--text-micro)] uppercase tracking-[0.2em] text-[var(--text-on-page-tertiary)]">
          {item.value}
        </p>
      )

    default:
      return null
  }
}

export default function PageSurface({ page, folio, runningHead, series, side }: Props) {
  return (
    <article
      data-page-surface
      data-side={side}
      aria-label={`Page ${folio}: ${page.title}`}
      className="relative flex h-full min-h-0 flex-col overflow-hidden"
      style={{
        background: 'var(--surface-page)',
        color: 'var(--text-on-page-primary)',
        // The gutter: a soft shadow on whichever side the spine is.
        boxShadow:
          side === 'left'
            ? 'inset -14px 0 22px -14px rgb(80 60 40 / .38)'
            : 'inset 14px 0 22px -14px rgb(80 60 40 / .38)',
      }}
    >
      {/* running head */}
      <header className="flex shrink-0 items-baseline justify-between gap-4 px-[clamp(1.1rem,3%,2.2rem)] pt-[clamp(1rem,2.4%,1.6rem)] pb-[0.5rem]">
        <span className="truncate text-[var(--text-micro)] uppercase tracking-[0.16em] text-[var(--text-on-page-tertiary)]">
          {runningHead}
        </span>
        <span className="text-[var(--text-micro)] uppercase tracking-[0.16em] text-[var(--text-on-page-tertiary)]">
          {page.title}
        </span>
      </header>

      <div
        className="mx-auto w-full min-h-0 flex-1 overflow-y-auto px-[clamp(1.1rem,3%,2.2rem)] pb-[1.2rem] space-y-[0.55em]"
        style={{ scrollbarWidth: 'thin' }}
      >
        {page.content.map((item, i) => (
          <Content key={i} item={item} series={series} />
        ))}
      </div>

      {/* folio */}
      <footer className="shrink-0 px-[clamp(1.1rem,3%,2.2rem)] pb-[clamp(0.7rem,1.6%,1.1rem)] pt-[0.3rem] text-center text-[var(--text-micro)] text-[var(--text-on-page-tertiary)] tabular-nums">
        {folio}
      </footer>

      {/* paper edge: the last 2px on the fore-edge, so the page has a thickness */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-[3px]"
        style={{
          [side === 'left' ? 'right' : 'left']: 0,
          background:
            side === 'left'
              ? 'linear-gradient(90deg, transparent, rgb(90 70 48 / .30))'
              : 'linear-gradient(270deg, transparent, rgb(90 70 48 / .30))',
        }}
      />
    </article>
  )
}
