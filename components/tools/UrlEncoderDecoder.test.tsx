import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UrlEncoderDecoder } from "./UrlEncoderDecoder";
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

describe("UrlEncoderDecoder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("컴포넌트가 렌더링되어야 함", () => {
    render(<UrlEncoderDecoder />);
    expect(screen.getByText("URL Encode")).toBeInTheDocument();
    expect(screen.getByText("URL Decode")).toBeInTheDocument();
    expect(screen.getByText("Query Parser")).toBeInTheDocument();
  });

  test("인코딩 기능 테스트", async () => {
    render(<UrlEncoderDecoder />);
    const input = screen.getByPlaceholderText("인코딩할 텍스트를 입력하세요...");
    const button = screen.getByRole("button", { name: /Encode/i });

    await userEvent.type(input, "Hello World");
    fireEvent.click(button);

    expect(screen.getByText("Hello%20World")).toBeInTheDocument();
  });

  test("디코딩 기능 테스트", async () => {
    render(<UrlEncoderDecoder />);
    // 탭 전환
    await userEvent.click(screen.getByText("URL Decode"));

    const input = await screen.findByPlaceholderText("디코딩할 URL을 입력하세요...");
    const button = screen.getByRole("button", { name: /Decode/i });

    await userEvent.type(input, "Hello%20World");
    await userEvent.click(button);

    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  test("Query Parser 기능 테스트", async () => {
    render(<UrlEncoderDecoder />);
    // 탭 전환
    await userEvent.click(screen.getByText("Query Parser"));

    const input = await screen.findByPlaceholderText("파싱할 URL 또는 쿼리 스트링을 입력하세요...");
    const button = screen.getByRole("button", { name: /Parse/i });

    await userEvent.type(input, "name=John&age=30");
    await userEvent.click(button);

    expect(screen.getByText("name")).toBeInTheDocument();
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("age")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
  });

  test("공백을 +로 변환 옵션 테스트", async () => {
    render(<UrlEncoderDecoder />);
    const input = screen.getByPlaceholderText("인코딩할 텍스트를 입력하세요...");
    const switchControl = screen.getByLabelText("공백을 +로 변환");
    const button = screen.getByRole("button", { name: /Encode/i });

    await userEvent.click(switchControl);
    await userEvent.type(input, "Hello World");
    fireEvent.click(button);

    expect(screen.getByText("Hello+World")).toBeInTheDocument();
  });

  test("초기화 버튼 테스트", async () => {
    render(<UrlEncoderDecoder />);
    const input = screen.getByPlaceholderText("인코딩할 텍스트를 입력하세요...");
    const resetButton = screen.getByRole("button", { name: "초기화" });

    await userEvent.type(input, "Hello");
    fireEvent.click(resetButton);

    expect(input).toHaveValue("");
  });
});
