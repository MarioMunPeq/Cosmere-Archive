/**
 * SearchDialog — the global search. D-SEARCH, §5.8.
 *
 * Built on the native `<dialog>` so focus trapping, Escape and background
 * `inert` come from the browser rather than from the three hand-rolled
 * compositions this replaces.
 *
 * ARIA is a combobox that owns a listbox, which is the pattern §5.8 calls for
 * and the one the previous SearchInput approximated without getting right:
 *
 *   input   role="combobox" aria-expanded aria-controls aria-activedescendant
 *   ul      role="listbox"
 *   li      role="option" aria-selected
 *
 * Focus stays in the input at all times. `aria-activedescendant` is what tells
 * a screen reader which option is current without moving DOM focus, which would
 * break typing.
 *
 * The placeholder is fixed. The old hook rotated it through five strings every
 * 4 seconds, which re-rendered the tree four times a minute to change a
 * decoration, and it was picked up by assistive technology as changing content.
 */

import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { useGlobalSearch } from '@/search/useGlobalSearch'
import { CATEGORY_LABEL } from '@/search/types'
import Icon, { CloseGlyph } from '@/components/primitives/Icon'
import DestinationIcon from '@/components/layout/DestinationIcon'
import type { IconName } from '@/navigation'
import EmptyState from '@/components/primitives/EmptyState'

/** Glyph per result category, from RESULT_GLYPHS in primitives/Icon. */
const GLYPH: Record<string, IconName> = {
  character: 'person',
  planet: 'planet',
  book: 'book',
  shard: 'shard',
  series: 'book',
  magic: 'magic',
  hero: 'herald',
  event: 'event',
}

/** Flat index of a result inside the combined list, for aria-activedescendant. */
function optionId(index: number): string {
  return `search-option-${index}`
}

interface Props {
  open: boolean
  onClose: () => void
}

export default function SearchDialog({ open, onClose }: Props) {
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)
  const { query, setQuery, groups, results, activeIndex, isEmpty, reset, move, highlight } = useGlobalSearch(open)

  /**
   * Flat position of each result, for aria-activedescendant and for the arrow
   * keys. The previous version kept a running counter mutated during render,
   * which coupled the group loop to the option loop and tripped the compiler
   * lint; the map is derived instead.
   */
  const flatIndex = useMemo(() => {
    const map = new Map<string, number>()
    results.forEach((r, i) => map.set(r.id, i))
    return map
  }, [results])

  // Native dialog: showModal traps focus and inert the background for free.
  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    const canModal = typeof el.showModal === 'function'
    if (open) {
      if (canModal && !el.open) el.showModal()
      else if (!canModal) el.setAttribute('open', '')
      // §5.8 asks for autofocus; showModal does not move focus on its own.
      requestAnimationFrame(() => inputRef.current?.focus())
    } else if (el.open) {
      if (canModal && typeof el.close === 'function') el.close()
      else el.removeAttribute('open')
    }
  }, [open])

  // Keep the highlighted option inside the scrolled area.
  useEffect(() => {
    if (activeIndex < 0) return
    document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const go = (index: number) => {
    const hit = results[index]
    if (!hit) return
    onClose()
    // HashRouter: the route is a fragment path.
    navigate(hit.route)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        move(1)
        break
      case 'ArrowUp':
        e.preventDefault()
        move(-1)
        break
      case 'Enter':
        e.preventDefault()
        go(activeIndex)
        break
      case 'Escape':
        // The native dialog already closes on Escape; this clears the query so
        // reopening does not show the previous search.
        reset()
        break
      case 'Home':
        if (results.length > 0) {
          e.preventDefault()
          highlight(0)
        }
        break
      case 'End':
        if (results.length > 0) {
          e.preventDefault()
          highlight(results.length - 1)
        }
        break
      default:
        break
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label="Search the archive"
      onClose={() => {
        reset()
        onClose()
      }}
      onClick={(e) => {
        // The dialog element is its own backdrop; a click outside its box lands
        // here with target === the dialog itself.
        if (e.target !== dialogRef.current) return
        const r = dialogRef.current?.getBoundingClientRect()
        if (!r) return
        const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
        if (!inside) onClose()
      }}
      className={[
        'fixed left-1/2 top-[clamp(24px,10vh,96px)] m-0 max-h-[min(80vh,720px)] w-[min(600px,calc(100vw-40px))] max-w-none overflow-hidden rounded-[3px] p-0',
        'border border-[#8b6a3c] text-[#241a12]',
        'shadow-[0_28px_90px_rgba(0,0,0,0.72),0_4px_18px_rgba(0,0,0,0.35)]',
        'backdrop:bg-[color-mix(in_srgb,var(--surface-void)_82%,transparent)] backdrop:backdrop-blur-[5px]',
      ].join(' ')}
      style={{
        position: 'fixed',
        insetInlineStart: '50%',
        insetBlockStart: 'clamp(24px, 10vh, 96px)',
        transform: 'translateX(-50%)',
        maxHeight: 'min(80vh, 720px)',
        background: 'linear-gradient(152deg, #f2e9d4 0%, #eae0c8 40%, #e0d4b6 76%, #d6c8a6 100%)',
      }}
    >
      <div className="flex items-center gap-[var(--spacing-sm)] border-b border-[var(--border-subtle)] px-[var(--spacing-md)]">
        <span aria-hidden className="shrink-0 text-[var(--text-tertiary)]">
          <DestinationIcon name="search" size={20} />
        </span>

        <input
          ref={inputRef}
          type="text"
          role="combobox"
          autoComplete="off"
          spellCheck={false}
          aria-expanded={results.length > 0}
          aria-controls="search-results"
          aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
          aria-label="Search the archive"
          placeholder="Search characters, worlds, volumes, events…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          className={[
            'h-14 w-full min-w-0 bg-transparent text-body text-[var(--text-primary)]',
            'placeholder:text-[var(--text-tertiary)] focus:outline-none',
          ].join(' ')}
        />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className={[
            'flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-md)]',
            'text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-base)] hover:text-[var(--text-primary)]',
            'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
          ].join(' ')}
        >
          <Icon size={18}>
            <CloseGlyph />
          </Icon>
        </button>
      </div>

      {results.length > 0 ? (
        <ul
          ref={listRef}
          id="search-results"
          role="listbox"
          aria-label="Search results"
          className="max-h-[min(60vh,480px)] overflow-y-auto overscroll-contain py-2"
        >
          {groups.map((group) => (
            <li key={group.type} role="presentation">
              <p
                role="presentation"
                className="px-[var(--spacing-md)] pt-2 pb-1 text-nano tracking-[var(--ls-caps-wide)] text-[var(--text-tertiary)] uppercase"
              >
                {group.label}
              </p>
              <ul role="presentation">
                {group.results.map((result) => {
                  const index = flatIndex.get(result.id) ?? 0
                  const selected = index === activeIndex
                  return (
                    <li key={result.id} role="presentation">
                      <div
                        id={optionId(index)}
                        role="option"
                        aria-selected={selected}
                        // Exposed so the e2e test can verify §5.8 Q.3 — that
                        // every result route resolves — without clicking each
                        // one, which would close the dialog and invalidate
                        // every other locator.
                        data-route={result.route}
                        onClick={() => go(index)}
                        // enter, not move: mousemove fires on every pixel and
                        // would re-render the list continuously.
                        onMouseEnter={() => highlight(index)}
                        className={[
                          'flex cursor-pointer items-center gap-3 px-[var(--spacing-md)] py-2.5',
                          'text-[var(--text-body)]',
                          selected
                            ? 'bg-[var(--surface-base)] text-[var(--text-primary)]'
                            : 'text-[var(--text-secondary)]',
                        ].join(' ')}
                      >
                        <span
                          aria-hidden
                          className={selected ? 'text-[var(--text-accent)]' : 'text-[var(--text-tertiary)]'}
                        >
                          <DestinationIcon name={GLYPH[result.type] ?? 'book'} size={18} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-[var(--fw-medium)]">{result.title}</span>
                          <span className="block truncate text-meta text-[var(--text-tertiary)]">
                            {result.subtitle}
                          </span>
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <div className="max-h-[min(50vh,400px)] overflow-y-auto">
          {isEmpty ? (
            <EmptyState
              size="sm"
              icon={<DestinationIcon name="search" size={32} />}
              title={`No matches for «${query.trim()}»`}
              description="Try a character, a world, a volume or an era."
            />
          ) : (
            <p className="px-[var(--spacing-md)] py-[var(--spacing-lg)] text-meta text-[var(--text-tertiary)]">
              Search {CATEGORY_LABEL.character.toLowerCase()}, worlds, volumes, magic and events. Press
              <kbd className="mx-1 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] px-1.5 py-0.5 font-[var(--font-mono)] text-[11px]">
                Esc
              </kbd>
              to close.
            </p>
          )}
        </div>
      )}

      {/* Announced politely, so the result count is read without interrupting. */}
      <p role="status" aria-live="polite" className="sr-only">
        {results.length > 0
          ? `${results.length} result${results.length === 1 ? '' : 's'}`
          : isEmpty
            ? `No results for ${query}`
            : ''}
      </p>
    </dialog>
  )
}
