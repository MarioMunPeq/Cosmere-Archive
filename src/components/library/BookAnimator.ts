export type BookState =
  | 'idle'
  | 'extracting'
  | 'rotating'
  | 'centering'
  | 'opening'
  | 'opened'
  | 'turningPage'
  | 'closing'
  | 'returning'
  | 'finished'

export type BookEvent =
  | 'EXTRACT'
  | 'EXTRACT_DONE'
  | 'ROTATE_DONE'
  | 'CENTER_DONE'
  | 'OPEN_DONE'
  | 'TURN_START'
  | 'TURN_DONE'
  | 'CLOSE'
  | 'COVER_CLOSED'
  | 'RETURN_DONE'

const TRANSITIONS: Record<BookState, Partial<Record<BookEvent, BookState>>> = {
  idle: { EXTRACT: 'extracting' },
  extracting: { EXTRACT_DONE: 'rotating', CLOSE: 'closing' },
  rotating: { ROTATE_DONE: 'centering', CLOSE: 'closing' },
  centering: { CENTER_DONE: 'opening', CLOSE: 'closing' },
  opening: { OPEN_DONE: 'opened', CLOSE: 'closing' },
  opened: { TURN_START: 'turningPage', CLOSE: 'closing' },
  turningPage: { TURN_DONE: 'opened', CLOSE: 'closing' },
  closing: { COVER_CLOSED: 'returning' },
  returning: { RETURN_DONE: 'finished' },
  finished: {},
}

export interface AnimTiming {
  extract: number
  rotate: number
  center: number
  open: number
  closeCover: number
  closeFlight: number
  pageTurn: number
}

export const ANIM_TIMING: AnimTiming = {
  extract: 800,
  rotate: 500,
  center: 700,
  open: 1000,
  closeCover: 600,
  closeFlight: 700,
  pageTurn: 600,
}

export function transition(current: BookState, event: BookEvent): BookState {
  const next = TRANSITIONS[current]?.[event]
  if (!next) {
    return current
  }
  return next
}

export function isAnimating(state: BookState): boolean {
  return state !== 'idle' && state !== 'opened' && state !== 'finished'
}

export function isOpen(state: BookState): boolean {
  return state === 'opened' || state === 'turningPage'
}
