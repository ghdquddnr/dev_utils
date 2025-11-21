import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "sonner"

/**
 * Tailwind CSS 클래스 병합 유틸리티
 * Shadcn UI 컴포넌트와의 스타일 오버라이드를 위해 사용
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 텍스트를 클립보드에 복사하고 toast 알림을 표시합니다
 * @param text - 복사할 텍스트
 * @param message - 성공 메시지 (기본값: "복사되었습니다")
 * @returns 복사 성공 여부
 */
export async function copyToClipboard(
  text: string,
  message: string = "복사되었습니다"
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(message)
    return true
  } catch (error) {
    toast.error("클립보드 복사에 실패했습니다")
    console.error("Copy to clipboard error:", error)
    return false
  }
}

/**
 * 에러 메시지를 포맷팅하여 사용자 친화적 메시지로 변환
 * @param error - 에러 객체 또는 문자열
 * @returns 포맷팅된 에러 메시지
 */
export function formatErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error
  }

  if (error instanceof SyntaxError) {
    return `구문 오류: ${error.message}`
  }

  if (error instanceof Error) {
    return error.message || "알 수 없는 오류가 발생했습니다"
  }

  if (typeof error === "object" && error !== null) {
    // JSON 파싱 시 나타나는 상세 정보 추출
    const errorObj = error as Record<string, any>
    if (errorObj.message) {
      return errorObj.message
    }
  }

  return "알 수 없는 오류가 발생했습니다"
}

/**
 * 주어진 함수를 디바운스합니다
 * @param func - 디바운스할 함수
 * @param delay - 지연 시간 (밀리초)
 * @returns 디바운스된 함수
 */
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
