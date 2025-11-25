/**
 * JavaJsonConverter 컴포넌트 테스트
 */

import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { JavaJsonConverter } from "./JavaJsonConverter"
import * as javaJsonHandler from "@/lib/java-json-handler"

// Mock the handlers
jest.mock("@/lib/java-json-handler")
jest.mock("@/lib/utils", () => ({
  cn: (...inputs: any[]) => {
    return inputs
      .flat()
      .filter((x) => typeof x === "string" && x.length > 0)
      .join(" ")
  },
  copyToClipboard: jest.fn().mockResolvedValue(true),
}))

describe("JavaJsonConverter Component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("렌더링 테스트", () => {
    test("컴포넌트가 정상적으로 렌더링됨", () => {
      render(<JavaJsonConverter />)

      expect(screen.getByText("Java → JSON")).toBeInTheDocument()
      expect(screen.getByText("JSON → Java")).toBeInTheDocument()
      expect(screen.getByText("네이밍 방식")).toBeInTheDocument()
    })

    test("초기 모드는 Java → JSON", () => {
      render(<JavaJsonConverter />)

      const input = screen.getByPlaceholderText(/Java 클래스를 입력하세요/)
      expect(input).toBeInTheDocument()
    })

    test("모든 버튼이 렌더링됨", () => {
      render(<JavaJsonConverter />)

      expect(screen.getByText("변환")).toBeInTheDocument()
      expect(screen.getByText("초기화")).toBeInTheDocument()
      expect(screen.getByText("📋 예제 로드")).toBeInTheDocument()
    })

    test("옵션 패널에서 네이밍 방식 선택 가능", () => {
      render(<JavaJsonConverter />)

      expect(screen.getByText("camelCase")).toBeInTheDocument()
      expect(screen.getByText("snake_case")).toBeInTheDocument()
    })
  })

  describe("모드 전환 테스트", () => {
    test("Java → JSON 탭 클릭 시 입력 placeholder 변경", async () => {
      const user = userEvent.setup()
      render(<JavaJsonConverter />)

      const javaToJsonBtn = screen.getAllByText("Java → JSON")[1] // 첫 번째는 탭, 두 번째는 아이콘
      await user.click(javaToJsonBtn)

      expect(screen.getByPlaceholderText(/Java 클래스를 입력하세요/)).toBeInTheDocument()
    })

    test("JSON → Java 탭 클릭 시 입력 placeholder 변경", async () => {
      const user = userEvent.setup()
      render(<JavaJsonConverter />)

      const jsonToJavaBtn = screen.getAllByText("JSON → Java")[1]
      await user.click(jsonToJavaBtn)

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/JSON을 입력하세요/)).toBeInTheDocument()
      })
    })

    test("JSON → Java 모드에서 클래스 이름 입력 필드 표시", async () => {
      const user = userEvent.setup()
      render(<JavaJsonConverter />)

      const jsonToJavaBtn = screen.getAllByText("JSON → Java")[1]
      await user.click(jsonToJavaBtn)

      await waitFor(() => {
        expect(screen.getByPlaceholderText("GeneratedClass")).toBeInTheDocument()
      })
    })

    test("모드 변경 시 결과 초기화", async () => {
      const user = userEvent.setup()
      ;(javaJsonHandler.javaToJson as jest.Mock).mockReturnValue({
        success: true,
        data: { result: '{"test": "value"}' },
      })

      render(<JavaJsonConverter />)

      const input = screen.getByPlaceholderText(/Java 클래스를 입력하세요/)
      await user.type(input, "public class Test { }")

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(screen.getByText(/변환 성공/)).toBeInTheDocument()
      })

      // 모드 전환
      const jsonToJavaBtn = screen.getAllByText("JSON → Java")[1]
      await user.click(jsonToJavaBtn)

      await waitFor(() => {
        expect(screen.queryByText(/변환 성공/)).not.toBeInTheDocument()
      })
    })
  })

  describe("Java → JSON 변환 테스트", () => {
    test("Java 코드 입력 후 변환 버튼 클릭", async () => {
      const user = userEvent.setup()
      ;(javaJsonHandler.javaToJson as jest.Mock).mockReturnValue({
        success: true,
        data: {
          result: '{\n  "name": "",\n  "age": 0\n}',
        },
      })

      render(<JavaJsonConverter />)

      const input = screen.getByPlaceholderText(/Java 클래스를 입력하세요/)
      await user.type(input, "public class User { private String name; }")

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(javaJsonHandler.javaToJson).toHaveBeenCalled()
      })
    })

    test("Java 변환 실패 시 에러 메시지 표시", async () => {
      const user = userEvent.setup()
      ;(javaJsonHandler.javaToJson as jest.Mock).mockReturnValue({
        success: false,
        error: "Java 클래스 파싱 실패",
      })

      render(<JavaJsonConverter />)

      const input = screen.getByPlaceholderText(/Java 클래스를 입력하세요/)
      await user.type(input, "invalid java")

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(screen.getByText("Java 클래스 파싱 실패")).toBeInTheDocument()
      })
    })

    test("빈 입력으로 변환 시 에러", async () => {
      const user = userEvent.setup()
      render(<JavaJsonConverter />)

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(screen.getByText("Java 코드를 입력해주세요")).toBeInTheDocument()
      })
    })

    test("camelCase 옵션 적용", async () => {
      const user = userEvent.setup()
      ;(javaJsonHandler.javaToJson as jest.Mock).mockReturnValue({
        success: true,
        data: { result: '{"firstName": ""}' },
      })

      render(<JavaJsonConverter />)

      const camelCaseBtn = screen.getAllByText("camelCase")[0]
      await user.click(camelCaseBtn)

      const input = screen.getByPlaceholderText(/Java 클래스를 입력하세요/)
      await user.type(input, "public class User { }")

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(javaJsonHandler.javaToJson).toHaveBeenCalledWith(
          expect.any(String),
          "camelCase"
        )
      })
    })

    test("snake_case 옵션 적용", async () => {
      const user = userEvent.setup()
      ;(javaJsonHandler.javaToJson as jest.Mock).mockReturnValue({
        success: true,
        data: { result: '{"first_name": ""}' },
      })

      render(<JavaJsonConverter />)

      const snakeCaseBtn = screen.getAllByText("snake_case")[0]
      await user.click(snakeCaseBtn)

      const input = screen.getByPlaceholderText(/Java 클래스를 입력하세요/)
      await user.type(input, "public class User { }")

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(javaJsonHandler.javaToJson).toHaveBeenCalledWith(
          expect.any(String),
          "snake_case"
        )
      })
    })
  })

  describe("JSON → Java 변환 테스트", () => {
    test("JSON 코드 입력 후 변환 버튼 클릭", async () => {
      const user = userEvent.setup()
      ;(javaJsonHandler.jsonToJava as jest.Mock).mockReturnValue({
        success: true,
        data: { result: "public class User { }" },
      })

      render(<JavaJsonConverter />)

      // JSON → Java 모드로 전환
      const jsonToJavaBtn = screen.getAllByText("JSON → Java")[1]
      await user.click(jsonToJavaBtn)

      const input = screen.getByPlaceholderText(/JSON을 입력하세요/)
      await user.type(input, '{"name": "John"}')

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(javaJsonHandler.jsonToJava).toHaveBeenCalled()
      })
    })

    test("JSON 변환 실패 시 에러 메시지 표시", async () => {
      const user = userEvent.setup()
      ;(javaJsonHandler.jsonToJava as jest.Mock).mockReturnValue({
        success: false,
        error: "JSON 파싱 실패",
      })

      render(<JavaJsonConverter />)

      const jsonToJavaBtn = screen.getAllByText("JSON → Java")[1]
      await user.click(jsonToJavaBtn)

      const input = screen.getByPlaceholderText(/JSON을 입력하세요/)
      await user.type(input, "invalid json")

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(screen.getByText("JSON 파싱 실패")).toBeInTheDocument()
      })
    })

    test("클래스 이름 입력 필드 동작", async () => {
      const user = userEvent.setup()
      ;(javaJsonHandler.jsonToJava as jest.Mock).mockReturnValue({
        success: true,
        data: { result: "public class CustomClass { }" },
      })

      render(<JavaJsonConverter />)

      const jsonToJavaBtn = screen.getAllByText("JSON → Java")[1]
      await user.click(jsonToJavaBtn)

      const classNameInput = screen.getByPlaceholderText("GeneratedClass")
      await user.clear(classNameInput)
      await user.type(classNameInput, "MyClass")

      const input = screen.getByPlaceholderText(/JSON을 입력하세요/)
      await user.type(input, '{"field": "value"}')

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(javaJsonHandler.jsonToJava).toHaveBeenCalledWith(
          expect.any(String),
          "MyClass",
          expect.any(String)
        )
      })
    })

    test("빈 입력으로 변환 시 에러", async () => {
      const user = userEvent.setup()
      render(<JavaJsonConverter />)

      const jsonToJavaBtn = screen.getAllByText("JSON → Java")[1]
      await user.click(jsonToJavaBtn)

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(screen.getByText("JSON을 입력해주세요")).toBeInTheDocument()
      })
    })
  })

  describe("복사 기능 테스트", () => {
    test("결과 복사 버튼 동작", async () => {
      const user = userEvent.setup()
      const { copyToClipboard } = require("@/lib/utils")

      ;(javaJsonHandler.javaToJson as jest.Mock).mockReturnValue({
        success: true,
        data: { result: '{"test": "value"}' },
      })

      render(<JavaJsonConverter />)

      const input = screen.getByPlaceholderText(/Java 클래스를 입력하세요/)
      await user.type(input, "public class Test { }")

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(screen.getByText(/변환 성공/)).toBeInTheDocument()
      })

      const copyBtn = screen.getByText("복사")
      await user.click(copyBtn)

      expect(copyToClipboard).toHaveBeenCalled()
    })

    test("결과가 없을 때 복사 버튼 미표시", () => {
      render(<JavaJsonConverter />)

      expect(screen.queryByText("복사")).not.toBeInTheDocument()
    })
  })

  describe("초기화 기능 테스트", () => {
    test("초기화 버튼으로 모든 상태 리셋", async () => {
      const user = userEvent.setup()
      ;(javaJsonHandler.javaToJson as jest.Mock).mockReturnValue({
        success: true,
        data: { result: '{"test": "value"}' },
      })

      render(<JavaJsonConverter />)

      const input = screen.getByPlaceholderText(/Java 클래스를 입력하세요/)
      await user.type(input, "public class Test { }")

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
  })

  describe("예제 로드 테스트", () => {
    test("Java → JSON 예제 로드", async () => {
      const user = userEvent.setup()
      render(<JavaJsonConverter />)

      const exampleBtn = screen.getByText("📋 예제 로드")
      await user.click(exampleBtn)

      const input = screen.getByPlaceholderText(/Java 클래스를 입력하세요/)
      expect((input as HTMLTextAreaElement).value).toContain("public class User")
    })

    test("JSON → Java 예제 로드", async () => {
      const user = userEvent.setup()
      render(<JavaJsonConverter />)

      const jsonToJavaBtn = screen.getAllByText("JSON → Java")[1]
      await user.click(jsonToJavaBtn)

      const exampleBtn = screen.getByText("📋 예제 로드")
      await user.click(exampleBtn)

      const input = screen.getByPlaceholderText(/JSON을 입력하세요/)
      expect((input as HTMLTextAreaElement).value).toContain('"name"')
    })
  })

  describe("에러 처리 테스트", () => {
    test("변환 중 에러 상태 표시", async () => {
      const user = userEvent.setup()
      ;(javaJsonHandler.javaToJson as jest.Mock).mockReturnValue({
        success: false,
        error: "구문 오류",
        details: "클래스 선언이 불완전합니다",
      })

      render(<JavaJsonConverter />)

      const input = screen.getByPlaceholderText(/Java 클래스를 입력하세요/)
      await user.type(input, "public class {")

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(screen.getByText("구문 오류")).toBeInTheDocument()
        expect(screen.queryByText(/변환 성공/)).not.toBeInTheDocument()
      })
    })

    test("에러 메시지 상세 내용 표시", async () => {
      const user = userEvent.setup()
      ;(javaJsonHandler.javaToJson as jest.Mock).mockReturnValue({
        success: false,
        error: "Java 클래스 파싱 실패",
      })

      render(<JavaJsonConverter />)

      const input = screen.getByPlaceholderText(/Java 클래스를 입력하세요/)
      await user.type(input, "not a valid class")

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(screen.getByText("Java 클래스 파싱 실패")).toBeInTheDocument()
      })
    })
  })

  describe("로딩 상태 테스트", () => {
    test("변환 중 버튼 비활성화", async () => {
      const user = userEvent.setup()
      ;(javaJsonHandler.javaToJson as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ success: true, data: { result: "{}" } }),
              1000
            )
          )
      )

      render(<JavaJsonConverter />)

      const input = screen.getByPlaceholderText(/Java 클래스를 입력하세요/)
      await user.type(input, "public class Test { }")

      const convertBtn = screen.getByText("변환")
      await user.click(convertBtn)

      await waitFor(() => {
        expect(convertBtn).toBeDisabled()
      })
    })
  })
})
