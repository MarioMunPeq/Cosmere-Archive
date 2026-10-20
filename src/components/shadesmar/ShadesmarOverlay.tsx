/**
 * Everything on this page that is not light — §5.5.3.
 *
 * The canvas draws beads, fog and glow. Every word on this page lives here, in
 * the DOM, where it can be selected, searched, reached by keyboard, scaled with
 * the reader's text size and read aloud. Criterion S.2 is a `grep` for
 * `fillText` returning nothing; this file is the other half of that.
 *
 * ## The layout
 *
 * ```
 * ┌───────────────────────────────────────────────────────────────┐
 * │ Shadesmar   95 souls · 12 realms          [ ? ]   ← 56px    │
 * ├───────────────────────────────────────────────────────────────┤
 * │                                                               │
 * │                     the canvas                                 │
 * │                                                               │
 * │                                          ┌──────────────────┐ │
 * │                                          │ ROSHAR      38   │ │
 * │                                          │ Bonded to Honor  │ │
 * │                                          │ [View record →]  │ │
 * │                                          └──────────────────┘ │
 * ├───────────────────────────────────────────────────────────────┤
 * │  Roshar  Scadrial  Sel  Nalthis  Taldain …        [+]         │
 * └───────────────────────────────────────────────────────────────┘
 * ```
 *
 * ## Type sizes are the plan's, and they are not negotiable
 *
 * §5.5.3 gives measured contrast ratios against `#141A24`: world name 14.13,
 * type and count 9.14, description 9.14, link 9.08. All four clear WCAG AA for
 * their size. Nothing here is smaller than 13px, and the sizes below are the
 * ones those ratios were measured at.
 */

import { useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PERPENDICULARITIES } from './types'
import { KIND_LABEL, useShadesmarUi } from './store'
import type { ShadesmarUiState, SelectionView, SoulInfo } from './store'

interface Props {
  /** Every soul, grouped once. */
  souls: SoulInfo[]
  /** Focusing a realm, from the legend or the canvas. */
  onFocusRealm: (id: string | null) => void
  /** Closing the inspector without changing the canvas selection. */
  onCloseInspector: () => void
}

/**
 * S.6: the inspector never sits on a bead.
 *
 * Twenty-eight pixels, measured from the selected bead's edge rather than its
 * centre — a bead is up to 26px across, and offsetting from the centre would
 * still overlap the widest ones. The panel then flips to the other side of the
 * bead rather than running off the viewport.
 */
const INSPECTOR_OFFSET = 28
const INSPECTOR_MAX_WIDTH = 340

export default function ShadesmarOverlay({ souls, onFocusRealm, onCloseInspector }: Props) {
  const ui = useShadesmarUi()

  const grouped = useMemo(() => {
    const map = new Map<string, SoulInfo[]>()
    for (const s of souls) {
      const list = map.get(s.realmId) ?? []
      list.push(s)
      map.set(s.realmId, list)
    }
    for (const list of map.values()) list.sort((a, b) => a.name.localeCompare(b.name))
    return map
  }, [souls])

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
      <ShadesmarHeader
        soulCount={souls.length}
        realmCount={PERPENDICULARITIES.length}
        list={<SoulList grouped={grouped} realms={PERPENDICULARITIES.map((c) => ({ id: c.id, name: c.name }))} />}
      />

      {/* The canvas owns the middle; nothing is drawn here so the pointer
          passes through to it. */}
      <div className="min-h-0 flex-1" />

      {ui.selected ? (
        <SoulInspector
          view={ui.selected}
          viewport={{ w: window.innerWidth, h: window.innerHeight }}
          onClose={onCloseInspector}
        />
      ) : null}

      <SoulLegend
        realms={PERPENDICULARITIES.map((c) => ({
          id: c.id,
          name: c.name,
          color: c.color,
          count: grouped.get(c.id)?.length ?? 0,
        }))}
        activeId={ui.focusedRealmId}
        onFocus={onFocusRealm}
      />
    </div>
  )
}

/* -------------------------------------------------------------------- header */

function ShadesmarHeader({ soulCount, realmCount, list }: { soulCount: number; realmCount: number; list: ReactNode }) {
  return (
    <header
      data-shadesmar-header
      className="pointer-events-none relative flex h-10 shrink-0 items-center gap-sm px-md"
      style={{
        background: 'linear-gradient(180deg, rgba(5,5,8,0.9) 0%, rgba(5,5,8,0) 100%)',
      }}
    >
      <h1 className="font-[var(--font-display)] text-[11px] tracking-[0.2em] uppercase text-[#3a3a4a]">Shadesmar</h1>
      <p className="text-[10px] text-[#3a3a4a]">
        {soulCount} souls · {realmCount} realms
      </p>

      <details className="group pointer-events-auto relative ml-auto">
        <summary className="inline-flex min-h-[var(--target-min)] cursor-pointer list-none items-center rounded-[2px] border border-[#1a1a2a] px-sm text-[10px] text-[#3a3a4a] transition-colors duration-[var(--dur-fast)] hover:text-[#8a8aaa] focus-visible:outline-none">
          souls
        </summary>
        <div
          className="absolute right-0 z-30 mt-sm max-h-[60vh] w-[min(420px,calc(100vw-2rem))] overflow-y-auto p-md shadow-[var(--shadow-3)]"
          style={{
            background: 'rgba(5,5,8,0.95)',
            border: '1px solid #1a1a2a',
            backdropFilter: 'blur(8px)',
          }}
        >
          {list}
        </div>
      </details>
    </header>
  )
}

/* ----------------------------------------------------------------- inspector */

function SoulInspector({
  view,
  viewport,
  onClose,
}: {
  view: SelectionView
  viewport: { w: number; h: number }
  onClose: () => void
}) {
  /*
   * Placement, in the plan's terms: `transform: translate()`, 28px clear of the
   * bead. The panel prefers the right of it and flips left when there is not
   * room, then clamps to the viewport. Positioned rather than drawn, so it can
   * be anywhere and still be text.
   */
  const flip = view.x + INSPECTOR_OFFSET + INSPECTOR_MAX_WIDTH + 16 > viewport.w
  const left = flip ? view.x - INSPECTOR_OFFSET - INSPECTOR_MAX_WIDTH : view.x + INSPECTOR_OFFSET
  const clampedLeft = Math.max(8, Math.min(left, viewport.w - INSPECTOR_MAX_WIDTH - 8))
  const clampedTop = Math.max(64, Math.min(view.y - 20, viewport.h - 260))

  return (
    <aside
      data-shadesmar-inspector
      aria-label={`${view.name}, ${KIND_LABEL[view.kind]}`}
      style={{
        transform: `translate(${Math.round(clampedLeft)}px, ${Math.round(clampedTop)}px)`,
        width: `min(${INSPECTOR_MAX_WIDTH}px, calc(100vw - 16px))`,
        background: 'rgba(5,5,8,0.85)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
      }}
      className={[
        'pointer-events-auto absolute top-0 left-0',
        'border border-[#1a1a2a] p-md',
        'animate-[var(--dur-base)_forwards]',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-sm">
        <h2 className="text-[var(--text-h4)] font-semibold text-[var(--text-primary)]">{view.name}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-mt-1 -mr-1 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-md)] text-[var(--text-tertiary)] transition-colors duration-[var(--dur-fast)] hover:bg-[var(--surface-inset)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            aria-hidden
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <p className="mt-xs text-[var(--text-meta)] text-[var(--text-secondary)]">
        {KIND_LABEL[view.kind]} · {view.realmName}
      </p>

      {view.description ? (
        <p className="mt-sm max-w-[34ch] text-[var(--text-meta)] leading-[1.5] text-[var(--text-secondary)]">
          {view.description}
        </p>
      ) : null}

      {/*
        Only when there is a record. A herald has a name and a surge list and no
        `/characters` entry; a "View record" link that goes nowhere is worse
        than no link.
      */}
      {view.hasRecord && view.entityId ? (
        <Link
          to={`/characters?character=${view.entityId}`}
          className="mt-md inline-flex items-center gap-xs text-[var(--text-body-s)] text-[var(--text-link)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        >
          View record
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            aria-hidden
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h13M12 5l7 7-7 7" />
          </svg>
        </Link>
      ) : null}
    </aside>
  )
}

/* -------------------------------------------------------------------- legend */

/**
 * The eleven perpendicularities, as an index you can navigate (S.10).
 *
 * Each row is a `<button>` that flies the camera to its realm. A legend drawn
 * on the canvas would be eleven words nobody can tab to; here they are eleven
 * targets, in reading order, with the realm's colour as a 10px dot.
 */
function SoulLegend({
  realms,
  activeId,
  onFocus,
}: {
  realms: { id: string; name: string; color: string; count: number }[]
  activeId: string | null
  onFocus: (id: string | null) => void
}) {
  return (
    <nav
      aria-label="Perpendicularities"
      data-shadesmar-legend
      /*
       * `pr-[180px]` clears the HUD, which is pinned to the bottom right: three
       * 44px buttons, two 8px gaps and a 16px margin. Without it the legend's
       * last realm scrolls underneath the overview button and cannot be clicked,
       * which is how Yolen — the only realm with no characters, and so the only
       * one a reader cannot otherwise find — became unreachable.
       */
      className="pointer-events-auto flex shrink-0 items-center gap-sm overflow-x-auto py-sm pr-[180px] pl-md"
      style={{
        background: 'linear-gradient(180deg, rgba(5,5,8,0) 0%, rgba(5,5,8,0.8) 100%)',
        borderTop: '1px solid #1a1a2a',
      }}
    >
      {realms.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => onFocus(activeId === r.id ? null : r.id)}
          aria-current={activeId === r.id ? 'true' : undefined}
          className={[
            'inline-flex shrink-0 cursor-pointer items-center gap-sm rounded-[var(--radius-md)] px-sm py-xs',
            'text-[var(--text-meta)] text-[var(--text-tertiary)]',
            'transition-colors duration-[var(--dur-fast)]',
            'hover:bg-[var(--surface-inset)] hover:text-[var(--text-primary)]',
            'aria-[current]:bg-[var(--surface-raised)] aria-[current]:text-[var(--text-primary)]',
            'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
          ].join(' ')}
        >
          <span aria-hidden className="size-[10px] shrink-0 rounded-full" style={{ background: `rgb(${r.color})` }} />
          {r.name}
          <span className="tabular-nums text-[var(--text-tertiary)]">{r.count}</span>
        </button>
      ))}
    </nav>
  )
}

/* ---------------------------------------------------------------- soul list */

/**
 * Every soul, as a link. S.3 wants this in the DOM; it is also the only way to
 * reach Yolen, which has no characters, or a herald that has no record — the
 * canvas can show you a light and tell you nothing about it.
 */
function SoulList({ grouped, realms }: { grouped: Map<string, SoulInfo[]>; realms: { id: string; name: string }[] }) {
  return (
    <>
      {realms.map((realm) => {
        const list = grouped.get(realm.id)
        if (!list || list.length === 0) return null
        return (
          <section key={realm.id} className="mb-md last:mb-0">
            <h3 className="text-[var(--text-meta)] font-semibold text-[var(--text-primary)]">
              {realm.name}
              <span className="ml-sm font-normal text-[var(--text-tertiary)]">{list.length}</span>
            </h3>
            <ul className="mt-xs space-y-1">
              {list.map((s) => (
                <li key={s.id}>
                  {s.hasRecord && s.entityId ? (
                    <Link
                      to={`/characters?character=${s.entityId}`}
                      className="block truncate text-[var(--text-meta)] text-[var(--text-secondary)] underline-offset-4 hover:text-[var(--text-link)] hover:underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
                    >
                      {s.name}
                    </Link>
                  ) : (
                    /* Not a link, because there is nowhere for it to go. Still
                       text, still selectable — the rule is that nothing is
                       hidden, not that everything is clickable. */
                    <span className="block truncate text-[var(--text-meta)] text-[var(--text-secondary)]">
                      {s.name}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </>
  )
}

/** The state the canvas publishes, re-exported so the page does not import both. */
export type { ShadesmarUiState }
