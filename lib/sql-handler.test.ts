/**
 * SQL Handler 단위 테스트
 */

import {
  bindSqlParameters,
  validateSqlBinding,
  countPlaceholders,
  getSqlExamples,
} from "./sql-handler"
import { SqlParameterType } from "./types"

describe("SQL Handler", () => {
  describe("bindSqlParameters", () => {
    it("should bind single parameter correctly", () => {
      const query = "SELECT * FROM users WHERE id = ?"
      const parameters = "[123]"
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.boundQuery).toBe("SELECT * FROM users WHERE id = 123")
        expect(result.data.parameterCount).toBe(1)
        expect(result.data.placeholderCount).toBe(1)
      }
    })

    it("should bind string parameter with quotes", () => {
      const query = "SELECT * FROM users WHERE name = ?"
      const parameters = '["admin"]'
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.boundQuery).toBe("SELECT * FROM users WHERE name = 'admin'")
      }
    })

    it("should bind multiple parameters", () => {
      const query = "INSERT INTO users (id, name, email) VALUES (?, ?, ?)"
      const parameters = '[1, "John", "john@example.com"]'
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.boundQuery).toContain("1")
        expect(result.data.boundQuery).toContain("'John'")
        expect(result.data.boundQuery).toContain("'john@example.com'")
        expect(result.data.parameterCount).toBe(3)
      }
    })

    it("should handle null parameter", () => {
      const query = "UPDATE users SET last_login = ? WHERE id = ?"
      const parameters = "[null, 123]"
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.boundQuery).toContain("NULL")
      }
    })

    it("should handle boolean true parameter", () => {
      const query = "UPDATE users SET active = ? WHERE id = ?"
      const parameters = "[true, 1]"
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.boundQuery).toContain("1")
      }
    })

    it("should handle boolean false parameter", () => {
      const query = "UPDATE users SET active = ? WHERE id = ?"
      const parameters = "[false, 2]"
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.boundQuery).toContain("0")
      }
    })

    it("should handle numeric parameters", () => {
      const query = "SELECT * FROM orders WHERE total > ? AND quantity < ?"
      const parameters = "[1000, 500]"
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.boundQuery).toContain("1000")
        expect(result.data.boundQuery).toContain("500")
      }
    })

    it("should handle negative numbers", () => {
      const query = "WHERE value = ?"
      const parameters = "[-42]"
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.boundQuery).toContain("-42")
      }
    })

    it("should handle floating point numbers", () => {
      const query = "WHERE price = ?"
      const parameters = "[99.99]"
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.boundQuery).toContain("99.99")
      }
    })

    it("should escape single quotes in string parameters", () => {
      const query = "INSERT INTO users (name) VALUES (?)"
      const parameters = '["O\'Brien"]'
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.boundQuery).toBe("INSERT INTO users (name) VALUES ('O''Brien')")
      }
    })

    it("should handle strings with multiple quotes", () => {
      const query = "UPDATE notes SET content = ? WHERE id = ?"
      const parameters = '["It\'s a \'quoted\' string", 1]'
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.boundQuery).toContain("''")
      }
    })

    it("should return error for empty query", () => {
      const result = bindSqlParameters("", "[1]")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("비어있습니다")
      }
    })

    it("should return error for empty parameters", () => {
      const result = bindSqlParameters("SELECT * FROM users WHERE id = ?", "")

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("비어있습니다")
      }
    })

    it("should return error for non-array JSON", () => {
      const result = bindSqlParameters("SELECT * FROM users", '{"key": "value"}')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("형식")
      }
    })

    it("should return error for invalid JSON", () => {
      const result = bindSqlParameters(
        "SELECT * FROM users WHERE id = ?",
        "[1, 2"
      )

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("JSON 파싱")
      }
    })

    it("should return error for parameter count mismatch (too many ?)", () => {
      const query = "SELECT * FROM users WHERE id = ? AND name = ?"
      const parameters = "[123]"
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("불일치")
      }
    })

    it("should return error for parameter count mismatch (too many params)", () => {
      const query = "SELECT * FROM users WHERE id = ?"
      const parameters = "[123, 456]"
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("불일치")
      }
    })

    it("should preserve original query", () => {
      const query = "SELECT * FROM users WHERE id = ?"
      const parameters = "[123]"
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.original).toBe(query)
      }
    })

    it("should handle query with special characters in strings", () => {
      const query = "INSERT INTO notes (content) VALUES (?)"
      const parameters = "[\"Line 1\\nLine 2\\tTabbed\"]"
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(true)
    })

    it("should handle complex INSERT statement", () => {
      const query = "INSERT INTO users (id, name, email, active) VALUES (?, ?, ?, ?)"
      const parameters = '[1, "Alice", "alice@example.com", true]'
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.boundQuery).toContain("'Alice'")
        expect(result.data.boundQuery).toContain("1")
      }
    })

    it("should handle complex UPDATE statement", () => {
      const query = "UPDATE users SET name = ?, age = ?, updated_at = ? WHERE id = ?"
      const parameters = '["Bob", 30, null, 5]'
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.boundQuery).toContain("'Bob'")
        expect(result.data.boundQuery).toContain("30")
        expect(result.data.boundQuery).toContain("NULL")
      }
    })

    it("should handle query with no parameters", () => {
      const query = "SELECT * FROM users"
      const parameters = "[]"
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.boundQuery).toBe(query)
        expect(result.data.parameterCount).toBe(0)
      }
    })

    it("should handle zero as parameter", () => {
      const query = "WHERE age = ?"
      const parameters = "[0]"
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.boundQuery).toContain("0")
      }
    })

    it("should handle empty string as parameter", () => {
      const query = "WHERE name = ?"
      const parameters = '[""]'
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.boundQuery).toContain("''")
      }
    })
  })

  describe("validateSqlBinding", () => {
    it("should validate matching parameter count", () => {
      const query = "SELECT * FROM users WHERE id = ? AND name = ?"
      const parameters: SqlParameterType[] = [1, "test"]
      const result = validateSqlBinding(query, parameters)

      expect(result.isValid).toBe(true)
      expect(result.parameterCount).toBe(2)
      expect(result.placeholderCount).toBe(2)
    })

    it("should detect parameter count mismatch", () => {
      const query = "SELECT * FROM users WHERE id = ? AND name = ?"
      const parameters: SqlParameterType[] = [1]
      const result = validateSqlBinding(query, parameters)

      expect(result.isValid).toBe(false)
      expect(result.parameterCount).toBe(1)
      expect(result.placeholderCount).toBe(2)
    })

    it("should return message for valid binding", () => {
      const query = "WHERE id = ?"
      const parameters: SqlParameterType[] = [1]
      const result = validateSqlBinding(query, parameters)

      expect(result.message).toContain("일치")
    })

    it("should return message for invalid binding", () => {
      const query = "WHERE id = ? AND name = ?"
      const parameters: SqlParameterType[] = [1]
      const result = validateSqlBinding(query, parameters)

      expect(result.message).toContain("불일치")
    })

    it("should handle empty query", () => {
      const query = ""
      const parameters: SqlParameterType[] = []
      const result = validateSqlBinding(query, parameters)

      expect(result.isValid).toBe(true)
      expect(result.placeholderCount).toBe(0)
    })

    it("should handle query with no parameters", () => {
      const query = "SELECT * FROM users"
      const parameters: SqlParameterType[] = []
      const result = validateSqlBinding(query, parameters)

      expect(result.isValid).toBe(true)
    })
  })

  describe("countPlaceholders", () => {
    it("should count single placeholder", () => {
      const query = "WHERE id = ?"
      expect(countPlaceholders(query)).toBe(1)
    })

    it("should count multiple placeholders", () => {
      const query = "WHERE id = ? AND name = ? AND age = ?"
      expect(countPlaceholders(query)).toBe(3)
    })

    it("should return 0 for query without placeholders", () => {
      const query = "SELECT * FROM users"
      expect(countPlaceholders(query)).toBe(0)
    })

    it("should handle empty query", () => {
      expect(countPlaceholders("")).toBe(0)
    })

    it("should count placeholders in INSERT statement", () => {
      const query = "INSERT INTO users (id, name, email) VALUES (?, ?, ?)"
      expect(countPlaceholders(query)).toBe(3)
    })

    it("should count placeholders in DELETE statement", () => {
      const query = "DELETE FROM users WHERE id = ? AND age > ?"
      expect(countPlaceholders(query)).toBe(2)
    })
  })

  describe("getSqlExamples", () => {
    it("should return array of examples", () => {
      const examples = getSqlExamples()

      expect(Array.isArray(examples)).toBe(true)
      expect(examples.length).toBeGreaterThan(0)
    })

    it("should include SELECT example", () => {
      const examples = getSqlExamples()
      const selectExample = examples.find(ex => ex.query.includes("SELECT"))

      expect(selectExample).toBeDefined()
      expect(selectExample?.parameters).toBeDefined()
    })

    it("should include INSERT example", () => {
      const examples = getSqlExamples()
      const insertExample = examples.find(ex => ex.query.includes("INSERT"))

      expect(insertExample).toBeDefined()
    })

    it("should include UPDATE example", () => {
      const examples = getSqlExamples()
      const updateExample = examples.find(ex => ex.query.includes("UPDATE"))

      expect(updateExample).toBeDefined()
    })

    it("should include DELETE example", () => {
      const examples = getSqlExamples()
      const deleteExample = examples.find(ex => ex.query.includes("DELETE"))

      expect(deleteExample).toBeDefined()
    })

    it("should have valid structure for examples", () => {
      const examples = getSqlExamples()

      examples.forEach(ex => {
        expect(ex.query).toBeDefined()
        expect(typeof ex.query).toBe("string")
        expect(ex.parameters).toBeDefined()
        expect(typeof ex.parameters).toBe("string")
      })
    })

    it("should have queries with placeholders in examples", () => {
      const examples = getSqlExamples()

      examples.forEach(ex => {
        const placeholderCount = (ex.query.match(/\?/g) || []).length
        expect(placeholderCount).toBeGreaterThan(0)
      })
    })
  })

  describe("Edge cases", () => {
    it("should handle very long query", () => {
      const longQuery = "SELECT * FROM users WHERE " + Array(100).fill("id = ?").join(" OR ")
      const params = Array(100)
        .fill(1)
        .map((_, i) => i)
      const paramsJson = JSON.stringify(params)
      const result = bindSqlParameters(longQuery, paramsJson)

      expect(result.success).toBe(true)
    })

    it("should handle query with multiple consecutive question marks", () => {
      const query = "WHERE col = ? AND ? IS NOT NULL"
      const parameters = '[123, "value"]'
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(true)
    })

    it("should handle parameters with special SQL characters", () => {
      const query = "WHERE query LIKE ?"
      const parameters = '["%search%"]'
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.boundQuery).toContain("'%")
      }
    })

    it("should handle parameters with SQL keywords", () => {
      const query = "WHERE name = ?"
      const parameters = '["SELECT * FROM"]'
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.boundQuery).toContain("'SELECT * FROM'")
      }
    })

    it("should handle parameters with semicolons", () => {
      const query = "WHERE data = ?"
      const parameters = '["value; DROP TABLE users;"]'
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.boundQuery).toContain("'")
      }
    })

    it("should handle very large numbers", () => {
      const query = "WHERE id = ?"
      const parameters = "[9999999999999999]"
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(true)
    })

    it("should handle scientific notation numbers", () => {
      const query = "WHERE value = ?"
      const parameters = "[1.23e-4]"
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(true)
    })

    it("should handle mixed parameter types", () => {
      const query = "WHERE id = ? AND name = ? AND active = ? AND score = ? AND created = ?"
      const parameters = "[123, \"test\", true, 99.99, null]"
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.boundQuery).toContain("123")
        expect(result.data.boundQuery).toContain("'test'")
        expect(result.data.boundQuery).toContain("1")
        expect(result.data.boundQuery).toContain("99.99")
        expect(result.data.boundQuery).toContain("NULL")
      }
    })

    it("should handle Unicode characters in string parameters", () => {
      const query = "WHERE name = ?"
      const parameters = '["안녕하세요"]'
      const result = bindSqlParameters(query, parameters)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.boundQuery).toContain("안녕하세요")
      }
    })
  })
})
