/**
 * The bridge between the canvas and the DOM — §5.5.3.
 *
 * §5.5.3's hard rule is **zero `ctx.fillText`**: every piece of information on
 * this page lives in the DOM. That is not a preference about legibility. Text
 * drawn into a canvas is a picture of text — unselectable, unsearchable,
 * unreachable by a screen reader, invisible to the browser's own text scaling,
 * and rendered at whatever size the code asked for rather than the size the
 * reader set. Four `fillText` calls in `Renderer.ts` were all of it.
 *
 * So the canvas keeps drawing light and the DOM keeps drawing words. What has
 * to cross between them is *where things are*, and that is what this store is.
 *
 * ## Why a store and not `useState`
 *
 * The positions update sixty times a second. Routing them through React state
 * would re-render the whole overlay at 60Hz to move a box by a pixel, and the
 * selection panel would re-mount its own links in the middle of an animation.
 * Instead the snapshot object only changes identity when something a reader can
 * perceive has changed: a different soul selected, the camera far enough that
 * the inspector's offset is no longer right. Position updates are quantised —
 * half a pixel — because below that nothing moves on any display, and a value
 * that never changes does not re-render.
 */

import { useSyncExternalStore } from 'react'
import type { ClusterDef, EntityKind, Soul } from './types'

export interface SoulInfo {
  /** `soul_<entityId>`; the key the canvas uses. */
  id: string
  /** The record's own id, for `/characters?character=`. */
  entityId: string | null
  name: string
  kind: EntityKind
  realmId: string
  realmName: string
  description: string
  /** Whether a `/characters` record exists. A herald has none. */
  hasRecord: boolean
}

export interface SelectionView extends SoulInfo {
  /** Where the soul is on screen, canvas-relative. */
  x: number
  y: number
}

export interface ShadesmarUiState {
  hovered: SoulInfo | null
  selected: SelectionView | null
  focusedRealmId: string | null
  /** Text in the soul-list filter. */
  query: string
  /** Souls whose realm has no match, dimmed rather than removed (§5.5.5). */
  realmsMatching: Set<string> | null
}

const INITIAL: ShadesmarUiState = {
  hovered: null,
  selected: null,
  focusedRealmId: null,
  query: '',
  realmsMatching: null,
}

type Listener = () => void

export class ShadesmarStore {
  private state: ShadesmarUiState = INITIAL
  private listeners = new Set<Listener>()

  getSnapshot = (): ShadesmarUiState => this.state

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private emit(patch: Partial<ShadesmarUiState>) {
    let changed = false
    for (const key of Object.keys(patch) as (keyof ShadesmarUiState)[]) {
      if (!Object.is(this.state[key], patch[key])) {
        changed = true
        break
      }
    }
    if (!changed) return
    this.state = { ...this.state, ...patch }
    for (const l of this.listeners) l()
  }

  setHovered(info: SoulInfo | null) {
    // Identity matters more than contents here: the overlay re-renders on a new
    // object, so a fresh object every frame would re-render every frame. The
    // canvas therefore only publishes when the id actually differs.
    if (this.state.hovered?.id === info?.id) return
    this.emit({ hovered: info })
  }

  setSelected(info: SelectionView | null) {
    if (!info && !this.state.selected) return
    if (info && this.state.selected) {
      /*
       * Same soul, moved: notify, but only past the threshold.
       *
       * An earlier version updated the state silently and expected the panel
       * to read it on its own. It did not — `useSyncExternalStore` only re-renders
       * when a listener is called — so the inspector stayed frozen where the
       * bead happened to be when you clicked it, and S.6 measured a 21px gap
       * instead of 28. Sub-pixel movement still does not notify, which is what
       * keeps a drifting bead from re-rendering sixty times a second.
       */
      const moved =
        Math.abs(info.x - this.state.selected.x) > POSITION_EPSILON ||
        Math.abs(info.y - this.state.selected.y) > POSITION_EPSILON
      if (!moved) return
    }
    this.emit({ selected: info })
  }

  setFocusedRealm(id: string | null) {
    this.emit({ focusedRealmId: id })
  }

  setQuery(query: string) {
    this.emit({ query })
  }

  setRealmsMatching(ids: Set<string> | null) {
    this.emit({ realmsMatching: ids })
  }

  reset() {
    this.emit({ ...INITIAL })
  }
}

/**
 * Half a pixel.
 *
 * Below this nothing moves on any display this ships to, and a value that does
 * not change is a value that does not re-render.
 */
const POSITION_EPSILON = 0.5

export const shadesmarStore = new ShadesmarStore()

/** Read the UI state. Re-renders only when something perceptible changed. */
export function useShadesmarUi(): ShadesmarUiState {
  return useSyncExternalStore(shadesmarStore.subscribe, shadesmarStore.getSnapshot)
}

/* ------------------------------------------------------------------ mapping */

/** Human wording for the three kinds of soul, used in the inspector. */
export const KIND_LABEL: Record<EntityKind, string> = {
  herald: 'Herald',
  important_character: 'Named soul',
  character: 'Soul',
}

const realmNameById = new Map<string, string>()

export function registerRealms(realms: Pick<ClusterDef, 'id' | 'name'>[]): void {
  for (const r of realms) realmNameById.set(r.id, r.name)
}

/** Turn a canvas soul into what the DOM needs to describe it. */
export function describeSoul(soul: Soul, hasRecord: (id: string) => boolean): SoulInfo {
  const entityId = soul.entityId?.replace(/^soul_/, '') ?? null
  return {
    id: soul.id,
    entityId,
    name: soul.name ?? 'Unnamed',
    kind: soul.kind,
    realmId: soul.planet ?? 'cosmere',
    realmName: realmNameById.get(soul.planet ?? 'cosmere') ?? 'The Cosmere',
    description: soul.description ?? '',
    hasRecord: entityId ? hasRecord(entityId) : false,
  }
}
