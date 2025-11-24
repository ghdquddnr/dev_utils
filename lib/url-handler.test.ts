import { encodeUrl, decodeUrl, parseQueryString } from "./url-handler";

describe("url-handler", () => {
    describe("encodeUrl", () => {
        test("기본 인코딩 테스트", () => {
            const result = encodeUrl("Hello World");
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.result).toBe("Hello%20World");
                expect(result.data.type).toBe("encode");
            }
        });

        test("한글 인코딩 테스트", () => {
            const result = encodeUrl("안녕하세요");
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.result).toBe("%EC%95%88%EB%85%95%ED%95%98%EC%84%B8%EC%9A%94");
            }
        });

        test("특수문자 인코딩 테스트", () => {
            const result = encodeUrl("a&b=c?");
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.result).toBe("a%26b%3Dc%3F");
            }
        });

        test("공백을 +로 변환 옵션 테스트", () => {
            const result = encodeUrl("Hello World", { spaceAsPlus: true });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.result).toBe("Hello+World");
            }
        });

        test("빈 입력 에러 처리", () => {
            const result = encodeUrl("");
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe("입력값이 비어있습니다");
            }
        });
    });

    describe("decodeUrl", () => {
        test("기본 디코딩 테스트", () => {
            const result = decodeUrl("Hello%20World");
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.result).toBe("Hello World");
                expect(result.data.type).toBe("decode");
            }
        });

        test("한글 디코딩 테스트", () => {
            const result = decodeUrl("%EC%95%88%EB%85%95%ED%95%98%EC%84%B8%EC%9A%94");
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.result).toBe("안녕하세요");
            }
        });

        test("+ 기호 디코딩 테스트", () => {
            const result = decodeUrl("Hello+World");
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.result).toBe("Hello World");
            }
        });

        test("잘못된 인코딩 형식 에러 처리", () => {
            const result = decodeUrl("%");
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe("디코딩 실패");
            }
        });

        test("빈 입력 에러 처리", () => {
            const result = decodeUrl("");
            expect(result.success).toBe(false);
        });
    });

    describe("parseQueryString", () => {
        test("기본 쿼리 스트링 파싱", () => {
            const result = parseQueryString("name=John&age=30");
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.parameters).toEqual({
                    name: "John",
                    age: "30",
                });
            }
        });

        test("전체 URL에서 파싱", () => {
            const result = parseQueryString("https://example.com?q=hello&lang=ko");
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.parameters).toEqual({
                    q: "hello",
                    lang: "ko",
                });
            }
        });

        test("URL 인코딩된 값 파싱", () => {
            const result = parseQueryString("msg=Hello%20World");
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.parameters).toEqual({
                    msg: "Hello World",
                });
            }
        });

        test("파라미터 없는 URL", () => {
            const result = parseQueryString("https://example.com");
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.parameters).toEqual({});
            }
        });

        test("빈 입력 에러 처리", () => {
            const result = parseQueryString("");
            expect(result.success).toBe(false);
        });
    });
});
