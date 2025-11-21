/**
 * Cron Expression 로직
 * Cron 표현식 생성, 파싱, 검증 및 다음 실행 시간 계산을 처리합니다.
 */

import {
  CronExpressionData,
  CronExpressionResult,
  ErrorResponse,
} from "./types"

import { CronExpressionParser } from "cron-parser"

/**
 * Cron 표현식 구성 인터페이스
 */
export interface CronConfig {
  minute?: string // 분 (0-59)
  hour?: string // 시 (0-23)
  dayOfMonth?: string // 일 (1-31)
  month?: string // 월 (1-12 또는 JAN-DEC)
  dayOfWeek?: string // 요일 (0-7 또는 SUN-SAT, 0과 7은 모두 일요일)
  second?: string // 초 (0-59, Quartz/Spring 형식)
}

/**
 * 사전 정의된 Cron 표현식 프리셋
 */
export const CRON_PRESETS: Record<
  string,
  { expression: string; description: string }
> = {
  everyMinute: { expression: "* * * * *", description: "매 분마다" },
  everyHour: { expression: "0 * * * *", description: "매 시간마다" },
  everyDay: { expression: "0 0 * * *", description: "매일 자정" },
  everyWeek: { expression: "0 0 * * 0", description: "매주 일요일 자정" },
  everyMonth: { expression: "0 0 1 * *", description: "매월 1일 자정" },
  workdays: {
    expression: "0 9 * * 1-5",
    description: "평일 오전 9시",
  },
  weekends: {
    expression: "0 10 * * 0,6",
    description: "주말 오전 10시",
  },
}

/**
 * GUI 선택값을 Cron 표현식으로 변환
 * @param config - Cron 구성 객체
 * @returns Cron 표현식 결과
 */
export function buildCronExpression(
  config: CronConfig
): CronExpressionResult {
  try {
    const {
      minute = "*",
      hour = "*",
      dayOfMonth = "*",
      month = "*",
      dayOfWeek = "*",
      second,
    } = config

    // Linux 형식 (5필드)
    let expression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`

    // Quartz/Spring 형식 (6필드+초)
    if (second !== undefined) {
      expression = `${second} ${expression}`
    }

    // 검증
    const validationResult = validateCronExpression(expression)
    if (!validationResult.success) {
      return validationResult
    }

    // 설명 생성
    const descriptionResult = describeCron(expression)
    let description = "사용자 정의 Cron 표현식"
    if (descriptionResult.success) {
      description = descriptionResult.data.description
    }

    return {
      success: true,
      data: {
        expression,
        description,
        isValid: true,
        type: second !== undefined ? "quartz" : "linux",
      },
    }
  } catch (error) {
    return {
      success: false,
      error: "Cron 표현식 생성 실패",
      details: error instanceof Error ? error.message : String(error),
    } as ErrorResponse
  }
}

/**
 * Cron 표현식 파싱
 * @param cronString - Cron 표현식 문자열
 * @returns 파싱된 Cron 정보
 */
export function parseCronExpression(
  cronString: string
): CronExpressionResult {
  try {
    const parts = cronString.trim().split(/\s+/)

    if (parts.length < 5 || parts.length > 6) {
      return {
        success: false,
        error: "Cron 형식 오류",
        details: "Cron 표현식은 5개(Linux) 또는 6개(Quartz) 필드여야 합니다",
      } as ErrorResponse
    }

    const type = parts.length === 6 ? "quartz" : "linux"
    const description = describeCron(cronString)

    return {
      success: true,
      data: {
        expression: cronString,
        description: description.success
          ? description.data.description
          : "Cron 표현식",
        isValid: true,
        type,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: "Cron 파싱 실패",
      details: error instanceof Error ? error.message : String(error),
    } as ErrorResponse
  }
}

/**
 * Cron 표현식을 한글 설명으로 변환
 * @param cronString - Cron 표현식 문자열
 * @returns Cron 설명 결과
 */
export function describeCron(cronString: string): CronExpressionResult {
  try {
    const parts = cronString.trim().split(/\s+/)
    if (parts.length < 5) {
      return {
        success: false,
        error: "유효하지 않은 Cron 형식",
      } as ErrorResponse
    }

    // 6필드(초 포함) vs 5필드(Linux)
    const hasSeconds = parts.length === 6
    const [sec, min, hour, day, month, dow] = hasSeconds
      ? parts
      : ["0", ...parts]

    const descriptions: string[] = []

    // 분 설명
    if (min === "*") {
      descriptions.push("매 분")
    } else if (min.includes("/")) {
      const interval = min.split("/")[1]
      descriptions.push(`${interval}분마다`)
    } else if (min.includes(",")) {
      descriptions.push(`${min}분에`)
    } else {
      descriptions.push(`${min}분에`)
    }

    // 시 설명
    if (hour !== "*") {
      if (hour.includes("/")) {
        const interval = hour.split("/")[1]
        descriptions.push(`${interval}시간마다`)
      } else if (hour.includes(",")) {
        descriptions.push(`${hour}시에`)
      } else {
        descriptions.push(`${hour}시`)
      }
    }

    // 일 설명
    if (day !== "*" && day !== "?") {
      if (day.includes("/")) {
        const interval = day.split("/")[1]
        descriptions.push(`${interval}일마다`)
      } else {
        descriptions.push(`${day}일`)
      }
    }

    // 월 설명
    if (month !== "*") {
      const monthNames: Record<string, string> = {
        "1": "1월",
        "2": "2월",
        "3": "3월",
        "4": "4월",
        "5": "5월",
        "6": "6월",
        "7": "7월",
        "8": "8월",
        "9": "9월",
        "10": "10월",
        "11": "11월",
        "12": "12월",
        JAN: "1월",
        FEB: "2월",
        MAR: "3월",
        APR: "4월",
        MAY: "5월",
        JUN: "6월",
        JUL: "7월",
        AUG: "8월",
        SEP: "9월",
        OCT: "10월",
        NOV: "11월",
        DEC: "12월",
      }
      const monthDesc = monthNames[month.toUpperCase()] || `${month}월`
      descriptions.push(monthDesc)
    }

    // 요일 설명
    if (dow !== "*" && dow !== "?") {
      const dayNames: Record<string, string> = {
        "0": "일요일",
        "1": "월요일",
        "2": "화요일",
        "3": "수요일",
        "4": "목요일",
        "5": "금요일",
        "6": "토요일",
        "7": "일요일",
        SUN: "일요일",
        MON: "월요일",
        TUE: "화요일",
        WED: "수요일",
        THU: "목요일",
        FRI: "금요일",
        SAT: "토요일",
      }

      if (dow.includes("-")) {
        const [start, end] = dow.split("-")
        const startDay = dayNames[start] || start
        const endDay = dayNames[end] || end
        descriptions.push(`${startDay} ~ ${endDay}`)
      } else if (dow.includes(",")) {
        const days = dow.split(",").map((d) => dayNames[d] || d)
        descriptions.push(days.join(", "))
      } else {
        const dayDesc = dayNames[dow] || dow
        descriptions.push(dayDesc)
      }
    }

    const fullDescription = descriptions.join(" ")

    return {
      success: true,
      data: {
        expression: cronString,
        description: fullDescription || "Cron 표현식",
        isValid: true,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: "Cron 설명 생성 실패",
      details: error instanceof Error ? error.message : String(error),
    } as ErrorResponse
  }
}

/**
 * 다음 N번의 실행 시간 계산
 * @param cronString - Cron 표현식 문자열
 * @param count - 계산할 실행 시간 개수
 * @param baseDate - 기준 날짜 (기본: 현재 시간)
 * @returns 실행 시간 목록
 */
export function getNextExecutionTimes(
  cronString: string,
  count: number = 10,
  baseDate?: Date
): CronExpressionResult {
  try {
    const parts = cronString.trim().split(/\s+/)

    // 5필드인 경우 맨 앞에 0(초)를 추가
    let expressionToParse = cronString
    if (parts.length === 5) {
      expressionToParse = "0 " + cronString
    }

    // Cron 파서 옵션 설정
    const options = {
      currentDate: baseDate || new Date(),
      tz: "Asia/Seoul", // KST 기준
    }

    // Cron 표현식 파싱
    const interval = CronExpressionParser.parse(expressionToParse, options)

    // 다음 실행 시간들 계산
    const executionTimes: string[] = []
    for (let i = 0; i < count; i++) {
      const nextDate = interval.next().toDate()
      executionTimes.push(nextDate.toISOString())
    }

    // 설명 생성
    const descriptionResult = describeCron(cronString)
    const description = descriptionResult.success
      ? descriptionResult.data.description
      : "Cron 표현식"

    return {
      success: true,
      data: {
        expression: cronString,
        description,
        nextExecutionTimes: executionTimes,
        isValid: true,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: "다음 실행 시간 계산 실패",
      details: error instanceof Error ? error.message : String(error),
    } as ErrorResponse
  }
}

/**
 * Cron 표현식 유효성 검증
 * @param cronString - Cron 표현식 문자열
 * @returns 검증 결과
 */
export function validateCronExpression(
  cronString: string
): CronExpressionResult {
  try {
    if (!cronString || cronString.trim() === "") {
      return {
        success: false,
        error: "Cron 표현식이 비어있습니다",
      } as ErrorResponse
    }

    const parts = cronString.trim().split(/\s+/)

    if (parts.length < 5 || parts.length > 7) {
      return {
        success: false,
        error: "유효하지 않은 Cron 형식",
        details: "Cron 표현식은 5-7개 필드여야 합니다",
      } as ErrorResponse
    }

    // cron-parser는 기본적으로 6필드를 기대하므로
    // 5필드인 경우 맨 앞에 0(초)를 추가
    let expressionToParse = cronString
    if (parts.length === 5) {
      expressionToParse = "0 " + cronString
    }

    // cron-parser로 검증
    CronExpressionParser.parse(expressionToParse, {
      tz: "Asia/Seoul",
    })

    return {
      success: true,
      data: {
        expression: cronString,
        description: "유효한 Cron 표현식",
        isValid: true,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: "유효하지 않은 Cron 표현식",
      details: error instanceof Error ? error.message : String(error),
    } as ErrorResponse
  }
}
