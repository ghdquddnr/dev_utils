/**
 * Timestamp 변환 로직 단위 테스트
 */

import {
  detectTimestampUnit,
  timestampToDate,
  dateToTimestamp,
  getTimezoneOffset,
  formatToISO8601,
  getRelativeTime,
  getDayOfWeek,
  calculateTimeDifference,
  getCurrentTime,
} from "./timestamp-handler"

describe("timestamp-handler", () => {
  describe("detectTimestampUnit", () => {
    test("10자리 숫자는 초 단위로 감지", () => {
      expect(detectTimestampUnit(1609459200)).toBe("s") // 2021-01-01 00:00:00 UTC
    })

    test("13자리 숫자는 밀리초 단위로 감지", () => {
      expect(detectTimestampUnit(1609459200000)).toBe("ms")
    })

    test("문자열 형태의 초 단위도 감지", () => {
      expect(detectTimestampUnit("1609459200")).toBe("s")
    })

    test("문자열 형태의 밀리초 단위도 감지", () => {
      expect(detectTimestampUnit("1609459200000")).toBe("ms")
    })

    test("유효하지 않은 입력은 밀리초를 기본값으로 반환", () => {
      expect(detectTimestampUnit("invalid")).toBe("ms")
    })

    test("매우 큰 숫자는 밀리초로 감지", () => {
      expect(detectTimestampUnit(5000000000000)).toBe("ms")
    })
  })

  describe("timestampToDate", () => {
    test("초 단위 timestamp를 날짜로 변환", () => {
      const result = timestampToDate(1609459200, "UTC", "s")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.utc).toContain("2021-01-01")
      }
    })

    test("밀리초 단위 timestamp를 날짜로 변환", () => {
      const result = timestampToDate(1609459200000, "UTC", "ms")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.utc).toContain("2021-01-01")
      }
    })

    test("자동 단위 감지 - 초", () => {
      const result = timestampToDate(1609459200, "UTC")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.utc).toContain("2021-01-01")
      }
    })

    test("자동 단위 감지 - 밀리초", () => {
      const result = timestampToDate(1609459200000, "UTC")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.utc).toContain("2021-01-01")
      }
    })

    test("KST 타임존 변환", () => {
      const result = timestampToDate(1609459200, "KST", "s")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.kst).toContain("2021-01-01")
      }
    })

    test("ISO 8601 형식 출력 포함", () => {
      const result = timestampToDate(1609459200000, "UTC", "ms")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.iso8601).toMatch(/^\d{4}-\d{2}-\d{2}T/)
      }
    })

    test("상대 시간 표시 포함", () => {
      const result = timestampToDate(1609459200000, "UTC", "ms")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.relativeTime).toBeTruthy()
      }
    })

    test("요일 정보 포함", () => {
      const result = timestampToDate(1609459200000, "UTC", "ms")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.dayOfWeek).toBeTruthy()
      }
    })

    test("음수 timestamp는 에러 반환", () => {
      const result = timestampToDate(-1000, "UTC", "s")
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("유효하지 않은 timestamp")
      }
    })

    test("범위를 벗어난 timestamp는 에러 반환", () => {
      const result = timestampToDate(5000000000, "UTC", "s")
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("유효하지 않은 timestamp")
      }
    })

    test("JST 타임존 변환", () => {
      const result = timestampToDate(1609459200, "JST", "s")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.type).toBe("timestamp-to-date")
      }
    })

    test("EST 타임존 변환", () => {
      const result = timestampToDate(1609459200, "EST", "s")
      expect(result.success).toBe(true)
    })
  })

  describe("dateToTimestamp", () => {
    test("Date 객체를 밀리초 단위 timestamp로 변환", () => {
      const date = new Date("2021-01-01T00:00:00.000Z")
      const result = dateToTimestamp(date, "UTC", "ms")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.timestamp).toBe(1609459200000)
      }
    })

    test("Date 객체를 초 단위 timestamp로 변환", () => {
      const date = new Date("2021-01-01T00:00:00.000Z")
      const result = dateToTimestamp(date, "UTC", "s")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.timestamp).toBe(1609459200)
      }
    })

    test("KST 타임존 처리", () => {
      const date = new Date("2021-01-01T00:00:00.000Z")
      const result = dateToTimestamp(date, "KST", "ms")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.type).toBe("date-to-timestamp")
      }
    })

    test("UTC 및 KST 포맷 정보 포함", () => {
      const date = new Date("2021-01-01T00:00:00.000Z")
      const result = dateToTimestamp(date, "UTC", "ms")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.utc).toBeTruthy()
        expect(result.data.kst).toBeTruthy()
      }
    })

    test("ISO 8601 및 상대 시간 포함", () => {
      const date = new Date("2021-01-01T00:00:00.000Z")
      const result = dateToTimestamp(date, "UTC", "ms")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.iso8601).toBeTruthy()
        expect(result.data.relativeTime).toBeTruthy()
      }
    })

    test("요일 정보 포함", () => {
      const date = new Date("2021-01-01T00:00:00.000Z")
      const result = dateToTimestamp(date, "UTC", "ms")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.dayOfWeek).toBeTruthy()
      }
    })

    test("유효하지 않은 Date는 에러 반환", () => {
      const invalidDate = new Date("invalid")
      const result = dateToTimestamp(invalidDate, "UTC", "ms")
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("유효하지 않은 날짜")
      }
    })

    test("PST 타임존 처리", () => {
      const date = new Date("2021-01-01T00:00:00.000Z")
      const result = dateToTimestamp(date, "PST", "s")
      expect(result.success).toBe(true)
    })
  })

  describe("getTimezoneOffset", () => {
    test("UTC 타임존 오프셋은 0", () => {
      const offset = getTimezoneOffset("UTC")
      expect(offset).toBe(0)
    })

    test("존재하지 않는 타임존은 UTC로 처리", () => {
      const offset = getTimezoneOffset("INVALID")
      expect(offset).toBe(0)
    })

    test("KST 타임존 오프셋 계산", () => {
      const offset = getTimezoneOffset("KST")
      expect(typeof offset).toBe("number")
    })
  })

  describe("formatToISO8601", () => {
    test("Date를 ISO 8601 형식으로 변환", () => {
      const date = new Date("2021-01-01T00:00:00.000Z")
      const iso = formatToISO8601(date)
      expect(iso).toBe("2021-01-01T00:00:00.000Z")
    })

    test("유효하지 않은 Date는 빈 문자열 반환", () => {
      const invalidDate = new Date("invalid")
      const iso = formatToISO8601(invalidDate)
      expect(iso).toBe("")
    })
  })

  describe("getRelativeTime", () => {
    test("과거 시간은 '전' 형식으로 표시", () => {
      const pastDate = new Date(Date.now() - 3600000) // 1시간 전
      const relative = getRelativeTime(pastDate)
      expect(relative).toContain("전")
    })

    test("미래 시간은 '후' 형식으로 표시", () => {
      const futureDate = new Date(Date.now() + 3600000) // 1시간 후
      const relative = getRelativeTime(futureDate)
      expect(relative).toContain("후")
    })

    test("유효하지 않은 Date는 빈 문자열 반환", () => {
      const invalidDate = new Date("invalid")
      const relative = getRelativeTime(invalidDate)
      expect(relative).toBe("")
    })
  })

  describe("getDayOfWeek", () => {
    test("2021-01-01은 금요일", () => {
      const date = new Date("2021-01-01T00:00:00.000Z")
      const day = getDayOfWeek(date)
      expect(day).toBe("금요일")
    })

    test("유효하지 않은 Date는 빈 문자열 반환", () => {
      const invalidDate = new Date("invalid")
      const day = getDayOfWeek(invalidDate)
      expect(day).toBe("")
    })
  })

  describe("calculateTimeDifference", () => {
    test("1시간 차이 계산", () => {
      const ts1 = 1609459200000
      const ts2 = 1609462800000 // 1시간 후
      const diff = calculateTimeDifference(ts1, ts2)
      expect(diff).toContain("1시간")
    })

    test("1일 차이 계산", () => {
      const ts1 = 1609459200000
      const ts2 = 1609545600000 // 1일 후
      const diff = calculateTimeDifference(ts1, ts2)
      expect(diff).toContain("일")
    })

    test("1분 차이 계산", () => {
      const ts1 = 1609459200000
      const ts2 = 1609459260000 // 1분 후
      const diff = calculateTimeDifference(ts1, ts2)
      expect(diff).toContain("1분")
    })

    test("순서가 바뀌어도 절댓값으로 계산", () => {
      const ts1 = 1609462800000
      const ts2 = 1609459200000
      const diff = calculateTimeDifference(ts1, ts2)
      expect(diff).toContain("1시간")
    })

    test("0초 차이", () => {
      const ts = 1609459200000
      const diff = calculateTimeDifference(ts, ts)
      expect(diff).toBe("0초")
    })
  })

  describe("getCurrentTime", () => {
    test("현재 시간 조회 성공", () => {
      const result = getCurrentTime("UTC")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.type).toBe("timestamp-to-date")
      }
    })

    test("KST 타임존으로 현재 시간 조회", () => {
      const result = getCurrentTime("KST")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.kst).toBeTruthy()
        expect(result.data.utc).toBeTruthy()
      }
    })
  })

  describe("엣지 케이스 및 추가 테스트", () => {
    test("2000년 1월 1일 timestamp 변환", () => {
      const result = timestampToDate(946684800, "UTC", "s")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.utc).toContain("2000-01-01")
      }
    })

    test("2050년 timestamp 변환", () => {
      const result = timestampToDate(2524608000, "UTC", "s")
      expect(result.success).toBe(true)
    })

    test("CST 타임존 변환", () => {
      const result = timestampToDate(1609459200, "CST", "s")
      expect(result.success).toBe(true)
    })

    test("복잡한 시간 차이 계산 - 2일 5시간", () => {
      const ts1 = 1609459200000
      const ts2 = 1609664400000 // 약 2.3일 후
      const diff = calculateTimeDifference(ts1, ts2)
      expect(diff).toContain("일")
    })

    test("밀리초 단위 timestamp에서 요일 확인", () => {
      const result = timestampToDate(1609459200000, "UTC", "ms")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.dayOfWeek).toBe("금요일")
      }
    })
  })
})
