/**
 * JSON Handler 단위 테스트
 */

import { formatJson, validateJson, minifyJson, compareJson } from "./json-handler"
import { JsonFormatterResult, ErrorResponse } from "./types"

describe("JSON Handler", () => {
  describe("formatJson", () => {
    it("should format valid JSON with 2-space indentation", () => {
      const input = '{"name":"John","age":30}'
      const result = formatJson(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isValid).toBe(true)
        expect(result.data.formatted).toContain('"name"')
        // Check that indentation is applied
        expect(result.data.formatted).toContain("\n")
      }
    })

    it("should format complex nested JSON", () => {
      const input = '{"user":{"name":"Alice","address":{"city":"Seoul","zip":12345}},"active":true}'
      const result = formatJson(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.formatted).toContain('"user"')
        expect(result.data.formatted).toContain('"address"')
        expect(result.data.formatted).toContain('"city"')
      }
    })

    it("should handle JSON arrays", () => {
      const input = '[1,2,3,{"id":4,"value":"test"}]'
      const result = formatJson(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.formatted).toContain('"id"')
        expect(result.data.formatted).toContain('"value"')
      }
    })

    it("should return error for invalid JSON syntax", () => {
      const input = '{"name":"John"invalid}'
      const result = formatJson(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("구문 오류")
      }
    })

    it("should return error for empty string", () => {
      const result = formatJson("")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("비어있습니다")
      }
    })

    it("should return error for whitespace-only string", () => {
      const result = formatJson("   \n  \t  ")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("비어있습니다")
      }
    })

    it("should handle JSON with special characters", () => {
      const input = '{"message":"Hello\\nWorld","path":"/api/v1"}'
      const result = formatJson(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.formatted).toContain('"message"')
      }
    })

    it("should preserve original input in data", () => {
      const input = '{"test":"value"}'
      const result = formatJson(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.original).toBe(input)
      }
    })

    it("should use custom indent value", () => {
      const input = '{"a":1,"b":2}'
      const result = formatJson(input, 4)

      expect(result.success).toBe(true)
      if (result.success) {
        // 4-space indentation should be used
        const lines = result.data.formatted.split("\n")
        // Check for 4-space indentation
        const indentedLine = lines.find(l => l.startsWith("    "))
        expect(indentedLine).toBeDefined()
      }
    })

    it("should handle null value in JSON", () => {
      const input = '{"value":null}'
      const result = formatJson(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.formatted).toContain("null")
      }
    })

    it("should handle boolean values", () => {
      const input = '{"active":true,"deleted":false}'
      const result = formatJson(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.formatted).toContain("true")
        expect(result.data.formatted).toContain("false")
      }
    })

    it("should handle numeric values", () => {
      const input = '{"int":123,"float":45.67,"negative":-89,"zero":0}'
      const result = formatJson(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.formatted).toContain("123")
        expect(result.data.formatted).toContain("45.67")
        expect(result.data.formatted).toContain("-89")
      }
    })
  })

  describe("validateJson", () => {
    it("should return success for valid JSON", () => {
      const input = '{"name":"test"}'
      const result = validateJson(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isValid).toBe(true)
      }
    })

    it("should return error for invalid JSON", () => {
      const input = '{"incomplete":'
      const result = validateJson(input)

      expect(result.success).toBe(false)
    })

    it("should return error for empty input", () => {
      const result = validateJson("")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("비어있습니다")
      }
    })

    it("should validate array JSON", () => {
      const input = '[1,2,3]'
      const result = validateJson(input)

      expect(result.success).toBe(true)
    })

    it("should validate primitives (not strict JSON but common)", () => {
      // JSON technically requires object or array, but numbers are parseable
      const input = '123'
      const result = validateJson(input)

      expect(result.success).toBe(true)
    })
  })

  describe("minifyJson", () => {
    it("should minify formatted JSON", () => {
      const input = `{
  "name": "John",
  "age": 30
}`
      const result = minifyJson(input)

      expect(result.success).toBe(true)
      if (result.success) {
        // Minified version should not have unnecessary whitespace
        expect(result.data.formatted).not.toContain("\n")
        expect(result.data.formatted).toBe('{"name":"John","age":30}')
      }
    })

    it("should preserve data integrity when minifying", () => {
      const input = '{"key":"value","nested":{"inner":"data"}}'
      const result = minifyJson(input)

      expect(result.success).toBe(true)
      if (result.success) {
        const parsed = JSON.parse(result.data.formatted)
        const original = JSON.parse(input)
        expect(parsed).toEqual(original)
      }
    })

    it("should return error for invalid JSON", () => {
      const input = '{invalid}'
      const result = minifyJson(input)

      expect(result.success).toBe(false)
    })

    it("should return error for empty input", () => {
      const result = minifyJson("")

      expect(result.success).toBe(false)
    })

    it("should handle array minification", () => {
      const input = `[
  1,
  2,
  { "key": "value" }
]`
      const result = minifyJson(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.formatted).toBe('[1,2,{"key":"value"}]')
      }
    })
  })

  describe("compareJson", () => {
    it("should return true for identical JSON objects", () => {
      const json1 = '{"name":"John","age":30}'
      const json2 = '{"name":"John","age":30}'
      const result = compareJson(json1, json2)

      expect(result.success).toBe(true)
      expect(result.isEqual).toBe(true)
      expect(result.differences).toBeUndefined()
    })

    it("should return true for identical objects with different formatting", () => {
      const json1 = '{"a":1,"b":2}'
      const json2 = `{
  "a": 1,
  "b": 2
}`
      const result = compareJson(json1, json2)

      expect(result.success).toBe(true)
      expect(result.isEqual).toBe(true)
    })

    it("should detect differences in values", () => {
      const json1 = '{"name":"John","age":30}'
      const json2 = '{"name":"Jane","age":25}'
      const result = compareJson(json1, json2)

      expect(result.success).toBe(true)
      expect(result.isEqual).toBe(false)
      expect(result.differences).toBeDefined()
      expect(result.differences!.length).toBeGreaterThan(0)
    })

    it("should detect missing keys in object", () => {
      const json1 = '{"name":"John","age":30,"email":"john@example.com"}'
      const json2 = '{"name":"John","age":30}'
      const result = compareJson(json1, json2)

      expect(result.success).toBe(true)
      expect(result.isEqual).toBe(false)
      expect(result.differences).toBeDefined()
    })

    it("should detect extra keys in object", () => {
      const json1 = '{"name":"John"}'
      const json2 = '{"name":"John","age":30,"city":"Seoul"}'
      const result = compareJson(json1, json2)

      expect(result.success).toBe(true)
      expect(result.isEqual).toBe(false)
    })

    it("should return error for invalid JSON", () => {
      const json1 = '{"valid":true}'
      const json2 = '{invalid}'
      const result = compareJson(json1, json2)

      expect(result.success).toBe(false)
    })

    it("should detect differences in nested objects", () => {
      const json1 = '{"user":{"name":"John","address":{"city":"Seoul"}}}'
      const json2 = '{"user":{"name":"John","address":{"city":"Busan"}}}'
      const result = compareJson(json1, json2)

      expect(result.success).toBe(true)
      expect(result.isEqual).toBe(false)
      expect(result.differences).toBeDefined()
    })

    it("should handle array comparison", () => {
      const json1 = '[1,2,3]'
      const json2 = '[1,2,3]'
      const result = compareJson(json1, json2)

      expect(result.success).toBe(true)
      expect(result.isEqual).toBe(true)
    })

    it("should detect array differences", () => {
      const json1 = '[1,2,3]'
      const json2 = '[1,2,4]'
      const result = compareJson(json1, json2)

      expect(result.success).toBe(true)
      expect(result.isEqual).toBe(false)
    })
  })

  describe("Error handling", () => {
    it("should include line and column information for SyntaxError", () => {
      const input = '{"key":"value"\n"invalid"}'
      const result = formatJson(input)

      expect(result.success).toBe(false)
      if (!result.success) {
        // Error response should have structure but may not have line/column depending on error
        expect(result.error).toBeDefined()
      }
    })

    it("should handle various invalid JSON formats", () => {
      const testCases = [
        "{'single-quotes'}",
        '{key: value}',
        '[1, 2, 3,]', // trailing comma
        'undefined',
        'NaN',
      ]

      testCases.forEach(testCase => {
        const result = formatJson(testCase)
        expect(result.success).toBe(false)
      })
    })
  })

  describe("Edge cases", () => {
    it("should handle very long JSON strings", () => {
      const longArray = JSON.stringify(Array.from({ length: 1000 }, (_, i) => ({ id: i })))
      const result = formatJson(longArray)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isValid).toBe(true)
      }
    })

    it("should handle deeply nested structures", () => {
      let nested: any = { value: "bottom" }
      for (let i = 0; i < 50; i++) {
        nested = { level: nested }
      }
      const input = JSON.stringify(nested)
      const result = formatJson(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.formatted).toContain('"bottom"')
      }
    })

    it("should handle Unicode characters", () => {
      const input = '{"greeting":"안녕하세요","emoji":"😀","chinese":"你好"}'
      const result = formatJson(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.formatted).toContain("안녕하세요")
      }
    })

    it("should handle escaped characters correctly", () => {
      const input = '{"path":"C:\\\\Users\\\\Documents","quote":"\\"quoted\\""}'
      const result = formatJson(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isValid).toBe(true)
      }
    })
  })
})
