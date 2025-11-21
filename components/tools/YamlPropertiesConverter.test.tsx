/**
 * YAML ↔ Properties 변환기 컴포넌트 테스트
 */

import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { YamlPropertiesConverter } from "./YamlPropertiesConverter"

// Mock the lucide-react icons
jest.mock("lucide-react", () => ({
  AlertCircle: () => <div data-testid="alert-icon" />,
  CheckCircle2: () => <div data-testid="check-icon" />,
  Copy: () => <div data-testid="copy-icon" />,
  RotateCcw: () => <div data-testid="reset-icon" />,
  ArrowRightLeft: () => <div data-testid="arrow-icon" />,
}))

describe("YamlPropertiesConverter", () => {
  describe("Rendering", () => {
    test("컴포넌트가 정상적으로 렌더링됨", () => {
      render(<YamlPropertiesConverter />)
      expect(screen.getByText("YAML → Properties")).toBeInTheDocument()
      expect(screen.getByText("Properties → YAML")).toBeInTheDocument()
    })

    test("기본 모드는 YAML → Properties", () => {
      render(<YamlPropertiesConverter />)
      const button = screen.getByText("YAML → Properties") as HTMLButtonElement
      expect(button).toHaveAttribute("data-state", "active")
    })

    test("입력창에 placeholder가 표시됨", () => {
      render(<YamlPropertiesConverter />)
      const textarea = screen.getByPlaceholderText(/YAML을 입력하세요/)
      expect(textarea).toBeInTheDocument()
    })
  })

  describe("Mode Switching", () => {
    test("YAML → Properties 모드에서 Properties → YAML로 전환", async () => {
      render(<YamlPropertiesConverter />)
      const propertiesButton = screen.getByText("Properties → YAML")

      fireEvent.click(propertiesButton)

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/Properties를 입력하세요/)
        ).toBeInTheDocument()
      })
    })

    test("모드 전환 시 입력값과 결과 초기화", async () => {
      const { rerender } = render(<YamlPropertiesConverter />)

      const textarea = screen.getByPlaceholderText(/YAML을 입력하세요/) as HTMLTextAreaElement
      fireEvent.change(textarea, { target: { value: "test: value" } })

      expect(textarea.value).toBe("test: value")

      const propertiesButton = screen.getByText("Properties → YAML")
      fireEvent.click(propertiesButton)

      await waitFor(() => {
        const newTextarea = screen.getByPlaceholderText(
          /Properties를 입력하세요/
        ) as HTMLTextAreaElement
        expect(newTextarea.value).toBe("")
      })
    })
  })

  describe("YAML to Properties Conversion", () => {
    test("기본 YAML을 Properties로 변환", async () => {
      render(<YamlPropertiesConverter />)

      const textarea = screen.getByPlaceholderText(/YAML을 입력하세요/) as HTMLTextAreaElement
      const convertButton = screen.getByText("변환") as HTMLButtonElement

      fireEvent.change(textarea, {
        target: { value: "name: John\nage: 30" },
      })

      fireEvent.click(convertButton)

      await waitFor(() => {
        expect(screen.getByText("변환 성공")).toBeInTheDocument()
        expect(screen.getByText(/name=John/)).toBeInTheDocument()
        expect(screen.getByText(/age=30/)).toBeInTheDocument()
      })
    })

    test("빈 입력 시 에러 메시지 표시", async () => {
      render(<YamlPropertiesConverter />)

      const convertButton = screen.getByText("변환") as HTMLButtonElement
      fireEvent.click(convertButton)

      await waitFor(() => {
        expect(screen.getByText("변환 오류")).toBeInTheDocument()
        expect(screen.getByText(/YAML을 입력해주세요/)).toBeInTheDocument()
      })
    })

    test("유효하지 않은 YAML 시 에러 메시지 표시", async () => {
      render(<YamlPropertiesConverter />)

      const textarea = screen.getByPlaceholderText(/YAML을 입력하세요/) as HTMLTextAreaElement
      const convertButton = screen.getByText("변환") as HTMLButtonElement

      fireEvent.change(textarea, {
        target: { value: "invalid:\n  - item1\n  item2: wrong indent" },
      })

      fireEvent.click(convertButton)

      await waitFor(() => {
        expect(screen.getByText("변환 오류")).toBeInTheDocument()
      })
    })
  })

  describe("Properties to YAML Conversion", () => {
    test("기본 Properties를 YAML로 변환", async () => {
      render(<YamlPropertiesConverter />)

      const propertiesButton = screen.getByText("Properties → YAML")
      fireEvent.click(propertiesButton)

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(/Properties를 입력하세요/) as HTMLTextAreaElement
        const convertButton = screen.getByText("변환") as HTMLButtonElement

        fireEvent.change(textarea, {
          target: { value: "name=John\nage=30" },
        })

        fireEvent.click(convertButton)
      })

      await waitFor(() => {
        expect(screen.getByText("변환 성공")).toBeInTheDocument()
        expect(screen.getByText(/name: John/)).toBeInTheDocument()
        expect(screen.getByText(/age: 30/)).toBeInTheDocument()
      })
    })

    test("중첩 Properties를 YAML로 변환", async () => {
      render(<YamlPropertiesConverter />)

      const propertiesButton = screen.getByText("Properties → YAML")
      fireEvent.click(propertiesButton)

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(/Properties를 입력하세요/) as HTMLTextAreaElement
        const convertButton = screen.getByText("변환") as HTMLButtonElement

        fireEvent.change(textarea, {
          target: { value: "user.name=John\nuser.age=30" },
        })

        fireEvent.click(convertButton)
      })

      await waitFor(() => {
        expect(screen.getByText("변환 성공")).toBeInTheDocument()
        expect(screen.getByText(/user:/)).toBeInTheDocument()
        expect(screen.getByText(/name: John/)).toBeInTheDocument()
      })
    })
  })

  describe("Indentation Options", () => {
    test("2칸 들여쓰기 옵션 적용", async () => {
      render(<YamlPropertiesConverter />)

      const textarea = screen.getByPlaceholderText(/YAML을 입력하세요/) as HTMLTextAreaElement
      const convertButton = screen.getByText("변환") as HTMLButtonElement

      const twoSpaceButton = screen.getByText("2칸")
      expect(twoSpaceButton).toHaveAttribute("data-state", "active")

      fireEvent.change(textarea, {
        target: { value: "user:\n  name: John" },
      })

      fireEvent.click(convertButton)

      await waitFor(() => {
        expect(screen.getByText("변환 성공")).toBeInTheDocument()
      })
    })

    test("4칸 들여쓰기 옵션으로 전환", async () => {
      render(<YamlPropertiesConverter />)

      const fourSpaceButton = screen.getByText("4칸")
      fireEvent.click(fourSpaceButton)

      expect(fourSpaceButton).toHaveAttribute("data-state", "active")
    })
  })

  describe("Example Loading", () => {
    test("예제 로드 버튼 클릭 시 예제 입력", async () => {
      render(<YamlPropertiesConverter />)

      const loadButton = screen.getByText("📋 예제 로드")
      fireEvent.click(loadButton)

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(/YAML을 입력하세요/) as HTMLTextAreaElement
        expect(textarea.value).toContain("Application Configuration")
      })
    })

    test("Properties 모드에서 예제 로드 시 Properties 예제 로드", async () => {
      render(<YamlPropertiesConverter />)

      const propertiesButton = screen.getByText("Properties → YAML")
      fireEvent.click(propertiesButton)

      await waitFor(() => {
        const loadButton = screen.getByText("📋 예제 로드")
        fireEvent.click(loadButton)
      })

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(/Properties를 입력하세요/) as HTMLTextAreaElement
        expect(textarea.value).toContain("application.name=MyApp")
      })
    })
  })

  describe("Copy Functionality", () => {
    test("결과 복사 버튼이 표시됨", async () => {
      render(<YamlPropertiesConverter />)

      const textarea = screen.getByPlaceholderText(/YAML을 입력하세요/) as HTMLTextAreaElement
      const convertButton = screen.getByText("변환") as HTMLButtonElement

      fireEvent.change(textarea, {
        target: { value: "name: John" },
      })

      fireEvent.click(convertButton)

      await waitFor(() => {
        expect(screen.getByText("복사")).toBeInTheDocument()
      })
    })
  })

  describe("Reset Functionality", () => {
    test("초기화 버튼 클릭 시 모든 상태 초기화", async () => {
      render(<YamlPropertiesConverter />)

      const textarea = screen.getByPlaceholderText(/YAML을 입력하세요/) as HTMLTextAreaElement
      const convertButton = screen.getByText("변환") as HTMLButtonElement

      fireEvent.change(textarea, {
        target: { value: "name: John" },
      })

      fireEvent.click(convertButton)

      await waitFor(() => {
        expect(screen.getByText("변환 성공")).toBeInTheDocument()
      })

      const resetButton = screen.getByText("초기화")
      fireEvent.click(resetButton)

      await waitFor(() => {
        expect((textarea as HTMLTextAreaElement).value).toBe("")
        expect(screen.queryByText("변환 성공")).not.toBeInTheDocument()
      })
    })
  })

  describe("Error Handling", () => {
    test("변환 중 에러 발생 시 에러 메시지 표시", async () => {
      render(<YamlPropertiesConverter />)

      const textarea = screen.getByPlaceholderText(/YAML을 입력하세요/) as HTMLTextAreaElement
      const convertButton = screen.getByText("변환") as HTMLButtonElement

      fireEvent.change(textarea, {
        target: { value: "invalid: yaml: structure: here" },
      })

      fireEvent.click(convertButton)

      await waitFor(() => {
        expect(screen.getByText("변환 오류")).toBeInTheDocument()
      })
    })

    test("에러 발생 후 새로운 변환 시 에러 메시지 제거", async () => {
      render(<YamlPropertiesConverter />)

      const textarea = screen.getByPlaceholderText(/YAML을 입력하세요/) as HTMLTextAreaElement
      const convertButton = screen.getByText("변환") as HTMLButtonElement

      // 첫 번째: 에러 발생
      fireEvent.change(textarea, {
        target: { value: "invalid yaml" },
      })
      fireEvent.click(convertButton)

      await waitFor(() => {
        expect(screen.getByText("변환 오류")).toBeInTheDocument()
      })

      // 두 번째: 유효한 입력
      fireEvent.change(textarea, {
        target: { value: "name: John" },
      })
      fireEvent.click(convertButton)

      await waitFor(() => {
        expect(screen.getByText("변환 성공")).toBeInTheDocument()
        expect(screen.queryByText("변환 오류")).not.toBeInTheDocument()
      })
    })
  })

  describe("Conversion Button State", () => {
    test("입력이 없으면 변환 버튼 비활성화", () => {
      render(<YamlPropertiesConverter />)

      const convertButton = screen.getByText("변환") as HTMLButtonElement
      expect(convertButton).toBeDisabled()
    })

    test("입력이 있으면 변환 버튼 활성화", async () => {
      render(<YamlPropertiesConverter />)

      const textarea = screen.getByPlaceholderText(/YAML을 입력하세요/) as HTMLTextAreaElement
      fireEvent.change(textarea, {
        target: { value: "name: John" },
      })

      const convertButton = screen.getByText("변환") as HTMLButtonElement
      expect(convertButton).not.toBeDisabled()
    })
  })
})
