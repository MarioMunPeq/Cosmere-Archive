export type BookState = 'idle' | 'extracting' | 'opened' | 'turningPage' | 'closing' | 'finished'

export type Direction = 'forward' | 'backward'

export type BookEvent =
  | 'EXTRACT'
  | 'EXTRACT_DONE'
  | 'TURN_START'
  | 'TURN_DONE'
  | 'CLOSE'
  | 'CLOSE_DONE'

const TRANSITIONS: Record<BookState, Partial<Record<BookEvent, BookState>>> = {
  idle: { EXTRACT: 'extracting' },
  extracting: { EXTRACT_DONE: 'opened' },
  opened: { TURN_START: 'turningPage', CLOSE: 'closing' },
  turningPage: { TURN_DONE: 'opened', CLOSE: 'closing' },
  closing: { CLOSE_DONE: 'finished' },
  finished: {},
}

export const ANIM_TIMING = {
  extract: 1000,
  close: 800,
  pageTurn: 750,
}

export function transition(current: BookState, event: BookEvent): BookState {
  const next = TRANSITIONS[current]?.[event]
  if (!next) {
    return current
  }
  return next
}

export function isOpen(state: BookState): boolean {
  return state === 'opened' || state === 'turningPage'
}
