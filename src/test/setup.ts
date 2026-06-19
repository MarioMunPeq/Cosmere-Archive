import '@testing-library/jest-dom'

// jsdom polyfills for animation frame
if (typeof globalThis !== 'undefined') {
  if (typeof globalThis.cancelAnimationFrame !== 'function') {
    ;(globalThis as Record<string, unknown>).cancelAnimationFrame = () => {}
  }
  if (typeof globalThis.requestAnimationFrame !== 'function') {
    ;(globalThis as Record<string, unknown>).requestAnimationFrame = ((cb: (time: number) => void) => {
      return setTimeout(cb, 0) as unknown as number
    }) as typeof globalThis.requestAnimationFrame
  }
}
