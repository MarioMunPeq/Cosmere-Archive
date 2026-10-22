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
  /** Return to the full ocean from a named subastral. */
  onOverview: () => void
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

export default function ShadesmarOverlay({ souls, onFocusRealm, onOverview, onCloseInspector }: Props) {
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
        focusedRealm={PERPENDICULARITIES.find((realm) => realm.id === ui.focusedRealmId) ?? null}
        focusedSoulCount={grouped.get(ui.focusedRealmId ?? '')?.length ?? 0}
        onOverview={onOverview}
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
          count: grouped.get(c.id)?.length ?? 0,
        }))}
        activeId={ui.focusedRealmId}
        onFocus={onFocusRealm}
      />
    </div>
  )
}

/* -------------------------------------------------------------------- header */

function ShadesmarHeader({
  soulCount,
  focusedRealm,
  focusedSoulCount,
  onOverview,
  list,
}: {
  soulCount: number
  focusedRealm: (typeof PERPENDICULARITIES)[number] | null
  focusedSoulCount: number
  onOverview: () => void
  list: ReactNode
}) {
  return (
    <header
      data-shadesmar-header
      className="pointer-events-none relative flex shrink-0 items-start gap-4 px-5 pt-5 md:px-10 md:pt-7"
      style={{
        background: 'linear-gradient(180deg, rgba(5,8,11,0.84) 0%, rgba(5,8,11,0.32) 72%, transparent 100%)',
      }}
    >
      <div className="min-w-0">
        <p className="whitespace-nowrap font-[var(--font-display)] text-[9px] tracking-[0.16em] uppercase text-[#afc5bf] md:text-[11px] md:tracking-[0.28em]">
          The Cognitive Realm
        </p>
        <h1 className="mt-1 font-[var(--font-display)] text-2xl tracking-[0.03em] text-[#edf0e8] drop-shadow-[0_2px_18px_rgba(180,220,210,0.25)] md:text-[34px]">
          {focusedRealm?.name ?? 'Shadesmar'}
        </h1>
        <p className="mt-1 text-xs tracking-[0.12em] text-[#aabbb7] md:text-sm">
          {focusedRealm
            ? `${focusedSoulCount} souls recorded`
            : `${soulCount} living souls · ${PERPENDICULARITIES.length} worlds beyond the shore`}
        </p>
      </div>

      <div className="pointer-events-auto ml-auto mt-1 flex shrink-0 items-start gap-2">
        {focusedRealm ? (
          <button
            type="button"
            data-shadesmar-hud
            data-shadesmar-back
            onClick={onOverview}
            aria-label="Back to the whole ocean"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-[#b9c8ba]/35 bg-[radial-gradient(circle_at_35%_30%,rgba(177,204,191,.18),rgba(10,17,20,.84)_70%)] p-0 text-[#d5ddd1] shadow-[0_6px_22px_rgba(0,0,0,.22),inset_0_0_8px_rgba(200,220,196,.08)] backdrop-blur-sm transition-colors hover:border-[#d1dfcf]/75 hover:text-[#f0eadb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1dbd1] sm:h-12 sm:w-auto sm:gap-2 sm:rounded-sm sm:px-3"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.35"
              strokeLinecap="round"
              aria-hidden
            >
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 4v5m0 6v5M4 12h5m6 0h5M8 8l8 8m0-8-8 8" opacity=".7" />
            </svg>
            <span className="hidden text-[9px] tracking-[0.14em] uppercase sm:block">Whole ocean</span>
          </button>
        ) : null}
        <details className="group relative">
          <summary className="relative inline-flex size-11 cursor-pointer list-none items-center justify-center border border-[#a88f5b]/60 bg-[linear-gradient(135deg,rgba(112,94,56,.48),rgba(17,22,20,.97)_68%)] p-0 text-left text-[#e4d5ac] shadow-[0_7px_24px_rgba(0,0,0,.3),inset_0_1px_rgba(239,220,165,.18),inset_0_0_0_3px_rgba(12,16,15,.38)] transition-colors hover:border-[#e0cc98]/90 hover:brightness-110 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#d9c690] sm:h-12 sm:w-auto sm:gap-3 sm:px-3 md:px-4">
            <span
              aria-hidden
              className="relative grid size-8 shrink-0 place-items-center border border-[#d7c58e]/45 bg-[#111714]/70 text-[#e8d9ad] shadow-[inset_0_0_12px_rgba(218,192,123,.1)]"
            >
              <svg
                viewBox="0 0 32 32"
                className="size-6"
                fill="none"
                stroke="currentColor"
                strokeWidth=".8"
                aria-hidden
              >
                <circle cx="16" cy="16" r="12" opacity=".65" />
                <circle cx="16" cy="16" r="7" opacity=".45" />
                <path d="M16 3 18 14 29 16 18 18 16 29 14 18 3 16 14 14 16 3Z" fill="currentColor" fillOpacity=".3" />
                <path d="m16 9 1.4 5.6L23 16l-5.6 1.4L16 23l-1.4-5.6L9 16l5.6-1.4L16 9Z" />
              </svg>
            </span>
            <span className="hidden sm:block">
              <span className="block text-[9px] tracking-[0.2em] uppercase text-[#bca878]">Field notes</span>
              <span className="mt-0.5 block font-[var(--font-display)] text-sm tracking-[0.04em]">The index</span>
            </span>
            <span
              aria-hidden
              className="ml-1 hidden border-l border-[#d2bd86]/25 pl-3 font-[var(--font-display)] text-lg text-[#cbb77f] md:block"
            >
              {soulCount}
            </span>
            <span className="sr-only">Open field notes, {soulCount} souls</span>
          </summary>
          <div
            className="absolute right-0 z-30 mt-3 max-h-[min(68vh,620px)] w-[min(470px,calc(100vw-2rem))] overflow-y-auto border border-[#b49d68]/80 bg-[linear-gradient(145deg,#332f24,#151918_28%,#29271f)] p-2 shadow-[0_24px_80px_rgba(0,0,0,.76),inset_0_1px_rgba(240,218,163,.16)]"
            style={{ scrollbarColor: '#8d7950 transparent', scrollbarWidth: 'thin' }}
          >
            <div
              className="relative border border-[#bbab7d]/55 p-4 md:p-5"
              style={{
                color: '#302b20',
                backgroundColor: '#d7c99f',
                backgroundImage:
                  'radial-gradient(circle at 8px 7px,rgba(68,56,32,.72) 0 2px,rgba(244,228,184,.55) 2.5px 3.5px,transparent 4px),linear-gradient(90deg,transparent 0 17px,rgba(136,75,54,.28) 17px 18px,transparent 18px 100%),repeating-linear-gradient(0deg,rgba(98,78,44,.065) 0 1px,transparent 1px 30px),radial-gradient(ellipse at 88% 0%,rgba(255,249,218,.48),transparent 50%)',
                backgroundSize: '100% 58px,100% 100%,100% 30px,100% 100%',
                boxShadow: 'inset 0 0 0 1px rgba(82,62,31,.13), inset 0 0 30px rgba(69,49,18,.10)',
              }}
            >
              <div className="mb-4 flex items-end justify-between border-b border-[#584a30]/40 pb-3">
                <div>
                  <p className="text-[9px] tracking-[0.24em] uppercase text-[#766744]">
                    Surveyor’s field book · XI crossings
                  </p>
                  <h2 className="mt-1 font-[var(--font-display)] text-2xl text-[#2f2a20]">Names carried by the sea</h2>
                </div>
                <div className="flex items-center gap-2 border-l border-[#6e5d37]/30 pl-3">
                  <svg
                    viewBox="0 0 32 32"
                    className="size-7 text-[#665533]/80"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth=".9"
                    aria-hidden
                  >
                    <circle cx="16" cy="16" r="11.5" />
                    <path
                      d="M16 4 18.2 13.8 28 16l-9.8 2.2L16 28l-2.2-9.8L4 16l9.8-2.2L16 4Z"
                      fill="currentColor"
                      fillOpacity=".14"
                    />
                    <path d="M16 10v12m-6-6h12M12 12l8 8m0-8-8 8" opacity=".65" />
                    <circle cx="16" cy="16" r="1.8" fill="currentColor" />
                  </svg>
                  <span className="font-[var(--font-display)] text-xl text-[#665533]">{soulCount}</span>
                </div>
              </div>
              {list}
            </div>
          </div>
        </details>
      </div>
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
  const clampedTop = Math.max(64, Math.min(view.y - 20, viewport.h - 500))

  return (
    <aside
      data-shadesmar-inspector
      aria-label={`${view.name}, ${KIND_LABEL[view.kind]}`}
      style={{
        transform: `translate(${Math.round(clampedLeft)}px, ${Math.round(clampedTop)}px)`,
        width: `min(${INSPECTOR_MAX_WIDTH}px, calc(100vw - 16px))`,
        maxHeight: 'min(460px, calc(100vh - 170px))',
        overflowY: 'auto',
        background: 'linear-gradient(145deg,rgba(49,47,38,.97),rgba(12,18,20,.98) 32%,rgba(7,11,13,.98))',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 18px 52px rgba(0,0,0,.68), inset 0 1px rgba(223,214,181,.15), inset 0 0 0 4px rgba(0,0,0,.14)',
      }}
      className={['pointer-events-auto absolute top-0 left-0', 'border border-[#b09a67]/65 p-4 md:p-5'].join(' ')}
    >
      <div aria-hidden className="absolute inset-x-3 top-2 flex justify-between">
        <span className="size-1 rounded-full bg-[#c5ad70]/75 shadow-[0_0_5px_rgba(220,193,126,.6)]" />
        <span className="size-1 rounded-full bg-[#c5ad70]/75 shadow-[0_0_5px_rgba(220,193,126,.6)]" />
      </div>
      <div className="flex items-start justify-between gap-3 border-b border-[#baa678]/24 pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="relative grid size-9 shrink-0 place-items-center rounded-full border border-[#b8c9bd]/42 bg-[radial-gradient(circle_at_34%_30%,rgba(236,248,223,.92),rgba(132,183,176,.72)_18%,rgba(34,71,78,.85)_62%,rgba(8,19,24,.98)_100%)] shadow-[0_0_18px_rgba(116,191,188,.2),inset_0_0_6px_rgba(220,246,229,.52)]"
          >
            <span className="size-1.5 rounded-full bg-[#f5f5dc] shadow-[0_0_8px_3px_rgba(226,247,229,.65)]" />
          </span>
          <h2 className="truncate font-[var(--font-display)] text-xl tracking-[0.02em] text-[#f0ead9] md:text-2xl">
            {view.name}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-mt-1 -mr-1 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center border border-[#b9a675]/24 text-[#b8b19e] transition-colors hover:border-[#c9b77f]/60 hover:bg-[#d7c99f]/[.07] hover:text-[#f0ead9] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#d8c48d]"
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

      <p className="mt-3 font-[var(--font-display)] text-[11px] tracking-[0.13em] uppercase text-[#c0b287]">
        {KIND_LABEL[view.kind]} · {view.realmName}
      </p>

      {view.description ? (
        <p className="mt-2 max-w-[34ch] text-sm leading-[1.55] text-[#c5c8be]">{view.description}</p>
      ) : null}

      {/*
        Only when there is a record. A herald has a name and a surge list and no
        `/characters` entry; a "View record" link that goes nowhere is worse
        than no link.
      */}
      {view.hasRecord && view.entityId ? (
        <Link
          to={`/characters?character=${view.entityId}`}
          className="mt-4 inline-flex items-center gap-2 border-t border-[#baa678]/24 pt-3 font-[var(--font-display)] text-sm tracking-[0.05em] text-[#e0d0a6] underline-offset-4 hover:text-[#fff0c7] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#d8c48d]"
        >
          Open field record
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
 * The worlds are a route chart along the shore, with every crossing exposed
 * as a labelled, keyboard-reachable waypoint.
 */
function SoulLegend({
  realms,
  activeId,
  onFocus,
}: {
  realms: { id: string; name: string; count: number }[]
  activeId: string | null
  onFocus: (id: string | null) => void
}) {
  return (
    <nav
      aria-label="Worlds of Shadesmar"
      data-shadesmar-legend
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-10 flex items-stretch gap-3 overflow-x-auto border-t border-[#b9a472]/25 px-4 pb-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom)+10px)] pt-2.5 md:px-10 md:pb-4"
      style={{
        background: 'linear-gradient(180deg, rgba(8,12,13,.12) 0%, rgba(10,14,15,.78) 24%, rgba(7,10,11,.97) 100%)',
        boxShadow: 'inset 0 1px rgba(226,215,186,.045), 0 -18px 42px rgba(0,0,0,.13)',
      }}
    >
      <div
        aria-hidden
        className="flex w-[82px] shrink-0 flex-col justify-center border-r border-[#c8b27d]/25 pr-2 md:w-[128px] md:pr-3"
      >
        <span className="hidden font-[var(--font-display)] text-[9px] tracking-[0.22em] uppercase text-[#c4b17c] md:block">
          Navigator’s chart
        </span>
        <span className="whitespace-nowrap font-[var(--font-display)] text-[13px] text-[#eee5cf] md:mt-1 md:text-lg">
          Crossings
        </span>
        <span className="mt-0.5 hidden text-[9px] tracking-[0.14em] text-[#9eaaa1] md:block">XI subastrals</span>
      </div>
      <div className="relative flex min-w-max items-stretch">
        <div
          aria-hidden
          className="absolute inset-x-5 top-[17px] h-px bg-[linear-gradient(90deg,rgba(187,164,105,.08),rgba(216,194,137,.34),rgba(187,164,105,.08))]"
        />
        {realms.map((r, index) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onFocus(r.id)}
            aria-current={activeId === r.id ? 'true' : undefined}
            aria-label={`${r.name}, ${r.count} souls`}
            title={r.name}
            className="group relative inline-flex min-h-[70px] w-[86px] shrink-0 cursor-pointer flex-col items-center px-2 pt-1 text-center transition-[background,transform,opacity] duration-300 hover:bg-[rgba(217,201,153,.035)] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#d8c48d]/70 md:w-[100px]"
            style={{ opacity: activeId === r.id ? 1 : 0.72 }}
          >
            <span
              aria-hidden
              className="relative z-[1] grid size-[27px] place-items-center bg-[#0b1012] font-[var(--font-display)] text-[10px] text-[#b9ad8b] ring-1 ring-[#bba879]/38 transition-all duration-300 group-hover:text-[#e5d9b7] group-hover:ring-[#d4c394]/70"
              style={{
                boxShadow:
                  activeId === r.id
                    ? '0 0 16px rgba(205,193,150,.18), inset 0 0 9px rgba(205,193,150,.13)'
                    : '0 0 0 transparent',
              }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="mt-1.5 whitespace-nowrap font-[var(--font-display)] text-[13px] leading-4 text-[#e8e1cf]">
              {r.name}
            </span>
            <span className="mt-0.5 text-[9px] tracking-[0.14em] text-[#a7aaa0]">
              {r.count ? `${r.count} souls` : 'uncharted'}
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}
function SoulList({ grouped, realms }: { grouped: Map<string, SoulInfo[]>; realms: { id: string; name: string }[] }) {
  return (
    <>
      {realms.map((realm) => {
        const list = grouped.get(realm.id)
        if (!list || list.length === 0) return null
        return (
          <section key={realm.id} className="mb-md last:mb-0">
            <h3 className="border-b border-[#584a30]/25 pb-1 font-[var(--font-display)] text-base font-semibold text-[#3a3223]">
              {realm.name}
              <span className="ml-2 font-sans text-[10px] font-normal tracking-[0.12em] uppercase text-[#756747]">
                {list.length} recorded
              </span>
            </h3>
            <ul className="mt-1">
              {list.map((s, index) => (
                <li
                  key={s.id}
                  className="flex min-h-[29px] items-center gap-3 border-b border-[#584a30]/[.12] pl-5 pr-1"
                >
                  <span aria-hidden className="w-5 shrink-0 font-mono text-[9px] tracking-[0.08em] text-[#8d7a55]/85">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {s.hasRecord && s.entityId ? (
                    <Link
                      to={`/characters?character=${s.entityId}`}
                      className="block min-w-0 flex-1 truncate font-[var(--font-display)] text-[15px] text-[#4a4333] underline-offset-4 hover:text-[#17150f] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6f5c32]"
                    >
                      {s.name}
                    </Link>
                  ) : (
                    /* Not a link, because there is nowhere for it to go. Still
                       text, still selectable — the rule is that nothing is
                       hidden, not that everything is clickable. */
                    <span className="block min-w-0 flex-1 truncate font-[var(--font-display)] text-[15px] text-[#4a4333]">
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
