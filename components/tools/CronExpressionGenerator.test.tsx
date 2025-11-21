/**
 * CronExpressionGenerator 컴포넌트 테스트
 */

import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CronExpressionGenerator } from "./CronExpressionGenerator"
import * as cronHandler from "@/lib/cron-handler"

// Mock the handlers
jest.mock("@/lib/cron-handler")
jest.mock("@/lib/utils", () => ({
  cn: (...inputs) => {
    return inputs
      .flat()
      .filter((x) => typeof x === "string" && x.length > 0)
      .join(" ")
  },
  copyToClipboard: jest.fn().mockResolvedValue(true),
}))

describe("CronExpressionGenerator Component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("렌더링 테스트", () => {
    test("컴포넌트가 정상적으로 렌더링됨", () => {
      render(<CronExpressionGenerator />)

      expect(screen.getByText("GUI 빌더")).toBeInTheDocument()
      expect(screen.getByText("표현식 검증")).toBeInTheDocument()
      expect(screen.getByText("프리셋 선택")).toBeInTheDocument()
    })

    test("초기 모드는 GUI 빌더", () => {
      render(<CronExpressionGenerator />)

      expect(screen.getByText("Cron 필드 설정")).toBeInTheDocument()
    })

    test("모든 버튼이 렌더링됨", () => {
      render(<CronExpressionGenerator />)

      expect(screen.getByText("생성 및 검증")).toBeInTheDocument()
      expect(screen.getByText("초기화")).toBeInTheDocument()
    })

    test("프리셋 버튼이 모두 렌더링됨", () => {
      render(<CronExpressionGenerator />)

      expect(screen.getByText("매 분마다")).toBeInTheDocument()
      expect(screen.getByText("매 시간마다")).toBeInTheDocument()
      expect(screen.getByText("매일 자정")).toBeInTheDocument()
      expect(screen.getByText("매주 일요일 자정")).toBeInTheDocument()
      expect(screen.getByText("매월 1일 자정")).toBeInTheDocument()
      expect(screen.getByText("평일 오전 9시")).toBeInTheDocument()
      expect(screen.getByText("주말 오전 10시")).toBeInTheDocument()
    })

    test("Cron 필드 입력이 렌더링됨", () => {
      render(<CronExpressionGenerator />)

      expect(screen.getByPlaceholderText(/0, \*, \*\/5/)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/0, \*, 9-17/)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/1, \*, 1,15/)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/1, \*, JAN/)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/0, \*, MON-FRI/)).toBeInTheDocument()
    })

    test("팁 섹션이 렌더링됨", () => {
      render(<CronExpressionGenerator />)

      expect(screen.getByText("💡 팁")).toBeInTheDocument()
      expect(screen.getByText(/Linux 형식: 5필드/)).toBeInTheDocument()
    })

    test("초 필드 포함 체크박스가 렌더링됨", () => {
      render(<CronExpressionGenerator />)

      expect(
        screen.getByLabelText(/초\(Second\) 필드 포함/)
      ).toBeInTheDocument()
    })
  })

  describe("모드 전환 테스트", () => {
    test("GUI 빌더 탭 클릭 시 필드 입력 표시", async () => {
      const user = userEvent.setup()
      render(<CronExpressionGenerator />)

      const builderTab = screen.getAllByText("GUI 빌더")[0]
      await user.click(builderTab)

      expect(screen.getByText("Cron 필드 설정")).toBeInTheDocument()
    })

    test("표현식 검증 탭 클릭 시 입력 필드 변경", async () => {
      const user = userEvent.setup()
      render(<CronExpressionGenerator />)

      const validatorTab = screen.getAllByText("표현식 검증")[0]
      await user.click(validatorTab)

      await waitFor(() => {
        expect(screen.getByText("Cron 표현식")).toBeInTheDocument()
        expect(screen.getByText("검증 및 테스트")).toBeInTheDocument()
      })
    })

    test("모드 변경 시 결과 초기화", async () => {
      const user = userEvent.setup()
      ;(cronHandler.buildCronExpression as jest.Mock).mockReturnValue({
        success: true,
        data: {
          expression: "0 9 * * 1-5",
          description: "평일 오전 9시에 실행",
          type: "linux",
          isValid: true,
        },
      })
      ;(cronHandler.getNextExecutionTimes as jest.Mock).mockReturnValue({
        success: true,
        data: {
          nextExecutionTimes: [
            "2025-11-24T09:00:00+09:00",
            "2025-11-25T09:00:00+09:00",
          ],
          description: "평일 오전 9시에 실행",
        },
      })

      render(<CronExpressionGenerator />)

      const generateBtn = screen.getByText("생성 및 검증")
      await user.click(generateBtn)

      await waitFor(() => {
        expect(screen.getByText(/Cron 표현식 검증 성공/)).toBeInTheDocument()
      })

      // 모드 전환
      const validatorTab = screen.getAllByText("표현식 검증")[0]
      await user.click(validatorTab)

      await waitFor(() => {
        expect(
          screen.queryByText(/Cron 표현식 검증 성공/)
        ).not.toBeInTheDocument()
      })
    })
  })

  describe("GUI 빌더 모드 테스트", () => {
    test("필드 입력 후 생성 버튼 클릭", async () => {
      const user = userEvent.setup()
      ;(cronHandler.buildCronExpression as jest.Mock).mockReturnValue({
        success: true,
        data: {
          expression: "*/5 * * * *",
          description: "5분마다 실행",
          type: "linux",
          isValid: true,
        },
      })
      ;(cronHandler.getNextExecutionTimes as jest.Mock).mockReturnValue({
        success: true,
        data: {
          nextExecutionTimes: [
            "2025-11-21T14:00:00+09:00",
            "2025-11-21T14:05:00+09:00",
          ],
          description: "5분마다 실행",
        },
      })

      render(<CronExpressionGenerator />)

      const minuteInput = screen.getByPlaceholderText(/0, \*, \*\/5/)
      await user.clear(minuteInput)
      await user.type(minuteInput, "*/5")

      const generateBtn = screen.getByText("생성 및 검증")
      await user.click(generateBtn)

      await waitFor(() => {
        expect(cronHandler.buildCronExpression).toHaveBeenCalled()
        expect(cronHandler.getNextExecutionTimes).toHaveBeenCalled()
      })
    })

    test("Cron 생성 성공 시 결과 표시", async () => {
      const user = userEvent.setup()
      ;(cronHandler.buildCronExpression as jest.Mock).mockReturnValue({
        success: true,
        data: {
          expression: "0 9 * * 1-5",
          description: "평일 오전 9시에 실행",
          type: "linux",
          isValid: true,
        },
      })
      ;(cronHandler.getNextExecutionTimes as jest.Mock).mockReturnValue({
        success: true,
        data: {
          nextExecutionTimes: [
            "2025-11-24T09:00:00+09:00",
            "2025-11-25T09:00:00+09:00",
          ],
          description: "평일 오전 9시에 실행",
        },
      })

      render(<CronExpressionGenerator />)

      const generateBtn = screen.getByText("생성 및 검증")
      await user.click(generateBtn)

      await waitFor(() => {
        expect(screen.getByText(/Cron 표현식 검증 성공/)).toBeInTheDocument()
        const cronExpressions = screen.getAllByText(/0 9 \* \* 1-5/)
        expect(cronExpressions.length).toBeGreaterThan(0)
        expect(screen.getByText(/평일 오전 9시에 실행/)).toBeInTheDocument()
      })
    })

    test("Cron 생성 실패 시 에러 메시지 표시", async () => {
      const user = userEvent.setup()
      ;(cronHandler.buildCronExpression as jest.Mock).mockReturnValue({
        success: false,
        error: "유효하지 않은 Cron 표현식",
      })

      render(<CronExpressionGenerator />)

      const generateBtn = screen.getByText("생성 및 검증")
      await user.click(generateBtn)

      await waitFor(() => {
        expect(screen.getByText("유효하지 않은 Cron 표현식")).toBeInTheDocument()
      })
    })

    test("초 필드 포함 체크박스 동작", async () => {
      const user = userEvent.setup()
      ;(cronHandler.buildCronExpression as jest.Mock).mockReturnValue({
        success: true,
        data: {
          expression: "0 0 12 * * *",
          description: "매일 정오에 실행",
          type: "quartz",
          isValid: true,
        },
      })
      ;(cronHandler.getNextExecutionTimes as jest.Mock).mockReturnValue({
        success: true,
        data: {
          nextExecutionTimes: ["2025-11-21T12:00:00+09:00"],
          description: "매일 정오에 실행",
        },
      })

      render(<CronExpressionGenerator />)

      const secondsCheckbox = screen.getByLabelText(/초\(Second\) 필드 포함/)
      await user.click(secondsCheckbox)

      await waitFor(() => {
        expect(screen.getByText(/초 \(0-59\)/)).toBeInTheDocument()
      })

      const generateBtn = screen.getByText("생성 및 검증")
      await user.click(generateBtn)

      await waitFor(() => {
        expect(cronHandler.buildCronExpression).toHaveBeenCalledWith(
          expect.objectContaining({
            second: expect.any(String),
          })
        )
      })
    })
  })

  describe("프리셋 로드 테스트", () => {
    test("매 분마다 프리셋 클릭", async () => {
      const user = userEvent.setup()
      ;(cronHandler.getNextExecutionTimes as jest.Mock).mockReturnValue({
        success: true,
        data: {
          nextExecutionTimes: [
            "2025-11-21T14:00:00+09:00",
            "2025-11-21T14:01:00+09:00",
          ],
          description: "매 분마다 실행",
        },
      })

      render(<CronExpressionGenerator />)

      const presetBtn = screen.getByText("매 분마다")
      await user.click(presetBtn)

      await waitFor(() => {
        expect(cronHandler.getNextExecutionTimes).toHaveBeenCalledWith(
          "* * * * *",
          10
        )
        expect(screen.getByText(/Cron 표현식 검증 성공/)).toBeInTheDocument()
      })
    })

    test("평일 오전 9시 프리셋 클릭", async () => {
      const user = userEvent.setup()
      ;(cronHandler.getNextExecutionTimes as jest.Mock).mockReturnValue({
        success: true,
        data: {
          nextExecutionTimes: [
            "2025-11-24T09:00:00+09:00",
            "2025-11-25T09:00:00+09:00",
          ],
          description: "평일 오전 9시에 실행",
        },
      })

      render(<CronExpressionGenerator />)

      const presetBtn = screen.getByText("평일 오전 9시")
      await user.click(presetBtn)

      await waitFor(() => {
        expect(cronHandler.getNextExecutionTimes).toHaveBeenCalledWith(
          "0 9 * * 1-5",
          10
        )
      })
    })

    test("프리셋 로드 시 필드 값 업데이트", async () => {
      const user = userEvent.setup()
      ;(cronHandler.getNextExecutionTimes as jest.Mock).mockReturnValue({
        success: true,
        data: {
          nextExecutionTimes: ["2025-11-21T00:00:00+09:00"],
          description: "매일 자정에 실행",
        },
      })

      render(<CronExpressionGenerator />)

      const minuteInput = screen.getByPlaceholderText(
        /0, \*, \*\/5/
      ) as HTMLInputElement
      const hourInput = screen.getByPlaceholderText(
        /0, \*, 9-17/
      ) as HTMLInputElement

      const presetBtn = screen.getByText("매일 자정")
      await user.click(presetBtn)

      await waitFor(() => {
        // 필드 값이 프리셋에 맞게 변경되어야 함
        expect(minuteInput.value).toBe("0")
        expect(hourInput.value).toBe("0")
      })
    })

    test("모든 프리셋 버튼 클릭 가능", async () => {
      const user = userEvent.setup()
      ;(cronHandler.getNextExecutionTimes as jest.Mock).mockReturnValue({
        success: true,
        data: {
          nextExecutionTimes: ["2025-11-21T00:00:00+09:00"],
          description: "테스트",
        },
      })

      render(<CronExpressionGenerator />)

      const presets = [
        "매 분마다",
        "매 시간마다",
        "매일 자정",
        "매주 일요일 자정",
        "매월 1일 자정",
        "평일 오전 9시",
        "주말 오전 10시",
      ]

      for (const preset of presets) {
        const btn = screen.getByText(preset)
        await user.click(btn)
        await waitFor(() => {
          expect(cronHandler.getNextExecutionTimes).toHaveBeenCalled()
        })
        jest.clearAllMocks()
      }
    })
  })

  describe("표현식 검증 모드 테스트", () => {
    test("Cron 표현식 입력 후 검증 버튼 클릭", async () => {
      const user = userEvent.setup()
      ;(cronHandler.validateCronExpression as jest.Mock).mockReturnValue({
        success: true,
        data: { isValid: true },
      })
      ;(cronHandler.describeCron as jest.Mock).mockReturnValue({
        success: true,
        data: { description: "5분마다 실행" },
      })
      ;(cronHandler.getNextExecutionTimes as jest.Mock).mockReturnValue({
        success: true,
        data: {
          nextExecutionTimes: [
            "2025-11-21T14:00:00+09:00",
            "2025-11-21T14:05:00+09:00",
          ],
          description: "5분마다 실행",
        },
      })

      render(<CronExpressionGenerator />)

      // 표현식 검증 모드로 전환
      const validatorTab = screen.getAllByText("표현식 검증")[0]
      await user.click(validatorTab)

      const input = screen.getByPlaceholderText(/예: 0 9 \* \* 1-5/)
      await user.type(input, "*/5 * * * *")

      const validateBtn = screen.getByText("검증 및 테스트")
      await user.click(validateBtn)

      await waitFor(() => {
        expect(cronHandler.validateCronExpression).toHaveBeenCalledWith(
          "*/5 * * * *"
        )
        expect(cronHandler.describeCron).toHaveBeenCalledWith("*/5 * * * *")
        expect(cronHandler.getNextExecutionTimes).toHaveBeenCalledWith(
          "*/5 * * * *",
          10
        )
      })
    })

    test("Cron 검증 성공 시 결과 표시", async () => {
      const user = userEvent.setup()
      ;(cronHandler.validateCronExpression as jest.Mock).mockReturnValue({
        success: true,
        data: { isValid: true },
      })
      ;(cronHandler.describeCron as jest.Mock).mockReturnValue({
        success: true,
        data: { description: "매 시간 0분에 실행" },
      })
      ;(cronHandler.getNextExecutionTimes as jest.Mock).mockReturnValue({
        success: true,
        data: {
          nextExecutionTimes: [
            "2025-11-21T14:00:00+09:00",
            "2025-11-21T15:00:00+09:00",
          ],
          description: "매 시간 0분에 실행",
        },
      })

      render(<CronExpressionGenerator />)

      const validatorTab = screen.getAllByText("표현식 검증")[0]
      await user.click(validatorTab)

      const input = screen.getByPlaceholderText(/예: 0 9 \* \* 1-5/)
      await user.type(input, "0 * * * *")

      const validateBtn = screen.getByText("검증 및 테스트")
      await user.click(validateBtn)

      await waitFor(() => {
        expect(screen.getByText(/Cron 표현식 검증 성공/)).toBeInTheDocument()
        expect(screen.getByText(/매 시간 0분에 실행/)).toBeInTheDocument()
      })
    })

    test("Cron 검증 실패 시 에러 메시지 표시", async () => {
      const user = userEvent.setup()
      ;(cronHandler.validateCronExpression as jest.Mock).mockReturnValue({
        success: false,
        error: "유효하지 않은 Cron 표현식",
      })

      render(<CronExpressionGenerator />)

      const validatorTab = screen.getAllByText("표현식 검증")[0]
      await user.click(validatorTab)

      const input = screen.getByPlaceholderText(/예: 0 9 \* \* 1-5/)
      await user.type(input, "invalid cron")

      const validateBtn = screen.getByText("검증 및 테스트")
      await user.click(validateBtn)

      await waitFor(() => {
        expect(screen.getByText("유효하지 않은 Cron 표현식")).toBeInTheDocument()
      })
    })

    test("빈 입력으로 검증 시 버튼 비활성화", async () => {
      const user = userEvent.setup()
      render(<CronExpressionGenerator />)

      const validatorTab = screen.getAllByText("표현식 검증")[0]
      await user.click(validatorTab)

      const validateBtn = screen.getByText("검증 및 테스트")

      // 빈 입력일 때 버튼이 비활성화되어야 함
      expect(validateBtn).toBeDisabled()
    })

    test("다음 실행 시간 리스트 표시", async () => {
      const user = userEvent.setup()
      ;(cronHandler.validateCronExpression as jest.Mock).mockReturnValue({
        success: true,
        data: { isValid: true },
      })
      ;(cronHandler.describeCron as jest.Mock).mockReturnValue({
        success: true,
        data: { description: "매일 자정에 실행" },
      })
      ;(cronHandler.getNextExecutionTimes as jest.Mock).mockReturnValue({
        success: true,
        data: {
          nextExecutionTimes: [
            "2025-11-22T00:00:00+09:00",
            "2025-11-23T00:00:00+09:00",
            "2025-11-24T00:00:00+09:00",
          ],
          description: "매일 자정에 실행",
        },
      })

      render(<CronExpressionGenerator />)

      const validatorTab = screen.getAllByText("표현식 검증")[0]
      await user.click(validatorTab)

      const input = screen.getByPlaceholderText(/예: 0 9 \* \* 1-5/)
      await user.type(input, "0 0 * * *")

      const validateBtn = screen.getByText("검증 및 테스트")
      await user.click(validateBtn)

      await waitFor(() => {
        expect(screen.getByText(/다음 10번 실행 시간:/)).toBeInTheDocument()
      })
    })
  })

  describe("복사 기능 테스트", () => {
    test("표현식 복사 버튼 동작", async () => {
      const user = userEvent.setup()
      const { copyToClipboard } = require("@/lib/utils")

      ;(cronHandler.buildCronExpression as jest.Mock).mockReturnValue({
        success: true,
        data: {
          expression: "0 9 * * 1-5",
          description: "평일 오전 9시에 실행",
          type: "linux",
          isValid: true,
        },
      })
      ;(cronHandler.getNextExecutionTimes as jest.Mock).mockReturnValue({
        success: true,
        data: {
          nextExecutionTimes: ["2025-11-24T09:00:00+09:00"],
          description: "평일 오전 9시에 실행",
        },
      })

      render(<CronExpressionGenerator />)

      const generateBtn = screen.getByText("생성 및 검증")
      await user.click(generateBtn)

      await waitFor(() => {
        expect(screen.getByText(/Cron 표현식 검증 성공/)).toBeInTheDocument()
      })

      const copyBtn = screen.getByText("표현식 복사")
      await user.click(copyBtn)

      // 복사 버튼 클릭 시 에러가 발생하지 않는지 확인
      // navigator.clipboard는 jest.setup.js에서 mock되어 있음
      expect(copyBtn).toBeInTheDocument()
    })

    test("결과가 없을 때 복사 버튼 미표시", () => {
      render(<CronExpressionGenerator />)

      expect(screen.queryByText("표현식 복사")).not.toBeInTheDocument()
    })
  })

  describe("초기화 기능 테스트", () => {
    test("초기화 버튼으로 모든 상태 리셋", async () => {
      const user = userEvent.setup()
      ;(cronHandler.buildCronExpression as jest.Mock).mockReturnValue({
        success: true,
        data: {
          expression: "0 9 * * 1-5",
          description: "평일 오전 9시에 실행",
          type: "linux",
          isValid: true,
        },
      })
      ;(cronHandler.getNextExecutionTimes as jest.Mock).mockReturnValue({
        success: true,
        data: {
          nextExecutionTimes: ["2025-11-24T09:00:00+09:00"],
          description: "평일 오전 9시에 실행",
        },
      })

      render(<CronExpressionGenerator />)

      const generateBtn = screen.getByText("생성 및 검증")
      await user.click(generateBtn)

      await waitFor(() => {
        expect(screen.getByText(/Cron 표현식 검증 성공/)).toBeInTheDocument()
      })

      const resetBtn = screen.getByText("초기화")
      await user.click(resetBtn)

      await waitFor(() => {
        expect(
          screen.queryByText(/Cron 표현식 검증 성공/)
        ).not.toBeInTheDocument()
      })
    })

    test("초기화로 필드 값도 리셋", async () => {
      const user = userEvent.setup()
      render(<CronExpressionGenerator />)

      const minuteInput = screen.getByPlaceholderText(
        /0, \*, \*\/5/
      ) as HTMLInputElement
      await user.clear(minuteInput)
      await user.type(minuteInput, "*/5")

      const resetBtn = screen.getByText("초기화")
      await user.click(resetBtn)

      await waitFor(() => {
        expect(minuteInput.value).toBe("*")
      })
    })
  })

  describe("에러 처리 테스트", () => {
    test("다음 실행 시간 계산 실패 시 에러 표시", async () => {
      const user = userEvent.setup()
      ;(cronHandler.buildCronExpression as jest.Mock).mockReturnValue({
        success: true,
        data: {
          expression: "0 9 * * 1-5",
          description: "평일 오전 9시에 실행",
          type: "linux",
          isValid: true,
        },
      })
      ;(cronHandler.getNextExecutionTimes as jest.Mock).mockReturnValue({
        success: false,
        error: "실행 시간 계산 실패",
      })

      render(<CronExpressionGenerator />)

      const generateBtn = screen.getByText("생성 및 검증")
      await user.click(generateBtn)

      await waitFor(() => {
        expect(screen.getByText("실행 시간 계산 실패")).toBeInTheDocument()
      })
    })

    test("에러 발생 시 결과 미표시", async () => {
      const user = userEvent.setup()
      ;(cronHandler.buildCronExpression as jest.Mock).mockReturnValue({
        success: false,
        error: "유효하지 않은 입력",
      })

      render(<CronExpressionGenerator />)

      const generateBtn = screen.getByText("생성 및 검증")
      await user.click(generateBtn)

      await waitFor(() => {
        expect(
          screen.queryByText(/Cron 표현식 검증 성공/)
        ).not.toBeInTheDocument()
      })
    })
  })
})
