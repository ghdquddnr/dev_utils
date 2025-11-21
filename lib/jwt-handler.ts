/**
 * JWT Decoder (오프라인 모드)
 * JWT 토큰을 파싱하고 Header, Payload, Signature를 분리합니다.
 * 서명 검증은 수행하지 않습니다 (클라이언트 사이드 한계).
 */

import { JwtDecodeResult, JwtHeader, JwtPayload, JwtDecodeData, ErrorResponse } from "./types"

/**
 * JWT 토큰을 디코딩합니다.
 * @param token - JWT 토큰
 * @returns 디코딩된 데이터 또는 에러
 */
export function decodeJwt(token: string): JwtDecodeResult {
  if (!token || token.trim() === "") {
    return {
      success: false,
      error: "JWT 토큰이 비어있습니다",
      details: "유효한 JWT 토큰을 입력해주세요",
    } as ErrorResponse
  }

  try {
    // JWT 형식 검증 (3부분으로 나뉘어야 함)
    const parts = token.trim().split(".")
    if (parts.length !== 3) {
      return {
        success: false,
        error: "유효하지 않은 JWT 형식입니다",
        details: `JWT는 세 부분으로 나뉘어야 합니다 (header.payload.signature). 현재: ${parts.length}부분`,
      } as ErrorResponse
    }

    const [headerB64, payloadB64, signature] = parts

    // Base64URL 디코딩
    let headerStr: string
    let payloadStr: string

    try {
      headerStr = base64UrlDecode(headerB64)
      payloadStr = base64UrlDecode(payloadB64)
    } catch (error) {
      return {
        success: false,
        error: "Base64 디코딩 실패",
        details: "JWT의 Header 또는 Payload가 올바른 Base64 형식이 아닙니다",
      } as ErrorResponse
    }

    // JSON 파싱
    let header: JwtHeader
    let payload: JwtPayload

    try {
      header = JSON.parse(headerStr)
    } catch (error) {
      return {
        success: false,
        error: "Header 파싱 실패",
        details: "Header가 유효한 JSON이 아닙니다",
      } as ErrorResponse
    }

    try {
      payload = JSON.parse(payloadStr)
    } catch (error) {
      return {
        success: false,
        error: "Payload 파싱 실패",
        details: "Payload가 유효한 JSON이 아닙니다",
      } as ErrorResponse
    }

    return {
      success: true,
      data: {
        header,
        payload,
        signature,
        isValid: true,
        message: "JWT가 성공적으로 디코딩되었습니다",
      },
    }
  } catch (error) {
    return {
      success: false,
      error: "JWT 디코딩 중 오류 발생",
      details: error instanceof Error ? error.message : String(error),
    } as ErrorResponse
  }
}

/**
 * JWT 토큰의 형식이 유효한지 검증합니다.
 * @param token - JWT 토큰
 * @returns 유효성 검증 결과
 */
export function validateJwtFormat(token: string): boolean {
  if (!token || token.trim() === "") {
    return false
  }

  const parts = token.trim().split(".")
  if (parts.length !== 3) {
    return false
  }

  // 각 부분이 Base64URL 형식인지 대략적으로 확인
  const base64UrlRegex = /^[A-Za-z0-9_-]*$/
  return parts.every((part) => base64UrlRegex.test(part))
}

/**
 * Payload에서 만료 시간을 읽기 쉬운 형식으로 변환합니다.
 * @param payload - JWT Payload
 * @returns 만료 시간 문자열
 */
export function getExpirationTime(payload: JwtPayload): string | null {
  if (!payload.exp) {
    return null
  }

  try {
    const expDate = new Date(payload.exp * 1000) // exp는 초 단위
    return expDate.toLocaleString()
  } catch (error) {
    return null
  }
}

/**
 * Payload에서 발급 시간을 읽기 쉬운 형식으로 변환합니다.
 * @param payload - JWT Payload
 * @returns 발급 시간 문자열
 */
export function getIssuedAtTime(payload: JwtPayload): string | null {
  if (!payload.iat) {
    return null
  }

  try {
    const iatDate = new Date(payload.iat * 1000) // iat는 초 단위
    return iatDate.toLocaleString()
  } catch (error) {
    return null
  }
}

/**
 * JWT의 만료 여부를 확인합니다.
 * @param payload - JWT Payload
 * @returns 만료되었으면 true
 */
export function isTokenExpired(payload: JwtPayload): boolean {
  if (!payload.exp) {
    return false
  }

  const now = Math.floor(Date.now() / 1000)
  return now > payload.exp
}

/**
 * Base64URL 형식을 표준 Base64로 변환 후 디코딩합니다.
 * @param base64Url - Base64URL 인코딩된 문자열
 * @returns 디코딩된 문자열
 */
function base64UrlDecode(base64Url: string): string {
  // Base64URL을 표준 Base64로 변환
  const base64 = base64Url
    .replace(/-/g, "+")
    .replace(/_/g, "/")

  // 패딩 추가 (필요한 경우)
  const paddingLength = 4 - (base64.length % 4)
  const padded = paddingLength === 4 ? base64 : base64 + "=".repeat(paddingLength)

  try {
    // atob를 사용하여 Base64 디코딩
    const decoded = atob(padded)
    // UTF-8 디코딩
    return decodeURIComponent(
      decoded
        .split("")
        .map((char) => "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
  } catch (error) {
    throw new Error("Base64 디코딩 실패")
  }
}

/**
 * JWT 토큰에 대한 정보를 제공합니다.
 * @param token - JWT 토큰
 * @returns 토큰 정보
 */
export function getJwtInfo(token: string): {
  isValid: boolean
  message: string
  expiresAt?: string
  isExpired?: boolean
} {
  if (!validateJwtFormat(token)) {
    return {
      isValid: false,
      message: "유효하지 않은 JWT 형식입니다",
    }
  }

  const result = decodeJwt(token)
  if (!result.success) {
    return {
      isValid: false,
      message: result.error,
    }
  }

  const { payload } = result.data
  const isExpired = isTokenExpired(payload)
  const expiresAt = getExpirationTime(payload)

  return {
    isValid: true,
    message: isExpired ? "이 토큰은 만료되었습니다" : "유효한 JWT입니다",
    expiresAt: expiresAt || undefined,
    isExpired,
  }
}
