export type BookState = 'idle' | 'spawning' | 'opened' | 'turningPage' | 'closing' | 'finished'

export type BookEvent = 'SPAWN' | 'SPAWN_DONE' | 'TURN_START' | 'TURN_DONE' | 'CLOSE' | 'CLOSE_DONE'

const TRANSITIONS: Record<BookState, Partial<Record<BookEvent, BookState>>> = {
  idle: { SPAWN: 'spawning' },
  spawning: { SPAWN_DONE: 'opened' },
  opened: { TURN_START: 'turningPage', CLOSE: 'closing' },
  turningPage: { TURN_DONE: 'opened', CLOSE: 'closing' },
  closing: { CLOSE_DONE: 'finished' },
  finished: {},
}

export const ANIM_TIMING = {
  spawn: 1200,
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
