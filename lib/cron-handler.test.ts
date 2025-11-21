/**
 * Cron Expression 로직 단위 테스트
 */

import {
  buildCronExpression,
  parseCronExpression,
  describeCron,
  getNextExecutionTimes,
  validateCronExpression,
  CRON_PRESETS,
  CronConfig,
} from "./cron-handler"

describe("cron-handler", () => {
  describe("buildCronExpression", () => {
    test("기본 Cron 표현식 생성 (모든 필드 *)", () => {
      const config: CronConfig = {}
      const result = buildCronExpression(config)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.expression).toBe("* * * * *")
        expect(result.data.type).toBe("linux")
      }
    })

    test("매 시간 실행 (0분)", () => {
      const config: CronConfig = { minute: "0" }
      const result = buildCronExpression(config)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.expression).toBe("0 * * * *")
      }
    })

    test("매일 자정 실행", () => {
      const config: CronConfig = { minute: "0", hour: "0" }
      const result = buildCronExpression(config)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.expression).toBe("0 0 * * *")
      }
    })

    test("평일 오전 9시 실행", () => {
      const config: CronConfig = {
        minute: "0",
        hour: "9",
        dayOfWeek: "1-5",
      }
      const result = buildCronExpression(config)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.expression).toBe("0 9 * * 1-5")
      }
    })

    test("매월 1일 자정 실행", () => {
      const config: CronConfig = {
        minute: "0",
        hour: "0",
        dayOfMonth: "1",
      }
      const result = buildCronExpression(config)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.expression).toBe("0 0 1 * *")
      }
    })

    test("Quartz 형식 (6필드+초)", () => {
      const config: CronConfig = {
        second: "0",
        minute: "0",
        hour: "12",
      }
      const result = buildCronExpression(config)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.expression).toBe("0 0 12 * * *")
        expect(result.data.type).toBe("quartz")
      }
    })

    test("복잡한 Cron 표현식 생성", () => {
      const config: CronConfig = {
        minute: "*/15",
        hour: "9-17",
        dayOfWeek: "1-5",
      }
      const result = buildCronExpression(config)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.expression).toBe("*/15 9-17 * * 1-5")
      }
    })

    test("설명이 포함된 결과", () => {
      const config: CronConfig = { minute: "0", hour: "0" }
      const result = buildCronExpression(config)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toBeTruthy()
        expect(result.data.isValid).toBe(true)
      }
    })
  })

  describe("parseCronExpression", () => {
    test("Linux 형식 (5필드) 파싱", () => {
      const result = parseCronExpression("0 0 * * *")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.expression).toBe("0 0 * * *")
        expect(result.data.type).toBe("linux")
      }
    })

    test("Quartz 형식 (6필드) 파싱", () => {
      const result = parseCronExpression("0 0 12 * * *")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.expression).toBe("0 0 12 * * *")
        expect(result.data.type).toBe("quartz")
      }
    })

    test("필드가 부족한 경우 에러", () => {
      const result = parseCronExpression("0 0 *")
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("Cron 형식 오류")
      }
    })

    test("필드가 초과된 경우 에러", () => {
      const result = parseCronExpression("0 0 0 * * * *")
      expect(result.success).toBe(false)
    })

    test("파싱 결과에 설명 포함", () => {
      const result = parseCronExpression("0 9 * * 1-5")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toBeTruthy()
      }
    })
  })

  describe("describeCron", () => {
    test("매 분 실행 설명", () => {
      const result = describeCron("* * * * *")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toContain("매 분")
      }
    })

    test("매 시간 실행 설명", () => {
      const result = describeCron("0 * * * *")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toContain("0분")
      }
    })

    test("매일 자정 실행 설명", () => {
      const result = describeCron("0 0 * * *")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toContain("0분")
        expect(result.data.description).toContain("0시")
      }
    })

    test("평일 오전 9시 설명", () => {
      const result = describeCron("0 9 * * 1-5")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toContain("9시")
        expect(result.data.description).toContain("월요일")
        expect(result.data.description).toContain("금요일")
      }
    })

    test("매월 1일 자정 설명", () => {
      const result = describeCron("0 0 1 * *")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toContain("1일")
      }
    })

    test("특정 요일 설명", () => {
      const result = describeCron("0 10 * * 0,6")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toContain("일요일")
        expect(result.data.description).toContain("토요일")
      }
    })

    test("월 이름 처리", () => {
      const result = describeCron("0 0 1 JAN *")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toContain("1월")
      }
    })

    test("유효하지 않은 Cron 표현식", () => {
      const result = describeCron("invalid")
      expect(result.success).toBe(false)
    })
  })

  describe("getNextExecutionTimes", () => {
    test("다음 10번 실행 시간 계산", () => {
      const result = getNextExecutionTimes("0 * * * *", 10)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.nextExecutionTimes).toHaveLength(10)
      }
    })

    test("매 분 실행 시간", () => {
      const result = getNextExecutionTimes("* * * * *", 5)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.nextExecutionTimes).toHaveLength(5)
      }
    })

    test("특정 기준 날짜부터 계산", () => {
      const baseDate = new Date("2021-01-01T00:00:00Z")
      const result = getNextExecutionTimes("0 0 * * *", 3, baseDate)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.nextExecutionTimes).toHaveLength(3)
      }
    })

    test("평일만 실행되는 Cron", () => {
      const result = getNextExecutionTimes("0 9 * * 1-5", 7)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.nextExecutionTimes).toHaveLength(7)
      }
    })

    test("실행 시간이 ISO 8601 형식", () => {
      const result = getNextExecutionTimes("0 0 * * *", 1)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.nextExecutionTimes![0]).toMatch(/^\d{4}-\d{2}-\d{2}T/)
      }
    })

    test("유효하지 않은 Cron 표현식은 에러", () => {
      const result = getNextExecutionTimes("invalid", 10)
      expect(result.success).toBe(false)
    })

    test("설명이 포함된 결과", () => {
      const result = getNextExecutionTimes("0 0 * * *", 5)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toBeTruthy()
      }
    })
  })

  describe("validateCronExpression", () => {
    test("유효한 Linux 형식", () => {
      const result = validateCronExpression("0 0 * * *")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isValid).toBe(true)
      }
    })

    test("유효한 Quartz 형식", () => {
      const result = validateCronExpression("0 0 12 * * *")
      expect(result.success).toBe(true)
    })

    test("빈 문자열은 에러", () => {
      const result = validateCronExpression("")
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("비어있습니다")
      }
    })

    test("필드가 부족한 경우 에러", () => {
      const result = validateCronExpression("0 0")
      expect(result.success).toBe(false)
    })

    test("유효하지 않은 값", () => {
      const result = validateCronExpression("60 * * * *")
      expect(result.success).toBe(false)
    })

    test("복잡한 유효한 표현식", () => {
      const result = validateCronExpression("*/15 9-17 * * 1-5")
      expect(result.success).toBe(true)
    })
  })

  describe("CRON_PRESETS", () => {
    test("매 분 프리셋", () => {
      const preset = CRON_PRESETS.everyMinute
      expect(preset.expression).toBe("* * * * *")
      expect(preset.description).toBe("매 분마다")
    })

    test("매 시간 프리셋", () => {
      const preset = CRON_PRESETS.everyHour
      expect(preset.expression).toBe("0 * * * *")
      expect(validateCronExpression(preset.expression).success).toBe(true)
    })

    test("매일 자정 프리셋", () => {
      const preset = CRON_PRESETS.everyDay
      expect(preset.expression).toBe("0 0 * * *")
    })

    test("평일 프리셋", () => {
      const preset = CRON_PRESETS.workdays
      expect(preset.expression).toBe("0 9 * * 1-5")
    })

    test("모든 프리셋이 유효한 Cron 표현식", () => {
      Object.values(CRON_PRESETS).forEach((preset) => {
        const result = validateCronExpression(preset.expression)
        expect(result.success).toBe(true)
      })
    })
  })

  describe("엣지 케이스 및 통합 테스트", () => {
    test("매월 마지막 날 실행", () => {
      const result = describeCron("0 0 28-31 * *")
      expect(result.success).toBe(true)
    })

    test("5분마다 실행", () => {
      const result = getNextExecutionTimes("*/5 * * * *", 3)
      expect(result.success).toBe(true)
    })

    test("특정 월의 특정 일 실행", () => {
      const result = describeCron("0 0 15 1,6 *")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toContain("15일")
      }
    })

    test("매주 특정 요일 실행", () => {
      const result = getNextExecutionTimes("0 0 * * 3", 4)
      expect(result.success).toBe(true)
    })

    test("Cron 생성 → 검증 → 다음 실행 시간 계산 통합", () => {
      const buildResult = buildCronExpression({
        minute: "0",
        hour: "9",
        dayOfWeek: "1-5",
      })
      expect(buildResult.success).toBe(true)

      if (buildResult.success) {
        const validateResult = validateCronExpression(buildResult.data.expression)
        expect(validateResult.success).toBe(true)

        const timesResult = getNextExecutionTimes(buildResult.data.expression, 5)
        expect(timesResult.success).toBe(true)
      }
    })

    test("다양한 Quartz 표현식", () => {
      const result = getNextExecutionTimes("0 0 12 * * *", 3)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.nextExecutionTimes).toHaveLength(3)
      }
    })
  })
})
