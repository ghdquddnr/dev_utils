/**
 * JSON Formatter & Validator 로직
 * JSON 문자열을 파싱, 포맷팅, 검증하는 함수들을 제공합니다.
 */

import { JsonFormatterResult, JsonFormatterData, ErrorResponse } from "./types"

/**
 * JSON 문자열을 파싱하고 포맷팅합니다.
 * @param input - 포맷팅할 JSON 문자열
 * @param indent - 들여쓰기 스페이스 수 (기본값: 2)
 * @returns 포맷팅된 JSON 또는 에러
 */
export function formatJson(
  input: string,
  indent: number = 2
): JsonFormatterResult {
  if (!input || input.trim() === "") {
    return {
      success: false,
      error: "JSON 입력이 비어있습니다",
      details: "비어있지 않은 JSON 문자열을 입력해주세요",
    } as ErrorResponse
  }

  try {
    // JSON 파싱으로 유효성 검증
    const parsed = JSON.parse(input)

    // 포맷팅 (들여쓰기 적용)
    const formatted = JSON.stringify(parsed, null, indent)

    return {
      success: true,
      data: {
        formatted,
        original: input,
        isValid: true,
      },
    }
  } catch (error) {
    return handleJsonError(error, input)
  }
}

/**
 * JSON 문자열이 유효한지 검증합니다.
 * @param input - 검증할 JSON 문자열
 * @returns 검증 결과
 */
export function validateJson(input: string): JsonFormatterResult {
  if (!input || input.trim() === "") {
    return {
      success: false,
      error: "JSON 입력이 비어있습니다",
      details: "비어있지 않은 JSON 문자열을 입력해주세요",
    } as ErrorResponse
  }

  try {
    JSON.parse(input)

    return {
      success: true,
      data: {
        formatted: input,
        original: input,
        isValid: true,
      },
    }
  } catch (error) {
    return handleJsonError(error, input)
  }
}

/**
 * JSON 문자열을 축소 형식(Minify)으로 변환합니다.
 * @param input - 축소할 JSON 문자열
 * @returns 축소된 JSON 또는 에러
 */
export function minifyJson(input: string): JsonFormatterResult {
  if (!input || input.trim() === "") {
    return {
      success: false,
      error: "JSON 입력이 비어있습니다",
      details: "비어있지 않은 JSON 문자열을 입력해주세요",
    } as ErrorResponse
  }

  try {
    const parsed = JSON.parse(input)
    const minified = JSON.stringify(parsed)

    return {
      success: true,
      data: {
        formatted: minified,
        original: input,
        isValid: true,
      },
    }
  } catch (error) {
    return handleJsonError(error, input)
  }
}

/**
 * 두 JSON 문자열을 비교합니다.
 * @param json1 - 첫 번째 JSON 문자열
 * @param json2 - 두 번째 JSON 문자열
 * @returns 객체 비교 결과
 */
export function compareJson(
  json1: string,
  json2: string
): {
  success: boolean
  isEqual: boolean
  differences?: string[]
  error?: string
} {
  try {
    const obj1 = JSON.parse(json1)
    const obj2 = JSON.parse(json2)

    const isEqual = JSON.stringify(obj1) === JSON.stringify(obj2)

    if (!isEqual) {
      // 간단한 차이점 분석
      const differences = findDifferences(obj1, obj2, "")
      return {
        success: true,
        isEqual: false,
        differences,
      }
    }

    return {
      success: true,
      isEqual: true,
    }
  } catch (error) {
    return {
      success: false,
      isEqual: false,
      error: formatErrorMessage(error),
    }
  }
}

/**
 * JSON 에러를 처리하고 사용자 친화적 메시지를 생성합니다.
 * @param error - 발생한 에러
 * @param input - 원본 JSON 입력
 * @returns 포맷팅된 에러 응답
 */
function handleJsonError(error: unknown, input: string): ErrorResponse {
  if (error instanceof SyntaxError) {
    const message = error.message
    const match = message.match(/position (\d+)/)

    if (match) {
      const position = parseInt(match[1], 10)
      const lines = input.substring(0, position).split("\n")
      const line = lines.length
      const column = lines[lines.length - 1].length + 1

      return {
        success: false,
        error: "JSON 구문 오류",
        details: `${message} (Line ${line}, Column ${column})`,
        line,
        column,
      }
    }

    return {
      success: false,
      error: "JSON 구문 오류",
      details: message,
    }
  }

  return {
    success: false,
    error: "JSON 처리 중 오류가 발생했습니다",
    details: error instanceof Error ? error.message : String(error),
  }
}

/**
 * 두 객체의 차이점을 찾습니다.
 * @param obj1 - 첫 번째 객체
 * @param obj2 - 두 번째 객체
 * @param path - 현재 경로
 * @returns 차이점 배열
 */
function findDifferences(
  obj1: any,
  obj2: any,
  path: string
): string[] {
  const differences: string[] = []

  // 키 비교
  const keys1 = Object.keys(obj1 || {})
  const keys2 = Object.keys(obj2 || {})
  const allKeys = new Set([...keys1, ...keys2])

  allKeys.forEach((key) => {
    const currentPath = path ? `${path}.${key}` : key
    const val1 = obj1?.[key]
    const val2 = obj2?.[key]

    if (!(key in (obj1 || {}))) {
      differences.push(`Missing in object 1: ${currentPath}`)
    } else if (!(key in (obj2 || {}))) {
      differences.push(`Missing in object 2: ${currentPath}`)
    } else if (typeof val1 === "object" && typeof val2 === "object") {
      differences.push(
        ...findDifferences(val1, val2, currentPath)
      )
    } else if (val1 !== val2) {
      differences.push(
        `${currentPath}: "${val1}" != "${val2}"`
      )
    }
  })

  return differences
}

/**
 * 에러를 포맷팅하여 문자열로 변환합니다.
 * @param error - 에러 객체
 * @returns 포맷팅된 에러 메시지
 */
function formatErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error
  }

  if (error instanceof Error) {
    return error.message
  }

  return "알 수 없는 오류가 발생했습니다"
}
