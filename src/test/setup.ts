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

if (typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = () => {}
}

if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

if (typeof ResizeObserver !== 'function') {
  class MockResizeObserver {
    constructor(_callback: ResizeObserverCallback) {}
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver
}

if (typeof IntersectionObserver !== 'function') {
  class MockIntersectionObserver {
    readonly root: Element | Document | null = null
    readonly rootMargin: string = ''
    readonly thresholds: ReadonlyArray<number> = []
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  }
  globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
}
