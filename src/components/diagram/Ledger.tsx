/**
 * A ledger, not a chart widget.
 *
 * Hand-ruled columns, labels in Garamond, numbers in mono, and bars drawn as
 * single ink strokes that put themselves down (`stroke-dashoffset`, 70 ms
 * apart). There is no axis, no legend, no tooltip and no card: a page of ruled
 * paper a man filled in at night.
 *
 * The compact form is the sheet on the wall; the full form is the sheet in the
 * reader. Same rows, same ink, same rules.
 */
import type { LedgerRow } from './tally-data'

interface Props {
  rows: LedgerRow[]
  unit: string
  total: number
  totalLabel: string
  /** Wall-sized: fewer pixels, same columns. */
  compact?: boolean
  /** One line under the table, in the hand. */
  note?: string
}

const INK = 'var(--text-on-page-primary)'
const SOFT = 'var(--text-on-page-secondary)'
const RULE = 'rgb(36 26 18 / 0.28)'
const RED = 'var(--text-on-page-accent)'

export function Ledger({ rows, unit, total, totalLabel, compact = false, note }: Props) {
  const max = Math.max(1, ...rows.map((row) => row.value))
  const fontSize = compact ? 13 : 16
  const numSize = compact ? 12 : 13
  const padY = compact ? 2 : 4

  return (
    <div className={compact ? 'mt-3' : 'mt-5'}>
      <table
        data-diagram-ledger
        className="w-full border-collapse"
        style={{ fontFamily: 'var(--font-display)', color: INK }}
      >
        <caption className="sr-only">
          {totalLabel}: {total} {unit}, across {rows.length} rows
        </caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="text-left font-normal"
              style={{ fontSize: compact ? 12 : 13, color: SOFT, paddingBottom: 4, letterSpacing: '0.06em' }}
            >
              series
            </th>
            <th
              scope="col"
              className="text-right font-normal"
              style={{ fontSize: compact ? 12 : 13, color: SOFT, paddingBottom: 4, letterSpacing: '0.06em' }}
            >
              {unit}
            </th>
            <th scope="col" style={{ width: compact ? 56 : 104 }}>
              <span className="sr-only">Share, drawn in ink</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            // A zero is a zero. A stub of ink would say the row had something.
            const width = row.value === 0 ? 0 : Math.max(2, (row.value / max) * 100)
            return (
              <tr key={row.label} style={{ borderTop: `1px solid ${RULE}` }}>
                <th
                  scope="row"
                  className="text-left font-normal"
                  style={{ fontSize, padding: `${padY}px 8px ${padY}px 0`, color: INK }}
                >
                  {row.label}
                </th>
                <td
                  className="text-right"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: numSize,
                    padding: `${padY}px 8px`,
                    borderLeft: `1px solid ${RULE}`,
                    fontVariantNumeric: 'tabular-nums',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {row.display}
                </td>
                <td aria-hidden style={{ padding: `${padY}px 0 ${padY}px 8px` }}>
                  <svg
                    width="100%"
                    height={compact ? 6 : 8}
                    viewBox="0 0 100 8"
                    preserveAspectRatio="none"
                    style={{ display: 'block', overflow: 'visible' }}
                  >
                    <line
                      x1="0"
                      y1="4"
                      x2="100"
                      y2="4"
                      stroke={RULE}
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                    />
                    <path
                      className="diagram-bar"
                      d={`M 0 4 H ${width}`}
                      fill="none"
                      stroke={INK}
                      strokeWidth={compact ? 2.2 : 2.8}
                      strokeLinecap="round"
                      pathLength={1}
                      vectorEffect="non-scaling-stroke"
                      style={{ animationDelay: `${i * 70}ms` }}
                    />
                  </svg>
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: `2px solid ${INK}` }}>
            <th
              scope="row"
              className="text-left italic font-normal"
              style={{ fontSize, padding: `${padY + 2}px 8px 0 0` }}
            >
              Counted
            </th>
            <td
              className="text-right italic"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: numSize,
                padding: `${padY + 2}px 8px 0`,
                borderLeft: `1px solid ${RULE}`,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {total.toLocaleString('es-ES')}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>

      {note ? (
        <p
          className="-rotate-[0.8deg]"
          style={{
            fontFamily: 'var(--font-hand)',
            fontSize: compact ? 16 : 19,
            lineHeight: 1.25,
            color: RED,
            marginTop: compact ? 8 : 14,
          }}
        >
          {note}
        </p>
      ) : null}
    </div>
  )
}
