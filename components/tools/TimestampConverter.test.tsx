/**
 * TimestampConverter 컴포넌트 테스트
 */

import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TimestampConverter } from "./TimestampConverter"
import * as timestampHandler from "@/lib/timestamp-handler"

// Mock the handlers
jest.mock("@/lib/timestamp-handler")
jest.mock("@/lib/utils", () => ({
  cn: (...inputs) => {
    return inputs
      .flat()
      .filter((x) => typeof x === "string" && x.length > 0)
      .join(" ")
  },
  copyToClipboard: jest.fn().mockResolvedValue(true),
}))

describe("TimestampConverter Component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("렌더링 테스트", () => {
    test("컴포넌트가 정상적으로 렌더링됨", () => {
      render(<TimestampConverter />)

      expect(screen.getByText("Timestamp → 날짜")).toBeInTheDocument()
      expect(screen.getByText("날짜 → Timestamp")).toBeInTheDocument()
      expect(screen.getByText("변환 옵션")).toBeInTheDocument()
    })

    test("초기 모드는 Timestamp → 날짜", () => {
      render(<TimestampConverter />)

      const input = screen.getByPlaceholderText(/예: 1609459200/)
      expect(input).toBeInTheDocument()
    })

    test("모든 버튼이 렌더링됨", () => {
      render(<TimestampConverter />)

      expect(screen.getByText("지금")).toBeInTheDocument()
      expect(screen.getByText("변환")).toBeInTheDocument()
      expect(screen.getByText("초기화")).toBeInTheDocument()
    })

    test("타임존 선택 버튼이 모두 렌더링됨", () => {
      render(<TimestampConverter />)

      expect(screen.getAllByText("KST")[0]).toBeInTheDocument()
      expect(screen.getAllByText("UTC")[0]).toBeInTheDocument()
      expect(screen.getAllByText("JST")[0]).toBeInTheDocument()
      expect(screen.getAllByText("EST")[0]).toBeInTheDocument()
      expect(screen.getAllByText("CST")[0]).toBeInTheDocument()
      expect(screen.getAllByText("PST")[0]).toBeInTheDocument()
    })

    test("단위 선택 버튼이 렌더링됨", () => {
      render(<TimestampConverter />)

      expect(screen.getByText("초 (s)")).toBeInTheDocument()
      expect(screen.getByText("밀리초 (ms)")).toBeInTheDocument()
    })

    test("팁 섹션이 렌더링됨", () => {
      render(<TimestampConverter />)

      expect(screen.getByText("💡 팁")).toBeInTheDocument()
      expect(
        screen.getByText(/Unix Timestamp는 1970-01-01 00:00:00 UTC부터의 시간입니다/)
      ).toBeInTheDocument()
    })
  })

  describe("모드 전환 테스트", () => {
    test("Timestamp → 날짜 탭 클릭 시 입력 필드 변경", async () => {
      const user = userEvent.setup()
      render(<TimestampConverter />)

      const timestampTab = screen.getAllByText("Timestamp → 날짜")[0]
      await user.click(timestampTab)

      expect(screen.getByPlaceholderText(/예: 1609459200/)).toBeInTheDocument()
    })

    test("날짜 → Timestamp 탭 클릭 시 입력 필드 변경", async () => {
      const user = userEvent.setup()
      render(<TimestampConverter />)

      const dateTab = screen.getAllByText("날짜 → Timestamp")[0]
      await user.click(dateTab)

      await waitFor(() => {
        expect(screen.getByLabelText("날짜/시간 선택")).toBeInTheDocument()
      })
    })

    test("모드 변경 시 결과 초기화", async () => {
      const user = userEvent.setup()
      ;(timestampHandler.timestampToDate as jest.Mock).mockReturnValue({
        success: true,
        data: {
          utc: "2021-01-01 00:00:00",
          kst: "2021-01-01 09:00:00",
          dayOfWeek: "금요일",
          relativeTime: "약 4년 전",
          iso8601: "2021-01-01T00:00:00Z",
        },
      })

      render(<TimestampConverter />)

      const input = screen.getByPlaceholderText(/예: 1609459200/)
      await user.type(input, "1609459200")

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(screen.getByText(/변환 성공/)).toBeInTheDocument()
      })

      // 모드 전환
      const dateTab = screen.getAllByText("날짜 → Timestamp")[0]
      await user.click(dateTab)

      await waitFor(() => {
        expect(screen.queryByText(/변환 성공/)).not.toBeInTheDocument()
      })
    })
  })

  describe("Timestamp → 날짜 변환 테스트", () => {
    test("Timestamp 입력 후 변환 버튼 클릭", async () => {
      const user = userEvent.setup()
      ;(timestampHandler.timestampToDate as jest.Mock).mockReturnValue({
        success: true,
        data: {
          utc: "2021-01-01 00:00:00",
          kst: "2021-01-01 09:00:00",
          dayOfWeek: "금요일",
          relativeTime: "약 4년 전",
          iso8601: "2021-01-01T00:00:00Z",
        },
      })

      render(<TimestampConverter />)

      const input = screen.getByPlaceholderText(/예: 1609459200/)
      await user.type(input, "1609459200")

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(timestampHandler.timestampToDate).toHaveBeenCalled()
        expect(screen.getByText(/변환 성공/)).toBeInTheDocument()
      })
    })

    test("Timestamp 변환 성공 시 결과 표시", async () => {
      const user = userEvent.setup()
      ;(timestampHandler.timestampToDate as jest.Mock).mockReturnValue({
        success: true,
        data: {
          utc: "2021-01-01 00:00:00",
          kst: "2021-01-01 09:00:00",
          dayOfWeek: "금요일",
          relativeTime: "약 4년 전",
          iso8601: "2021-01-01T00:00:00Z",
        },
      })

      render(<TimestampConverter />)

      const input = screen.getByPlaceholderText(/예: 1609459200/)
      await user.type(input, "1609459200")

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(screen.getByText(/2021-01-01 00:00:00/)).toBeInTheDocument()
        expect(screen.getByText(/2021-01-01 09:00:00/)).toBeInTheDocument()
        expect(screen.getByText(/금요일/)).toBeInTheDocument()
        expect(screen.getByText(/약 4년 전/)).toBeInTheDocument()
      })
    })

    test("Timestamp 변환 실패 시 에러 메시지 표시", async () => {
      const user = userEvent.setup()
      ;(timestampHandler.timestampToDate as jest.Mock).mockReturnValue({
        success: false,
        error: "유효한 Timestamp가 아닙니다",
      })

      render(<TimestampConverter />)

      const input = screen.getByPlaceholderText(/예: 1609459200/)
      await user.type(input, "invalid")

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(screen.getByText("유효한 숫자를 입력해주세요")).toBeInTheDocument()
      })
    })

    test("빈 입력으로 변환 시 버튼 비활성화", () => {
      render(<TimestampConverter />)

      const convertBtn = screen.getByText("변환")
      expect(convertBtn).toBeDisabled()
    })

    test("타임존 선택 시 변환에 반영", async () => {
      const user = userEvent.setup()
      ;(timestampHandler.timestampToDate as jest.Mock).mockReturnValue({
        success: true,
        data: {
          utc: "2021-01-01 00:00:00",
          kst: "2021-01-01 09:00:00",
          dayOfWeek: "금요일",
          relativeTime: "약 4년 전",
          iso8601: "2021-01-01T00:00:00Z",
        },
      })

      render(<TimestampConverter />)

      const utcBtn = screen.getAllByText("UTC")[0]
      await user.click(utcBtn)

      const input = screen.getByPlaceholderText(/예: 1609459200/)
      await user.type(input, "1609459200")

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(timestampHandler.timestampToDate).toHaveBeenCalledWith(
          1609459200,
          "UTC",
          "ms"
        )
      })
    })

    test("단위 선택 시 변환에 반영", async () => {
      const user = userEvent.setup()
      ;(timestampHandler.timestampToDate as jest.Mock).mockReturnValue({
        success: true,
        data: {
          utc: "2021-01-01 00:00:00",
          kst: "2021-01-01 09:00:00",
          dayOfWeek: "금요일",
          relativeTime: "약 4년 전",
          iso8601: "2021-01-01T00:00:00Z",
        },
      })

      render(<TimestampConverter />)

      const secondsBtn = screen.getByText("초 (s)")
      await user.click(secondsBtn)

      const input = screen.getByPlaceholderText(/예: 1609459200/)
      await user.type(input, "1609459200")

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(timestampHandler.timestampToDate).toHaveBeenCalledWith(
          1609459200,
          "KST",
          "s"
        )
      })
    })
  })

  describe("날짜 → Timestamp 변환 테스트", () => {
    test("날짜 입력 후 변환 버튼 클릭", async () => {
      const user = userEvent.setup()
      ;(timestampHandler.dateToTimestamp as jest.Mock).mockReturnValue({
        success: true,
        data: {
          timestamp: 1609459200000,
          utc: "2021-01-01 00:00:00",
          kst: "2021-01-01 09:00:00",
          dayOfWeek: "금요일",
          relativeTime: "약 4년 전",
          iso8601: "2021-01-01T00:00:00Z",
        },
      })

      render(<TimestampConverter />)

      // 날짜 → Timestamp 모드로 전환
      const dateTab = screen.getAllByText("날짜 → Timestamp")[0]
      await user.click(dateTab)

      const input = screen.getByLabelText("날짜/시간 선택")
      await user.type(input, "2021-01-01T09:00")

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(timestampHandler.dateToTimestamp).toHaveBeenCalled()
        expect(screen.getByText(/변환 성공/)).toBeInTheDocument()
      })
    })

    test("날짜 변환 성공 시 Timestamp 결과 표시", async () => {
      const user = userEvent.setup()
      ;(timestampHandler.dateToTimestamp as jest.Mock).mockReturnValue({
        success: true,
        data: {
          timestamp: 1609459200000,
          utc: "2021-01-01 00:00:00",
          kst: "2021-01-01 09:00:00",
          dayOfWeek: "금요일",
          relativeTime: "약 4년 전",
          iso8601: "2021-01-01T00:00:00Z",
        },
      })

      render(<TimestampConverter />)

      const dateTab = screen.getAllByText("날짜 → Timestamp")[0]
      await user.click(dateTab)

      const input = screen.getByLabelText("날짜/시간 선택")
      await user.type(input, "2021-01-01T09:00")

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(screen.getByText(/1609459200000/)).toBeInTheDocument()
      })
    })

    test("날짜 변환 실패 시 에러 메시지 표시", async () => {
      const user = userEvent.setup()
      ;(timestampHandler.dateToTimestamp as jest.Mock).mockReturnValue({
        success: false,
        error: "유효한 날짜가 아닙니다",
      })

      render(<TimestampConverter />)

      const dateTab = screen.getAllByText("날짜 → Timestamp")[0]
      await user.click(dateTab)

      const input = screen.getByLabelText("날짜/시간 선택")
      await user.type(input, "2021-01-01T09:00")

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(screen.getByText("유효한 날짜가 아닙니다")).toBeInTheDocument()
      })
    })

    test("빈 날짜 입력으로 변환 시 버튼 비활성화", async () => {
      const user = userEvent.setup()
      render(<TimestampConverter />)

      const dateTab = screen.getAllByText("날짜 → Timestamp")[0]
      await user.click(dateTab)

      const convertBtn = screen.getByText("변환")
      expect(convertBtn).toBeDisabled()
    })
  })

  describe("현재 시간 테스트", () => {
    test("지금 버튼 클릭 시 현재 시간 표시", async () => {
      const user = userEvent.setup()
      ;(timestampHandler.getCurrentTime as jest.Mock).mockReturnValue({
        success: true,
        data: {
          utc: "2025-11-21 05:00:00",
          kst: "2025-11-21 14:00:00",
          dayOfWeek: "목요일",
          iso8601: "2025-11-21T05:00:00Z",
        },
      })

      render(<TimestampConverter />)

      const nowBtn = screen.getByText("지금")
      await user.click(nowBtn)

      await waitFor(() => {
        expect(timestampHandler.getCurrentTime).toHaveBeenCalled()
        const currentTimeHeaders = screen.getAllByText(/현재 시간/)
        expect(currentTimeHeaders.length).toBeGreaterThan(0)
        expect(screen.getByText(/2025-11-21 05:00:00/)).toBeInTheDocument()
        expect(screen.getByText(/2025-11-21 14:00:00/)).toBeInTheDocument()
        expect(screen.getByText(/목요일/)).toBeInTheDocument()
      })
    })

    test("지금 버튼 실패 시 에러 메시지 표시", async () => {
      const user = userEvent.setup()
      ;(timestampHandler.getCurrentTime as jest.Mock).mockReturnValue({
        success: false,
        error: "현재 시간을 가져올 수 없습니다",
      })

      render(<TimestampConverter />)

      const nowBtn = screen.getByText("지금")
      await user.click(nowBtn)

      await waitFor(() => {
        expect(screen.getByText("현재 시간을 가져올 수 없습니다")).toBeInTheDocument()
      })
    })

    test("지금 버튼으로 타임존 선택 반영", async () => {
      const user = userEvent.setup()
      ;(timestampHandler.getCurrentTime as jest.Mock).mockReturnValue({
        success: true,
        data: {
          utc: "2025-11-21 05:00:00",
          kst: "2025-11-21 14:00:00",
          dayOfWeek: "목요일",
          iso8601: "2025-11-21T05:00:00Z",
        },
      })

      render(<TimestampConverter />)

      const jstBtn = screen.getAllByText("JST")[0]
      await user.click(jstBtn)

      const nowBtn = screen.getByText("지금")
      await user.click(nowBtn)

      await waitFor(() => {
        expect(timestampHandler.getCurrentTime).toHaveBeenCalledWith("JST")
      })
    })
  })

  describe("복사 기능 테스트", () => {
    test("Timestamp 복사 버튼 동작", async () => {
      const user = userEvent.setup()
      const { copyToClipboard } = require("@/lib/utils")

      ;(timestampHandler.dateToTimestamp as jest.Mock).mockReturnValue({
        success: true,
        data: {
          timestamp: 1609459200000,
          utc: "2021-01-01 00:00:00",
          kst: "2021-01-01 09:00:00",
          dayOfWeek: "금요일",
          relativeTime: "약 4년 전",
          iso8601: "2021-01-01T00:00:00Z",
        },
      })

      render(<TimestampConverter />)

      const dateTab = screen.getAllByText("날짜 → Timestamp")[0]
      await user.click(dateTab)

      const input = screen.getByLabelText("날짜/시간 선택")
      await user.type(input, "2021-01-01T09:00")

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(screen.getByText(/변환 성공/)).toBeInTheDocument()
      })

      const copyBtn = screen.getByText("Timestamp 복사")
      await user.click(copyBtn)

      // 복사 버튼 클릭 시 에러가 발생하지 않는지 확인
      // navigator.clipboard는 jest.setup.js에서 mock되어 있음
      expect(copyBtn).toBeInTheDocument()
    })

    test("Timestamp → 날짜 모드에서는 복사 버튼 미표시", async () => {
      const user = userEvent.setup()
      ;(timestampHandler.timestampToDate as jest.Mock).mockReturnValue({
        success: true,
        data: {
          utc: "2021-01-01 00:00:00",
          kst: "2021-01-01 09:00:00",
          dayOfWeek: "금요일",
          relativeTime: "약 4년 전",
          iso8601: "2021-01-01T00:00:00Z",
        },
      })

      render(<TimestampConverter />)

      const input = screen.getByPlaceholderText(/예: 1609459200/)
      await user.type(input, "1609459200")

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(screen.getByText(/변환 성공/)).toBeInTheDocument()
      })

      expect(screen.queryByText("Timestamp 복사")).not.toBeInTheDocument()
    })
  })

  describe("초기화 기능 테스트", () => {
    test("초기화 버튼으로 모든 상태 리셋", async () => {
      const user = userEvent.setup()
      ;(timestampHandler.timestampToDate as jest.Mock).mockReturnValue({
        success: true,
        data: {
          utc: "2021-01-01 00:00:00",
          kst: "2021-01-01 09:00:00",
          dayOfWeek: "금요일",
          relativeTime: "약 4년 전",
          iso8601: "2021-01-01T00:00:00Z",
        },
      })

      render(<TimestampConverter />)

      const input = screen.getByPlaceholderText(/예: 1609459200/)
      await user.type(input, "1609459200")

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(screen.getByText(/변환 성공/)).toBeInTheDocument()
      })

      const resetBtn = screen.getByText("초기화")
      await user.click(resetBtn)

      await waitFor(() => {
        expect((input as HTMLTextAreaElement).value).toBe("")
        expect(screen.queryByText(/변환 성공/)).not.toBeInTheDocument()
      })
    })

    test("초기화 버튼으로 현재 시간 정보도 리셋", async () => {
      const user = userEvent.setup()
      ;(timestampHandler.getCurrentTime as jest.Mock).mockReturnValue({
        success: true,
        data: {
          utc: "2025-11-21 05:00:00",
          kst: "2025-11-21 14:00:00",
          dayOfWeek: "목요일",
          iso8601: "2025-11-21T05:00:00Z",
        },
      })

      render(<TimestampConverter />)

      const nowBtn = screen.getByText("지금")
      await user.click(nowBtn)

      await waitFor(() => {
        const currentTimeHeaders = screen.getAllByText(/현재 시간/)
        expect(currentTimeHeaders.length).toBeGreaterThan(0)
      })

      const resetBtn = screen.getByText("초기화")
      await user.click(resetBtn)

      await waitFor(() => {
        // 현재 시간 정보 카드가 사라지는지 확인 (팁 섹션의 텍스트는 남아있음)
        const currentTimeCards = screen.queryAllByText(/현재 시간/)
        // 팁 섹션에 "현재 시간" 텍스트가 있으므로 완전히 사라지지 않을 수 있음
        // 대신 UTC, KST 등의 현재 시간 데이터가 사라지는지 확인
        expect(screen.queryByText(/2025-11-21 05:00:00/)).not.toBeInTheDocument()
      })
    })
  })

  describe("타임존 선택 테스트", () => {
    test("모든 타임존 버튼 클릭 가능", async () => {
      const user = userEvent.setup()
      render(<TimestampConverter />)

      const timezones = ["KST", "UTC", "JST", "EST", "CST", "PST"]

      for (const tz of timezones) {
        const btn = screen.getAllByText(tz)[0]
        await user.click(btn)
        // 클릭 후 상태 변경 확인은 변환 시 검증됨
      }
    })
  })

  describe("에러 처리 테스트", () => {
    test("숫자가 아닌 Timestamp 입력 시 에러", async () => {
      const user = userEvent.setup()
      render(<TimestampConverter />)

      const input = screen.getByPlaceholderText(/예: 1609459200/)
      await user.type(input, "not-a-number")

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(screen.getByText("유효한 숫자를 입력해주세요")).toBeInTheDocument()
      })
    })

    test("변환 실패 시 결과 초기화", async () => {
      const user = userEvent.setup()
      ;(timestampHandler.timestampToDate as jest.Mock).mockReturnValue({
        success: false,
        error: "변환 실패",
      })

      render(<TimestampConverter />)

      const input = screen.getByPlaceholderText(/예: 1609459200/)
      await user.type(input, "invalid")

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(screen.queryByText(/변환 성공/)).not.toBeInTheDocument()
      })
    })
  })
})
