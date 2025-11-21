// Mock implementation of lib/utils for testing
export function cn(...inputs: any[]): string {
  // Simple implementation that concatenates class names
  return inputs
    .flat()
    .filter((x) => typeof x === 'string' && x.length > 0)
    .join(' ')
}

export async function copyToClipboard(
  text: string,
  message?: string
): Promise<boolean> {
  // Mock implementation - just return true
  return true
}

export function formatErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error
  }

  if (error instanceof SyntaxError) {
    return `구문 오류: ${error.message}`
  }

  if (error instanceof Error) {
    return error.message || '알 수 없는 오류가 발생했습니다'
  }

  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, any>
    if (errorObj.message) {
      return errorObj.message
    }
  }

  return '알 수 없는 오류가 발생했습니다'
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return function (...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
      timeoutId = null
    }, delay)
  }
}
