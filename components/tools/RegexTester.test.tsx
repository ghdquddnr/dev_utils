import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RegexTester } from "./RegexTester";
import userEvent from "@testing-library/user-event";

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("RegexTester", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("렌더링 테스트", () => {
    test("컴포넌트가 렌더링되어야 함", () => {
      render(<RegexTester />);
      expect(screen.getByText("패턴 라이브러리")).toBeInTheDocument();
      expect(screen.getByText("RegEx 테스터")).toBeInTheDocument();
    });

    test("기본적으로 25개의 패턴을 표시해야 함", () => {
      render(<RegexTester />);
      expect(screen.getByText(/25개의 패턴이 발견되었습니다/)).toBeInTheDocument();
    });

    test("검색, 카테고리, 복잡도 필터가 표시되어야 함", () => {
      render(<RegexTester />);
      expect(screen.getByText("검색")).toBeInTheDocument();
      expect(screen.getByText("카테고리")).toBeInTheDocument();
      expect(screen.getByText("복잡도")).toBeInTheDocument();
    });

    test("테스터 입력 필드가 표시되어야 함", () => {
      render(<RegexTester />);
      expect(screen.getByPlaceholderText("정규식 패턴을 입력하세요...")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("플래그")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("테스트할 문자열을 입력하세요...")).toBeInTheDocument();
    });
  });

  describe("검색 기능 테스트", () => {
    test("검색어로 패턴을 필터링할 수 있어야 함", async () => {
      render(<RegexTester />);
      const searchInput = screen.getByPlaceholderText("패턴 이름, 설명으로 검색...");

      await userEvent.type(searchInput, "이메일");

      await waitFor(() => {
        const resultText = screen.getByText(/개의 패턴이 발견되었습니다/);
        expect(resultText).toBeInTheDocument();
      });
    });

    test("패턴 이름으로 검색할 수 있어야 함", async () => {
      render(<RegexTester />);
      const searchInput = screen.getByPlaceholderText("패턴 이름, 설명으로 검색...");

      await userEvent.type(searchInput, "전화번호");

      await waitFor(() => {
        expect(screen.getByText("전화번호 (한국)")).toBeInTheDocument();
      });
    });

    test("검색 결과가 없을 때 메시지를 표시해야 함", async () => {
      render(<RegexTester />);
      const searchInput = screen.getByPlaceholderText("패턴 이름, 설명으로 검색...");

      await userEvent.type(searchInput, "존재하지않는패턴xyz123");

      await waitFor(() => {
        expect(screen.getByText("0개의 패턴이 발견되었습니다")).toBeInTheDocument();
        expect(screen.getByText("검색 결과 없음")).toBeInTheDocument();
      });
    });
  });

  describe("필터 기능 테스트", () => {
    test("카테고리 필터를 적용할 수 있어야 함", async () => {
      render(<RegexTester />);

      // 카테고리 선택 버튼 클릭
      const categorySelects = screen.getAllByRole("combobox");
      const categorySelect = categorySelects[0];
      fireEvent.click(categorySelect);

      // validation 카테고리 선택
      await waitFor(() => {
        const validationOption = screen.getByRole("option", { name: "validation" });
        expect(validationOption).toBeInTheDocument();
      });
    });

    test("복잡도 필터를 적용할 수 있어야 함", async () => {
      render(<RegexTester />);

      // 복잡도 선택 버튼 클릭
      const complexitySelects = screen.getAllByRole("combobox");
      const complexitySelect = complexitySelects[1];
      fireEvent.click(complexitySelect);

      // basic 옵션이 표시되는지 확인
      await waitFor(() => {
        const basicOption = screen.getByRole("option", { name: "basic" });
        expect(basicOption).toBeInTheDocument();
      });
    });
  });

  describe("패턴 선택 및 테스트", () => {
    test("패턴을 클릭하면 테스터에 입력되어야 함", async () => {
      render(<RegexTester />);

      // 첫 번째 패턴 (이메일) 찾기
      const searchInput = screen.getByPlaceholderText("패턴 이름, 설명으로 검색...");
      await userEvent.type(searchInput, "이메일");

      await waitFor(() => {
        const emailPattern = screen.getByText("이메일 (기본)");
        expect(emailPattern).toBeInTheDocument();
      });

      // 패턴 카드 클릭
      const patternCard = screen.getByText("이메일 (기본)").closest("div[class*='cursor-pointer']");
      if (patternCard) {
        fireEvent.click(patternCard);

        await waitFor(() => {
          const patternInput = screen.getByPlaceholderText("정규식 패턴을 입력하세요...") as HTMLInputElement;
          expect(patternInput.value).toContain("@");
        });
      }
    });

    test("패턴 선택 시 상세 정보가 표시되어야 함", async () => {
      render(<RegexTester />);

      const searchInput = screen.getByPlaceholderText("패턴 이름, 설명으로 검색...");
      await userEvent.type(searchInput, "이메일");

      await waitFor(() => {
        const patternCard = screen.getByText("이메일 (기본)").closest("div[class*='cursor-pointer']");
        if (patternCard) {
          fireEvent.click(patternCard);
        }
      });

      await waitFor(() => {
        expect(screen.getByText("패턴")).toBeInTheDocument();
        expect(screen.getByText("예제")).toBeInTheDocument();
        expect(screen.getByText("✓ 유효한 예제")).toBeInTheDocument();
        expect(screen.getByText("✗ 유효하지 않은 예제")).toBeInTheDocument();
      });
    });

    test("예제를 로드할 수 있어야 함", async () => {
      render(<RegexTester />);

      const searchInput = screen.getByPlaceholderText("패턴 이름, 설명으로 검색...");
      await userEvent.type(searchInput, "이메일");

      await waitFor(() => {
        const patternCard = screen.getByText("이메일 (기본)").closest("div[class*='cursor-pointer']");
        if (patternCard) {
          fireEvent.click(patternCard);
        }
      });

      await waitFor(() => {
        // "로드" 버튼 찾기
        const loadButtons = screen.getAllByRole("button", { name: "로드" });
        expect(loadButtons.length).toBeGreaterThan(0);

        // 첫 번째 로드 버튼 클릭
        fireEvent.click(loadButtons[0]);
      });

      await waitFor(() => {
        const testStringInput = screen.getByPlaceholderText("테스트할 문자열을 입력하세요...") as HTMLTextAreaElement;
        expect(testStringInput.value.length).toBeGreaterThan(0);
      });
    });
  });

  describe("테스트 실행 기능", () => {
    test("유효한 패턴으로 테스트를 실행할 수 있어야 함", async () => {
      render(<RegexTester />);

      // 패턴 입력
      const patternInput = screen.getByPlaceholderText("정규식 패턴을 입력하세요...");
      await userEvent.type(patternInput, "\\d+");

      // 테스트 문자열 입력
      const testStringInput = screen.getByPlaceholderText("테스트할 문자열을 입력하세요...");
      await userEvent.type(testStringInput, "abc123def456");

      // 테스트 버튼 클릭
      const testButton = screen.getByRole("button", { name: /테스트/ });
      fireEvent.click(testButton);

      await waitFor(() => {
        expect(screen.getByText("매칭 성공")).toBeInTheDocument();
      });
    });

    test("매칭 실패 시 메시지를 표시해야 함", async () => {
      render(<RegexTester />);

      // 패턴 입력
      const patternInput = screen.getByPlaceholderText("정규식 패턴을 입력하세요...");
      await userEvent.type(patternInput, "^\\d+$");

      // 테스트 문자열 입력 (숫자가 아님)
      const testStringInput = screen.getByPlaceholderText("테스트할 문자열을 입력하세요...");
      await userEvent.type(testStringInput, "abc");

      // 테스트 버튼 클릭
      const testButton = screen.getByRole("button", { name: /테스트/ });
      fireEvent.click(testButton);

      await waitFor(() => {
        expect(screen.getByText("매칭 실패")).toBeInTheDocument();
        expect(screen.getByText("매칭되는 패턴이 없습니다")).toBeInTheDocument();
      });
    });

    test("전역 플래그로 여러 매칭을 찾아야 함", async () => {
      render(<RegexTester />);

      // 패턴 입력
      const patternInput = screen.getByPlaceholderText("정규식 패턴을 입력하세요...");
      await userEvent.type(patternInput, "\\d+");

      // 플래그 입력
      const flagsInput = screen.getByPlaceholderText("플래그");
      await userEvent.type(flagsInput, "g");

      // 테스트 문자열 입력
      const testStringInput = screen.getByPlaceholderText("테스트할 문자열을 입력하세요...");
      await userEvent.type(testStringInput, "abc 123 def 456 ghi 789");

      // 테스트 버튼 클릭
      const testButton = screen.getByRole("button", { name: /테스트/ });
      fireEvent.click(testButton);

      await waitFor(() => {
        expect(screen.getByText("매칭 성공")).toBeInTheDocument();
        expect(screen.getByText(/3개의 매칭이 발견되었습니다/)).toBeInTheDocument();
      });
    });

    test("빈 패턴으로 테스트 시 에러를 표시해야 함", async () => {
      render(<RegexTester />);

      // 테스트 문자열만 입력
      const testStringInput = screen.getByPlaceholderText("테스트할 문자열을 입력하세요...");
      await userEvent.type(testStringInput, "test");

      // 테스트 버튼 클릭
      const testButton = screen.getByRole("button", { name: /테스트/ });
      fireEvent.click(testButton);

      await waitFor(() => {
        expect(screen.getByText("에러")).toBeInTheDocument();
        expect(screen.getByText(/패턴을 입력해주세요/)).toBeInTheDocument();
      });
    });
  });

  describe("복사 기능 테스트", () => {
    test("패턴을 클립보드에 복사할 수 있어야 함", async () => {
      const { toast } = require("sonner");
      render(<RegexTester />);

      const searchInput = screen.getByPlaceholderText("패턴 이름, 설명으로 검색...");
      await userEvent.type(searchInput, "이메일");

      await waitFor(() => {
        const patternCard = screen.getByText("이메일 (기본)").closest("div[class*='cursor-pointer']");
        if (patternCard) {
          fireEvent.click(patternCard);
        }
      });

      await waitFor(() => {
        // 패턴 복사 버튼 찾기
        const copyButtons = screen.getAllByRole("button");
        const patternCopyButton = copyButtons.find(button =>
          button.closest('div')?.textContent?.includes("패턴") &&
          button.querySelector('svg')
        );

        if (patternCopyButton) {
          fireEvent.click(patternCopyButton);
          expect(navigator.clipboard.writeText).toHaveBeenCalled();
          expect(toast.success).toHaveBeenCalled();
        }
      });
    });
  });

  describe("초기화 기능 테스트", () => {
    test("초기화 버튼이 입력을 초기화해야 함", async () => {
      render(<RegexTester />);

      // 패턴 입력
      const patternInput = screen.getByPlaceholderText("정규식 패턴을 입력하세요...") as HTMLInputElement;
      await userEvent.type(patternInput, "test");

      // 테스트 문자열 입력
      const testStringInput = screen.getByPlaceholderText("테스트할 문자열을 입력하세요...") as HTMLTextAreaElement;
      await userEvent.type(testStringInput, "test string");

      // 초기화 버튼 클릭
      const resetButton = screen.getByRole("button", { name: "초기화" });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(patternInput.value).toBe("");
        expect(testStringInput.value).toBe("");
      });
    });
  });

  describe("언어 전환 테스트", () => {
    test("JavaScript와 Java 코드 예제를 전환할 수 있어야 함", async () => {
      render(<RegexTester />);

      const searchInput = screen.getByPlaceholderText("패턴 이름, 설명으로 검색...");
      await userEvent.type(searchInput, "이메일");

      await waitFor(() => {
        const patternCard = screen.getByText("이메일 (기본)").closest("div[class*='cursor-pointer']");
        if (patternCard) {
          fireEvent.click(patternCard);
        }
      });

      await waitFor(() => {
        expect(screen.getByText("사용 예제 코드")).toBeInTheDocument();
        const jsButton = screen.getByRole("button", { name: /JavaScript/i });
        expect(jsButton).toBeInTheDocument();
      });

      // Java 버튼이 있으면 클릭
      await waitFor(() => {
        const javaButton = screen.queryByRole("button", { name: "Java" });
        if (javaButton) {
          fireEvent.click(javaButton);
          expect(javaButton).toBeInTheDocument();
        }
      });
    });
  });

  describe("통합 테스트", () => {
    test("전체 워크플로우가 동작해야 함", async () => {
      render(<RegexTester />);

      // 1. 패턴 검색
      const searchInput = screen.getByPlaceholderText("패턴 이름, 설명으로 검색...");
      await userEvent.type(searchInput, "이메일");

      // 2. 패턴 선택
      await waitFor(() => {
        const patternCard = screen.getByText("이메일 (기본)").closest("div[class*='cursor-pointer']");
        if (patternCard) {
          fireEvent.click(patternCard);
        }
      });

      // 3. 예제 로드
      await waitFor(() => {
        const loadButtons = screen.getAllByRole("button", { name: "로드" });
        if (loadButtons.length > 0) {
          fireEvent.click(loadButtons[0]);
        }
      });

      // 4. 테스트 실행
      await waitFor(() => {
        const testButton = screen.getByRole("button", { name: /테스트/ });
        fireEvent.click(testButton);
      });

      // 5. 결과 확인
      await waitFor(() => {
        expect(screen.getByText("매칭 성공")).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});
