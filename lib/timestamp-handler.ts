/**
 * Timestamp 변환 로직
 * Unix Timestamp와 날짜 간의 상호 변환을 처리합니다.
 */

import {
  TimestampConversionData,
  TimestampConversionResult,
  ErrorResponse,
} from "./types"

import { format, formatDistance } from "date-fns"
import { formatInTimeZone } from "date-fns-tz"
import { ko } from "date-fns/locale"

/**
 * 지원 타임존 맵
 */
const TIMEZONE_MAP: Record<string, string> = {
  KST: "Asia/Seoul",
  UTC: "UTC",
  JST: "Asia/Tokyo",
  CST: "America/Chicago",
  EST: "America/New_York",
  PST: "America/Los_Angeles",
}

/**
 * 입력된 timestamp가 초 단위인지 밀리초 단위인지 자동 감지
 * @param input - 입력 문자열 또는 숫자
 * @returns 's' (초) 또는 'ms' (밀리초)
 */
export function detectTimestampUnit(input: string | number): "s" | "ms" {
  const num = typeof input === "string" ? parseInt(input, 10) : input

  if (isNaN(num)) {
    return "ms" // 기본값
  }

  // 밀리초는 13자리, 초는 10자리
  // 2000년 1월 1일(946684800) ~ 2100년 1월 1일(4102444800)
  if (num > 946684800 && num < 4102444800) {
    return "s"
  }

  return "ms"
}

/**
 * 타임존 오프셋 계산 (분 단위)
 * @param timezone - 타임존 약어 (예: KST, UTC)
 * @returns 오프셋 (분 단위, UTC 기준)
 */
export function getTimezoneOffset(timezone: string): number {
  const tz = TIMEZONE_MAP[timezone] || TIMEZONE_MAP.UTC

  if (tz === "UTC") {
    return 0
  }

  try {
    // UTC 기준 고정 시간 생성
    const date = new Date("2021-01-01T12:00:00.000Z")

    // 해당 타임존에서의 시간 문자열 생성
    const tzString = formatInTimeZone(date, tz, "yyyy-MM-dd'T'HH:mm:ss")
    const utcString = formatInTimeZone(date, "UTC", "yyyy-MM-dd'T'HH:mm:ss")

    // 문자열을 Date로 파싱 (타임존 정보 없이)
    const tzDate = new Date(tzString + "Z")
    const utcDate = new Date(utcString + "Z")

    // 시간 차이를 분 단위로 계산
    const diffMs = tzDate.getTime() - utcDate.getTime()
    return Math.round(diffMs / (1000 * 60))
  } catch {
    return 0
  }
}

/**
 * Date를 ISO 8601 형식으로 포맷
 * @param date - Date 객체
 * @returns ISO 8601 문자열
 */
export function formatToISO8601(date: Date): string {
  try {
    return date.toISOString()
  } catch {
    return ""
  }
}

/**
 * 상대 시간 표시 (예: "2시간 전", "3일 후")
 * @param date - Date 객체
 * @returns 상대 시간 문자열
 */
export function getRelativeTime(date: Date): string {
  try {
    const now = new Date()
    return formatDistance(date, now, { addSuffix: true, locale: ko })
  } catch {
    return ""
  }
}

/**
 * 요일 반환 (한글)
 * @param date - Date 객체
 * @returns 요일 문자열 (예: "월요일")
 */
export function getDayOfWeek(date: Date): string {
  try {
    return format(date, "EEEE", { locale: ko })
  } catch {
    return ""
  }
}

/**
 * 두 timestamp 간의 시간 차이 계산
 * @param ts1 - 첫 번째 timestamp (밀리초)
 * @param ts2 - 두 번째 timestamp (밀리초)
 * @returns 시간 차이 설명 문자열
 */
export function calculateTimeDifference(ts1: number, ts2: number): string {
  try {
    const diff = Math.abs(ts2 - ts1)
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days}일 ${hours % 24}시간`
    } else if (hours > 0) {
      return `${hours}시간 ${minutes % 60}분`
    } else if (minutes > 0) {
      return `${minutes}분 ${seconds % 60}초`
    } else {
      return `${seconds}초`
    }
  } catch {
    return "계산 실패"
  }
}

/**
 * Unix Timestamp를 날짜로 변환
 * @param timestamp - Unix timestamp (초 또는 밀리초)
 * @param timezone - 타임존 약어 (기본: KST)
 * @param unit - 단위 ('s' 또는 'ms', 자동 감지 가능)
 * @returns 변환 결과
 */
export function timestampToDate(
  timestamp: number,
  timezone: string = "KST",
  unit?: "s" | "ms"
): TimestampConversionResult {
  try {
    // 단위 자동 감지
    const detectedUnit = unit || detectTimestampUnit(timestamp)

    // 밀리초로 통일
    const msTimestamp = detectedUnit === "s" ? timestamp * 1000 : timestamp

    // 유효성 검증
    if (msTimestamp < 0 || msTimestamp > 4102444800000) {
      return {
        success: false,
        error: "유효하지 않은 timestamp",
        details: "timestamp는 1970-01-01 ~ 2100-01-01 범위여야 합니다",
      } as ErrorResponse
    }

    const date = new Date(msTimestamp)

    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      return {
        success: false,
        error: "날짜 변환 실패",
        details: "유효한 timestamp를 입력해주세요",
      } as ErrorResponse
    }

    // 타임존 처리
    const tz = TIMEZONE_MAP[timezone] || TIMEZONE_MAP.KST
    const utcTz = TIMEZONE_MAP.UTC

    // UTC 및 지정 타임존으로 포맷
    const utcFormatted = formatInTimeZone(date, utcTz, "yyyy-MM-dd HH:mm:ss")
    const kstFormatted = formatInTimeZone(date, TIMEZONE_MAP.KST, "yyyy-MM-dd HH:mm:ss")
    const iso8601 = formatToISO8601(date)
    const relativeTime = getRelativeTime(date)
    const dayOfWeek = getDayOfWeek(date)

    return {
      success: true,
      data: {
        type: "timestamp-to-date",
        input: timestamp,
        utc: utcFormatted,
        kst: kstFormatted,
        iso8601,
        relativeTime,
        dayOfWeek,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: "Timestamp 변환 중 오류 발생",
      details: error instanceof Error ? error.message : String(error),
    } as ErrorResponse
  }
}

/**
 * 날짜를 Unix Timestamp로 변환
 * @param date - Date 객체
 * @param timezone - 타임존 약어 (기본: KST)
 * @param unit - 출력 단위 ('s' 또는 'ms', 기본: ms)
 * @returns 변환 결과
 */
export function dateToTimestamp(
  date: Date,
  timezone: string = "KST",
  unit: "s" | "ms" = "ms"
): TimestampConversionResult {
  try {
    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      return {
        success: false,
        error: "유효하지 않은 날짜",
        details: "올바른 날짜를 입력해주세요",
      } as ErrorResponse
    }

    // Date 객체의 timestamp 가져오기 (이미 UTC 기준)
    const timestamp = date.getTime()

    // 단위 변환
    const finalTimestamp = unit === "s" ? Math.floor(timestamp / 1000) : timestamp

    // UTC 및 KST 포맷
    const utcFormatted = formatInTimeZone(date, TIMEZONE_MAP.UTC, "yyyy-MM-dd HH:mm:ss")
    const kstFormatted = formatInTimeZone(date, TIMEZONE_MAP.KST, "yyyy-MM-dd HH:mm:ss")
    const iso8601 = formatToISO8601(date)
    const relativeTime = getRelativeTime(date)
    const dayOfWeek = getDayOfWeek(date)

    return {
      success: true,
      data: {
        type: "date-to-timestamp",
        input: date.toISOString(),
        utc: utcFormatted,
        kst: kstFormatted,
        iso8601,
        relativeTime,
        dayOfWeek,
        timestamp: finalTimestamp,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: "날짜 변환 중 오류 발생",
      details: error instanceof Error ? error.message : String(error),
    } as ErrorResponse
  }
}

/**
 * 현재 시간을 다양한 형식으로 반환
 * @param timezone - 타임존 약어 (기본: KST)
 * @returns 현재 시간 정보
 */
export function getCurrentTime(timezone: string = "KST"): TimestampConversionResult {
  const now = new Date()
  return timestampToDate(now.getTime(), timezone, "ms")
}
