export type BookState = 'idle' | 'extracting' | 'stabilizing' | 'opened' | 'turningPage' | 'closing' | 'finished'

export type Direction = 'forward' | 'backward'

export type BookEvent =
  | 'EXTRACT'
  | 'EXTRACT_DONE'
  | 'STABILIZE_DONE'
  | 'TURN_START'
  | 'TURN_DONE'
  | 'CLOSE'
  | 'CLOSE_DONE'

const TRANSITIONS: Record<BookState, Partial<Record<BookEvent, BookState>>> = {
  idle: { EXTRACT: 'extracting' },
  extracting: { EXTRACT_DONE: 'stabilizing' },
  stabilizing: { STABILIZE_DONE: 'opened' },
  opened: { TURN_START: 'turningPage', CLOSE: 'closing' },
  turningPage: { TURN_DONE: 'opened', CLOSE: 'closing' },
  closing: { CLOSE_DONE: 'finished' },
  finished: {},
}

export const ANIM_TIMING = {
  extract: 900,
  stabilize: 400,
  close: 800,
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
