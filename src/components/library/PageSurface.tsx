/**
 * PageSurface — the paper, and the type on it.
 *
 * M3 · block 4. One `PageData` onto a cream page using the `--surface-page` /
 * `--text-on-page-*` token set from M1, the one group in the project designed
 * to clear AA *on paper* (14.87:1 for ink, 5.96:1 for the folio).
 *
 * It is deliberately plain HTML. The old reader put this text inside a
 * `<Html transform>` overlay on a Three.js plane, which meant the browser
 * rasterised it at whatever angle the camera was at, blurred it, and made
 * selection unreliable — a 243 KB WebGL runtime to typeset a paragraph.
 *
 * ## Why the body is set in a serif
 *
 * The first version inherited the UI sans. It read as a website: a column of
 * Inter at 17px on a cream rectangle, which is what makes an "open book"
 * mockup look like a vibecode screenshot. A page of a book is set in a text
 * face. `--font-display` is EB Garamond here, and it costs nothing extra: it
 * is already loaded for the whole site.
 *
 * The measure is held to roughly 62–70 characters at every width, which is the
 * range where a serif at this size is comfortable to read for a paragraph.
 */

import type { PageContent, PageData } from './BookContent'
import { spineMaterial } from '@/navigation'

interface Props {
  page: PageData
  /** Printed at the foot of the page. */
  folio: number
  /** Running head at the top of the page. */
  runningHead: string
  /** Series id, for the foil colour. */
  series: string
  /** Flipped side, which changes where the gutter shadow falls. */
  side: 'left' | 'right'
}

/** Rough characters-per-line guard. Not a text engine, just a ceiling. */
const MAX_CHARS_PER_LINE = 78

function Content({ item, series }: { item: PageContent; series: string }) {
  const foil = spineMaterial(series).foil

  switch (item.type) {
    case 'hero':
      return (
        <h2 className="pg-hero" style={{ textWrap: 'balance' }}>
          {item.value}
        </h2>
      )

    case 'subtitle':
      return <p className="pg-subtitle">{item.value}</p>

    case 'heading':
      return (
        <>
          <h3 className="pg-h">{item.value}</h3>
          {/* A printer's rule: a full hairline that thins out, the way a
              compositor would set a section break. */}
          <div aria-hidden className="pg-rule" />
        </>
      )

    case 'small-heading':
      return <h4 className="pg-sh">{item.value}</h4>

    case 'text':
      return <p className="pg-body">{item.value}</p>

    case 'dropcap-text': {
      // The cap floats, so the lines beside it stay indented until they clear
      // its height. Rendering the letter separately and letting the second line
      // run underneath it is the classic bug; a float cannot do that.
      const text = item.value ?? ''
      const [first, ...rest] = [...text]
      return (
        <p className="pg-body pg-dropcap">
          <span className="pg-cap" aria-hidden>
            {first}
          </span>
          {rest.join('')}
        </p>
      )
    }

    case 'list':
      return (
        <ul className="pg-list">
          {(item.items ?? []).map((li, i) => (
            <li key={i}>{li}</li>
          ))}
        </ul>
      )

    case 'entry':
      return (
        <dl className="pg-entries">
          {(item.entries ?? []).map((e, i) => (
            <div key={i} className="pg-entry">
              <dt>{e.label}</dt>
              <dd>{e.value}</dd>
            </div>
          ))}
        </dl>
      )

    case 'grid':
      return (
        <dl className="pg-grid">
          {(item.entries ?? []).map((e, i) => (
            <div key={i}>
              <dt>{e.label}</dt>
              <dd>{e.value}</dd>
            </div>
          ))}
        </dl>
      )

    case 'separator':
    case 'divider':
      return (
        <div aria-hidden className="pg-ornament">
          <span className="pg-ornament__line" />
          <span className="pg-ornament__mark" style={{ color: foil }} />
          <span className="pg-ornament__line" />
        </div>
      )

    case 'archive-header':
      return <p className="pg-archive-head">{item.value}</p>

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
      className="pg"
      style={{
        background:
          // Paper is never one colour: a warm centre, cooler at the edges,
          // and the gutter shadow on the bound side.
          side === 'left'
            ? 'radial-gradient(130% 100% at 20% 0%, #f7f2e8 0%, #f2ece0 55%, #e9e1d2 100%), var(--surface-page)'
            : 'radial-gradient(130% 100% at 80% 0%, #f7f2e8 0%, #f2ece0 55%, #e9e1d2 100%), var(--surface-page)',
      }}
    >
      {/* the gutter shadow */}
      <span
        aria-hidden
        className="pg-gutter"
        style={
          side === 'left'
            ? { right: 0, backgroundImage: 'linear-gradient(270deg, rgb(84 62 38 / .3), transparent 9%)' }
            : { left: 0, backgroundImage: 'linear-gradient(90deg, rgb(84 62 38 / .3), transparent 9%)' }
        }
      />

      {/* running head */}
      <header className="pg-running">
        <span className="pg-running__book">{runningHead}</span>
        <span className="pg-running__here">{page.title}</span>
      </header>

      <div className="pg-body-scroll" style={{ ['--measure' as string]: `${MAX_CHARS_PER_LINE}ch` }}>
        {page.content.map((item, i) => (
          <Content key={i} item={item} series={series} />
        ))}
      </div>

      {/* folio */}
      <footer className="pg-folio">{folio}</footer>

      {/* the fore-edge: the last two millimetres, so the leaf has a thickness */}
      <span
        aria-hidden
        className="pg-edge"
        style={
          side === 'left'
            ? { right: 0, backgroundImage: 'linear-gradient(270deg, transparent, rgb(104 84 56 / .22))' }
            : { left: 0, backgroundImage: 'linear-gradient(90deg, transparent, rgb(104 84 56 / .22))' }
        }
      />
    </article>
  )
}
