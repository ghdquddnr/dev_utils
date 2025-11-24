import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RedisKeyScanner } from "./RedisKeyScanner";
import userEvent from "@testing-library/user-event";

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

describe("RedisKeyScanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("컴포넌트가 렌더링되어야 함", () => {
    render(<RedisKeyScanner />);
    expect(screen.getByText("Redis Key Pattern Scanner")).toBeInTheDocument();
    expect(screen.getByText("패턴 선택")).toBeInTheDocument();
  });

  test("패턴 선택 시 변수 입력 폼이 표시되어야 함", async () => {
    render(<RedisKeyScanner />);
    
    // Select trigger 클릭
    const trigger = screen.getByRole("combobox");
    await userEvent.click(trigger);

    // 옵션 선택 (user-profile)
    const option = screen.getByText(/user:\{userId\}:profile/);
    await userEvent.click(option);

    // 변수 입력 폼 확인
    expect(screen.getByText("userId")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("사용자 ID")).toBeInTheDocument();
  });

  test("변수 입력 시 명령어가 생성되어야 함", async () => {
    render(<RedisKeyScanner />);
    
    // 패턴 선택
    const trigger = screen.getByRole("combobox");
    await userEvent.click(trigger);
    const option = screen.getByText(/user:\{userId\}:profile/);
    await userEvent.click(option);

    // 변수 입력
    const input = screen.getByPlaceholderText("사용자 ID");
    await userEvent.type(input, "123");

    // 명령어 생성 확인
    await waitFor(() => {
      expect(screen.getByText("HGETALL user:123:profile")).toBeInTheDocument();
    });
  });

  test("클립보드 복사 기능 테스트", async () => {
    render(<RedisKeyScanner />);
    
    // 패턴 선택 및 입력
    const trigger = screen.getByRole("combobox");
    await userEvent.click(trigger);
    const option = screen.getByText(/user:\{userId\}:profile/);
    await userEvent.click(option);
    const input = screen.getByPlaceholderText("사용자 ID");
    await userEvent.type(input, "123");

    // 복사 버튼 클릭
    const copyButton = await screen.findByRole("button", { name: "" }); // Icon button has no text
    await userEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("HGETALL user:123:profile");
  });
});
