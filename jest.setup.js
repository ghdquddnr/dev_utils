// jest.setup.js
// Mock lib/utils BEFORE any other imports
jest.mock('@/lib/utils', () => ({
  cn: (...inputs) => {
    return inputs
      .flat()
      .filter((x) => typeof x === 'string' && x.length > 0)
      .join(' ')
  },
  copyToClipboard: jest.fn(async () => true),
  formatErrorMessage: (error) => {
    if (typeof error === 'string') return error
    if (error instanceof Error) return error.message
    return '알 수 없는 오류가 발생했습니다'
  },
  debounce: (func) => func,
}), { virtual: true })

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => null,
}))

require('@testing-library/jest-dom')

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
})
