/**
 * ThumbTabs — the fore-edge index of the codex.
 *
 * The tabs are deliberately small, paper-coloured slips cut into the page
 * margin, not floating buttons. They sit outside the text column, persist
 * between spreads, and expose the same destinations as the contents page:
 * chapter numerals for Part I, letter ranges for Part II.
 */

export interface ThumbTab {
  id: string
  /** Visible slip: `I`, `II`, `A–C`, … */
  label: string
  /** Must begin with the visible label; adds the destination for AT. */
  ariaLabel: string
  active?: boolean
  onSelect: () => void
}

interface Props {
  tabs: readonly ThumbTab[]
  label: string
}

export default function ThumbTabs({ tabs, label }: Props) {
  if (tabs.length === 0) return null

  return (
    <nav className="codex-thumbs" aria-label={label}>
      <ul className="codex-thumbs__list">
        {tabs.map((tab) => (
          <li key={tab.id}>
            <button
              type="button"
              className="codex-thumb"
              data-thumb={tab.id}
              aria-label={tab.ariaLabel}
              aria-current={tab.active ? 'page' : undefined}
              onClick={tab.onSelect}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
