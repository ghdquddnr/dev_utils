/**
 * SQL Parameter Binding 로직
 * PreparedStatement SQL(?)과 파라미터를 입력받아 완전한 SQL로 변환합니다.
 */

import { SqlBindingResult, SqlBindingData, SqlParameterType, SqlValidationResult, ErrorResponse } from "./types"

/**
 * PreparedStatement SQL과 파라미터를 바인딩합니다.
 * @param query - ? 자리표시자가 있는 SQL 쿼리
 * @param parametersJson - JSON 배열 형식의 파라미터 (예: [123, 'admin'])
 * @returns 바인딩된 SQL 또는 에러
 */
export function bindSqlParameters(
  query: string,
  parametersJson: string
): SqlBindingResult {
  if (!query || query.trim() === "") {
    return {
      success: false,
      error: "SQL 쿼리가 비어있습니다",
      details: "SQL 쿼리를 입력해주세요",
    } as ErrorResponse
  }

  if (!parametersJson || parametersJson.trim() === "") {
    return {
      success: false,
      error: "파라미터가 비어있습니다",
      details: "파라미터를 JSON 배열 형식으로 입력해주세요 (예: [123, 'admin'])",
    } as ErrorResponse
  }

  // 파라미터 JSON 파싱
  let parameters: SqlParameterType[]
  try {
    const parsed = JSON.parse(parametersJson)
    if (!Array.isArray(parsed)) {
      return {
        success: false,
        error: "파라미터 형식 오류",
        details: "파라미터는 배열 형식이어야 합니다 (예: [값1, 값2, ...])",
      } as ErrorResponse
    }
    parameters = parsed
  } catch (error) {
    return {
      success: false,
      error: "JSON 파싱 오류",
      details: "파라미터가 유효한 JSON 배열이 아닙니다",
    } as ErrorResponse
  }

  // 파라미터 개수와 ? 개수 검증
  const placeholderCount = (query.match(/\?/g) || []).length
  if (parameters.length !== placeholderCount) {
    return {
      success: false,
      error: "파라미터 개수 불일치",
      details: `? 자리표시자가 ${placeholderCount}개이지만, 파라미터는 ${parameters.length}개입니다`,
    } as ErrorResponse
  }

  // SQL 바인딩
  try {
    const boundQuery = bindParameters(query, parameters)

    return {
      success: true,
      data: {
        boundQuery,
        original: query,
        parameterCount: parameters.length,
        placeholderCount,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: "SQL 바인딩 중 오류 발생",
      details: error instanceof Error ? error.message : String(error),
    } as ErrorResponse
  }
}

/**
 * SQL 쿼리의 파라미터 개수를 검증합니다.
 * @param query - SQL 쿼리
 * @param parameters - 파라미터 배열
 * @returns 검증 결과
 */
export function validateSqlBinding(
  query: string,
  parameters: SqlParameterType[]
): SqlValidationResult {
  const placeholderCount = (query.match(/\?/g) || []).length
  const parameterCount = parameters.length

  const isValid = placeholderCount === parameterCount

  return {
    isValid,
    parameterCount,
    placeholderCount,
    message: isValid
      ? "파라미터 개수가 일치합니다"
      : `파라미터 개수 불일치: ? ${placeholderCount}개, 파라미터 ${parameterCount}개`,
  }
}

/**
 * SQL 쿼리에 파라미터를 바인딩합니다.
 * @param query - SQL 쿼리
 * @param parameters - 파라미터 배열
 * @returns 바인딩된 SQL
 */
function bindParameters(query: string, parameters: SqlParameterType[]): string {
  let result = query
  let paramIndex = 0

  // ? 자리를 순서대로 파라미터로 치환
  result = result.replace(/\?/g, () => {
    if (paramIndex >= parameters.length) {
      throw new Error("파라미터 개수 부족")
    }

    const param = parameters[paramIndex++]
    return formatParameterValue(param)
  })

  return result
}

/**
 * 파라미터 값을 SQL에 적합한 형식으로 포맷팅합니다.
 * @param param - 파라미터 값
 * @returns 포맷팅된 SQL 값
 */
function formatParameterValue(param: SqlParameterType): string {
  if (param === null || param === undefined) {
    return "NULL"
  }

  if (typeof param === "string") {
    // 문자열: 작은따옴표로 감싸고 내부의 따옴표 이스케이프
    const escaped = param.replace(/'/g, "''")
    return `'${escaped}'`
  }

  if (typeof param === "boolean") {
    // 부울값: true/false 또는 1/0
    return param ? "1" : "0"
  }

  // 숫자: 그대로 사용
  return String(param)
}

/**
 * SQL 쿼리에서 ? 개수를 센다.
 * @param query - SQL 쿼리
 * @returns ? 개수
 */
export function countPlaceholders(query: string): number {
  if (!query) {
    return 0
  }

  // ? 개수 카운트 (문자열 내의 ?는 제외해야 하지만 간단한 구현)
  return (query.match(/\?/g) || []).length
}

/**
 * SQL 쿼리 예시를 생성합니다.
 * @returns SQL 예시 객체
 */
export function getSqlExamples(): {
  query: string
  parameters: string
}[] {
  return [
    {
      query: "SELECT * FROM users WHERE id = ?",
      parameters: "[123]",
    },
    {
      query: "INSERT INTO users (name, email, age) VALUES (?, ?, ?)",
      parameters: "['John Doe', 'john@example.com', 30]",
    },
    {
      query: "UPDATE users SET name = ?, status = ? WHERE id = ?",
      parameters: "['Jane Doe', 'active', 456]",
    },
    {
      query: "DELETE FROM users WHERE name = ? AND age > ?",
      parameters: "['Old User', 100]",
    },
    {
      query: "SELECT * FROM orders WHERE status IN (?, ?) AND total > ?",
      parameters: "['pending', 'processing', 1000]",
    },
  ]
}
