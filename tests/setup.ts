import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// jsdom does not implement layout/media or pointer capture. Only platform
// boundaries are stubbed; selection, focus and draft behavior remain real.
afterEach(cleanup)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi
    .fn()
    .mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
})
HTMLElement.prototype.scrollIntoView = vi.fn()
HTMLElement.prototype.setPointerCapture = vi.fn()
HTMLElement.prototype.releasePointerCapture = vi.fn()
HTMLElement.prototype.hasPointerCapture = () => true
