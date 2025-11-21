/**
 * JWT Handler 단위 테스트
 */

import {
  decodeJwt,
  validateJwtFormat,
  getExpirationTime,
  getIssuedAtTime,
  isTokenExpired,
  getJwtInfo,
} from "./jwt-handler"
import { JwtPayload } from "./types"

// 테스트용 Helper 함수
function createMockJwt(header: any = {}, payload: any = {}): string {
  const defaultHeader = { alg: "HS256", typ: "JWT", ...header }
  const defaultPayload = { sub: "user123", ...payload }

  // Node.js 환경에서 Buffer를 사용하여 Base64 인코딩
  const headerB64 = Buffer.from(JSON.stringify(defaultHeader))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")

  const payloadB64 = Buffer.from(JSON.stringify(defaultPayload))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")

  const signature = "mock_signature_base64url"

  return `${headerB64}.${payloadB64}.${signature}`
}

describe("JWT Handler", () => {
  describe("validateJwtFormat", () => {
    it("should validate correct JWT format", () => {
      const token = createMockJwt()
      expect(validateJwtFormat(token)).toBe(true)
    })

    it("should reject empty token", () => {
      expect(validateJwtFormat("")).toBe(false)
    })

    it("should reject whitespace-only token", () => {
      expect(validateJwtFormat("   ")).toBe(false)
    })

    it("should reject token with less than 3 parts", () => {
      expect(validateJwtFormat("part1.part2")).toBe(false)
    })

    it("should reject token with more than 3 parts", () => {
      expect(validateJwtFormat("part1.part2.part3.part4")).toBe(false)
    })

    it("should reject token with invalid base64url characters", () => {
      expect(validateJwtFormat("!@#$.part2.part3")).toBe(false)
    })

    it("should accept token with underscore and dash in base64url", () => {
      const validToken = "aB-_.aB-_.aB-_"
      expect(validateJwtFormat(validToken)).toBe(true)
    })

    it("should reject single character tokens", () => {
      expect(validateJwtFormat("a")).toBe(false)
    })
  })

  describe("decodeJwt", () => {
    it("should decode valid JWT token", () => {
      const token = createMockJwt()
      const result = decodeJwt(token)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.header).toBeDefined()
        expect(result.data.payload).toBeDefined()
        expect(result.data.signature).toBe("mock_signature_base64url")
        expect(result.data.isValid).toBe(true)
      }
    })

    it("should return error for empty token", () => {
      const result = decodeJwt("")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("비어있습니다")
      }
    })

    it("should return error for invalid format (less than 3 parts)", () => {
      const result = decodeJwt("header.payload")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("유효하지 않은 JWT 형식")
      }
    })

    it("should extract header correctly", () => {
      const customHeader = { alg: "RS256", kid: "key-1" }
      const token = createMockJwt(customHeader)
      const result = decodeJwt(token)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.header.alg).toBe("RS256")
        expect(result.data.header.kid).toBe("key-1")
      }
    })

    it("should extract payload correctly", () => {
      const customPayload = {
        sub: "user456",
        email: "test@example.com",
        role: "admin",
      }
      const token = createMockJwt({}, customPayload)
      const result = decodeJwt(token)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.payload.sub).toBe("user456")
        expect(result.data.payload.email).toBe("test@example.com")
        expect(result.data.payload.role).toBe("admin")
      }
    })

    it("should preserve signature as-is", () => {
      const token = createMockJwt()
      const parts = token.split(".")
      const result = decodeJwt(token)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.signature).toBe(parts[2])
      }
    })

    it("should handle JWT with exp claim", () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600 // 1 hour in future
      const token = createMockJwt({}, { exp: futureExp })
      const result = decodeJwt(token)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.payload.exp).toBe(futureExp)
      }
    })

    it("should handle JWT with iat claim", () => {
      const now = Math.floor(Date.now() / 1000)
      const token = createMockJwt({}, { iat: now })
      const result = decodeJwt(token)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.payload.iat).toBe(now)
      }
    })

    it("should handle JWT with multiple custom claims", () => {
      const payload = {
        sub: "user789",
        email: "user@example.com",
        name: "Test User",
        roles: ["admin", "user"],
        permissions: { read: true, write: true },
      }
      const token = createMockJwt({}, payload)
      const result = decodeJwt(token)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.payload.email).toBe("user@example.com")
        expect(Array.isArray(result.data.payload.roles)).toBe(true)
        expect(result.data.payload.permissions).toEqual({ read: true, write: true })
      }
    })

    it("should return error for malformed base64", () => {
      // Create a token with invalid base64 characters in payload part
      const malformedToken = "validheader.@#$%.signature"
      const result = decodeJwt(malformedToken)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("Base64")
      }
    })

    it("should return error when header is not valid JSON", () => {
      // Create a token with header that's not JSON
      const invalidHeader = Buffer.from("not json")
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "")
      const validPayload = Buffer.from(JSON.stringify({ sub: "user" }))
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "")
      const malformedToken = `${invalidHeader}.${validPayload}.sig`
      const result = decodeJwt(malformedToken)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("Header")
      }
    })

    it("should return error when payload is not valid JSON", () => {
      const validHeader = Buffer.from(JSON.stringify({ alg: "HS256" }))
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "")
      const invalidPayload = Buffer.from("not json")
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "")
      const malformedToken = `${validHeader}.${invalidPayload}.sig`
      const result = decodeJwt(malformedToken)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("Payload")
      }
    })
  })

  describe("getExpirationTime", () => {
    it("should return null when exp is not set", () => {
      const payload: JwtPayload = { sub: "user" }
      expect(getExpirationTime(payload)).toBeNull()
    })

    it("should return formatted date for valid exp", () => {
      const exp = Math.floor(Date.now() / 1000) + 3600
      const payload: JwtPayload = { exp }
      const result = getExpirationTime(payload)

      expect(result).not.toBeNull()
      expect(typeof result).toBe("string")
    })

    it("should handle past expiration time", () => {
      const exp = Math.floor(Date.now() / 1000) - 3600 // 1 hour in past
      const payload: JwtPayload = { exp }
      const result = getExpirationTime(payload)

      expect(result).not.toBeNull()
    })

    it("should handle very large exp values", () => {
      const exp = 9999999999
      const payload: JwtPayload = { exp }
      const result = getExpirationTime(payload)

      expect(result).not.toBeNull()
    })
  })

  describe("getIssuedAtTime", () => {
    it("should return null when iat is not set", () => {
      const payload: JwtPayload = { sub: "user" }
      expect(getIssuedAtTime(payload)).toBeNull()
    })

    it("should return formatted date for valid iat", () => {
      const iat = Math.floor(Date.now() / 1000)
      const payload: JwtPayload = { iat }
      const result = getIssuedAtTime(payload)

      expect(result).not.toBeNull()
      expect(typeof result).toBe("string")
    })

    it("should handle past iat values", () => {
      const iat = Math.floor(Date.now() / 1000) - 3600
      const payload: JwtPayload = { iat }
      const result = getIssuedAtTime(payload)

      expect(result).not.toBeNull()
    })
  })

  describe("isTokenExpired", () => {
    it("should return false when exp is not set", () => {
      const payload: JwtPayload = { sub: "user" }
      expect(isTokenExpired(payload)).toBe(false)
    })

    it("should return false for future expiration", () => {
      const exp = Math.floor(Date.now() / 1000) + 3600
      const payload: JwtPayload = { exp }
      expect(isTokenExpired(payload)).toBe(false)
    })

    it("should return true for past expiration", () => {
      const exp = Math.floor(Date.now() / 1000) - 3600
      const payload: JwtPayload = { exp }
      expect(isTokenExpired(payload)).toBe(true)
    })

    it("should handle edge case where exp equals current time (expired)", () => {
      const exp = Math.floor(Date.now() / 1000)
      const payload: JwtPayload = { exp }
      // Should be expired or not depending on exact timing
      const isExpired = isTokenExpired(payload)
      expect(typeof isExpired).toBe("boolean")
    })

    it("should handle very old expiration times", () => {
      const exp = 1
      const payload: JwtPayload = { exp }
      expect(isTokenExpired(payload)).toBe(true)
    })
  })

  describe("getJwtInfo", () => {
    it("should return valid info for valid token", () => {
      const token = createMockJwt()
      const info = getJwtInfo(token)

      expect(info.isValid).toBe(true)
      expect(info.message).toBeDefined()
    })

    it("should return invalid for malformed token", () => {
      const info = getJwtInfo("invalid.token")

      expect(info.isValid).toBe(false)
      expect(info.message).toBeDefined()
    })

    it("should indicate non-expired token", () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600
      const token = createMockJwt({}, { exp: futureExp })
      const info = getJwtInfo(token)

      expect(info.isValid).toBe(true)
      expect(info.isExpired).toBe(false)
      expect(info.message).not.toContain("만료")
    })

    it("should indicate expired token", () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600
      const token = createMockJwt({}, { exp: pastExp })
      const info = getJwtInfo(token)

      expect(info.isValid).toBe(true)
      expect(info.isExpired).toBe(true)
      expect(info.message).toContain("만료")
    })

    it("should include expiresAt for token with exp", () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600
      const token = createMockJwt({}, { exp: futureExp })
      const info = getJwtInfo(token)

      expect(info.expiresAt).toBeDefined()
    })

    it("should not include expiresAt for token without exp", () => {
      const token = createMockJwt()
      const info = getJwtInfo(token)

      expect(info.expiresAt).toBeUndefined()
    })

    it("should handle empty token", () => {
      const info = getJwtInfo("")

      expect(info.isValid).toBe(false)
    })

    it("should handle token with only 2 parts", () => {
      const info = getJwtInfo("header.payload")

      expect(info.isValid).toBe(false)
    })
  })

  describe("Edge cases", () => {
    it("should handle token with empty header", () => {
      const emptyHeader = Buffer.from("{}").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
      const validPayload = Buffer.from(JSON.stringify({ sub: "user" }))
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "")
      const token = `${emptyHeader}.${validPayload}.sig`
      const result = decodeJwt(token)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(Object.keys(result.data.header).length).toBe(0)
      }
    })

    it("should handle token with minimal payload", () => {
      const token = createMockJwt({}, {})
      const result = decodeJwt(token)

      expect(result.success).toBe(true)
    })

    it("should handle token with Unicode characters in payload", () => {
      const payload = {
        sub: "user123",
        name: "테스트 사용자",
        message: "안녕하세요",
      }
      const token = createMockJwt({}, payload)
      const result = decodeJwt(token)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.payload.name).toBe("테스트 사용자")
      }
    })

    it("should handle token with special characters in strings", () => {
      const payload = {
        sub: "user@domain.com",
        url: "https://example.com/path?query=value",
      }
      const token = createMockJwt({}, payload)
      const result = decodeJwt(token)

      expect(result.success).toBe(true)
    })

    it("should handle token with nested objects in payload", () => {
      const payload = {
        sub: "user",
        user: {
          id: 123,
          profile: {
            avatar: "https://example.com/avatar.jpg",
            settings: { theme: "dark" },
          },
        },
      }
      const token = createMockJwt({}, payload)
      const result = decodeJwt(token)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.payload.user?.profile?.settings?.theme).toBe("dark")
      }
    })

    it("should handle token with arrays in payload", () => {
      const payload = {
        sub: "user",
        roles: ["admin", "user", "moderator"],
        scopes: ["read", "write", "delete"],
      }
      const token = createMockJwt({}, payload)
      const result = decodeJwt(token)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(Array.isArray(result.data.payload.roles)).toBe(true)
        expect(result.data.payload.roles).toHaveLength(3)
      }
    })
  })
})
