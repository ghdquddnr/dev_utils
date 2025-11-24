import { REDIS_PATTERNS, generateRedisCommand, validateVariables } from "./redis-patterns";

describe("Redis Key Pattern Scanner", () => {
    const userProfilePattern = REDIS_PATTERNS.find(p => p.id === "user-profile")!;
    const sessionPattern = REDIS_PATTERNS.find(p => p.id === "user-session")!;

    describe("validateVariables", () => {
        test("모든 변수가 올바르게 입력되었을 때 true 반환", () => {
            const isValid = validateVariables(userProfilePattern, { userId: "123" });
            expect(isValid).toBe(true);
        });

        test("필수 변수가 누락되었을 때 false 반환", () => {
            const isValid = validateVariables(userProfilePattern, {});
            expect(isValid).toBe(false);
        });

        test("숫자 타입 변수에 숫자가 아닌 값이 입력되었을 때 false 반환", () => {
            const isValid = validateVariables(userProfilePattern, { userId: "abc" });
            expect(isValid).toBe(false);
        });
    });

    describe("generateRedisCommand", () => {
        test("Hash 타입 패턴에 대해 HGETALL 명령어 생성", () => {
            const result = generateRedisCommand(userProfilePattern, { userId: "123" });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.command).toBe("HGETALL user:123:profile");
                expect(result.data.key).toBe("user:123:profile");
            }
        });

        test("String 타입 패턴에 대해 GET 명령어 생성", () => {
            const result = generateRedisCommand(sessionPattern, { sessionId: "abc-123" });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.command).toBe("GET session:abc-123");
            }
        });

        test("유효하지 않은 변수 입력 시 에러 반환", () => {
            const result = generateRedisCommand(userProfilePattern, { userId: "abc" });
            expect(result.success).toBe(false);
        });
    });
});
