/**
 * Java ↔ JSON Handler 단위 테스트
 */

import { javaToJson, jsonToJava, convertNaming } from "./java-json-handler"

describe("java-json-handler", () => {
  // ============================================
  // javaToJson 테스트
  // ============================================

  describe("javaToJson", () => {
    test("기본 Java 클래스를 JSON으로 변환", () => {
      const javaCode = `
        public class User {
          private String name;
          private int age;
        }
      `
      const result = javaToJson(javaCode)

      expect(result.success).toBe(true)
      if (result.success) {
        const json = JSON.parse(result.data.result)
        expect(json.name).toBe("")
        expect(json.age).toBe(0)
      }
    })

    test("여러 타입의 필드를 포함한 Java 클래스", () => {
      const javaCode = `
        public class Product {
          private String name;
          private double price;
          private boolean available;
          private int stock;
        }
      `
      const result = javaToJson(javaCode)

      expect(result.success).toBe(true)
      if (result.success) {
        const json = JSON.parse(result.data.result)
        expect(json.name).toBe("")
        expect(json.price).toBe(0.0)
        expect(json.available).toBe(false)
        expect(json.stock).toBe(0)
      }
    })

    test("List 필드를 포함한 Java 클래스", () => {
      const javaCode = `
        public class Team {
          private String name;
          private List members;
        }
      `
      const result = javaToJson(javaCode)

      expect(result.success).toBe(true)
      if (result.success) {
        const json = JSON.parse(result.data.result)
        expect(json.name).toBe("")
        expect(Array.isArray(json.members)).toBe(true)
      }
    })

    test("Map 필드를 포함한 Java 클래스", () => {
      const javaCode = `
        public class Config {
          private String key;
          private Map settings;
        }
      `
      const result = javaToJson(javaCode)

      expect(result.success).toBe(true)
      if (result.success) {
        const json = JSON.parse(result.data.result)
        expect(json.key).toBe("")
        expect(json.settings !== null && typeof json.settings === "object").toBe(true)
      }
    })

    test("빈 Java 코드는 실패", () => {
      const result = javaToJson("")
      expect(result.success).toBe(false)
    })

    test("유효하지 않은 Java 클래스는 실패", () => {
      const javaCode = "invalid java code"
      const result = javaToJson(javaCode)
      expect(result.success).toBe(false)
    })

    test("snake_case 변환 옵션", () => {
      const javaCode = `
        public class UserProfile {
          private String firstName;
          private String lastName;
        }
      `
      const result = javaToJson(javaCode, "snake_case")

      expect(result.success).toBe(true)
      if (result.success) {
        const json = JSON.parse(result.data.result)
        expect(json.first_name).toBeDefined()
        expect(json.last_name).toBeDefined()
      }
    })

    test("Date 필드를 포함한 Java 클래스", () => {
      const javaCode = `
        public class Event {
          private String name;
          private Date createdAt;
        }
      `
      const result = javaToJson(javaCode)

      expect(result.success).toBe(true)
      if (result.success) {
        const json = JSON.parse(result.data.result)
        expect(json.name).toBe("")
        expect(typeof json.createdAt).toBe("string")
      }
    })

    test("Long 타입 필드", () => {
      const javaCode = `
        public class Transaction {
          private long id;
          private Long amount;
        }
      `
      const result = javaToJson(javaCode)

      expect(result.success).toBe(true)
      if (result.success) {
        const json = JSON.parse(result.data.result)
        expect(json.id).toBe(0)
        expect(json.amount).toBe(0)
      }
    })

    test("Float 타입 필드", () => {
      const javaCode = `
        public class Measurement {
          private float temperature;
          private Float humidity;
        }
      `
      const result = javaToJson(javaCode)

      expect(result.success).toBe(true)
      if (result.success) {
        const json = JSON.parse(result.data.result)
        expect(json.temperature).toBe(0.0)
        expect(json.humidity).toBe(0.0)
      }
    })

    test("Boolean 타입 필드", () => {
      const javaCode = `
        public class Status {
          private boolean active;
          private Boolean enabled;
        }
      `
      const result = javaToJson(javaCode)

      expect(result.success).toBe(true)
      if (result.success) {
        const json = JSON.parse(result.data.result)
        expect(json.active).toBe(false)
        expect(json.enabled).toBe(false)
      }
    })

    test("private/public/final 키워드 모두 처리", () => {
      const javaCode = `
        public class Config {
          private String name;
          public int value;
          private final boolean flag;
        }
      `
      const result = javaToJson(javaCode)

      expect(result.success).toBe(true)
      if (result.success) {
        const json = JSON.parse(result.data.result)
        expect(json.name).toBe("")
        expect(json.value).toBe(0)
        expect(json.flag).toBe(false)
      }
    })
  })

  // ============================================
  // jsonToJava 테스트
  // ============================================

  describe("jsonToJava", () => {
    test("기본 JSON을 Java 클래스로 변환", () => {
      const json = JSON.stringify({
        name: "John",
        age: 30,
      })

      const result = jsonToJava(json, "User")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain("public class User")
        expect(result.data.result).toContain("private String name")
        expect(result.data.result).toContain("private int age")
        expect(result.data.result).toContain("getName()")
        expect(result.data.result).toContain("setName")
      }
    })

    test("복잡한 JSON 객체를 변환", () => {
      const json = JSON.stringify({
        id: 1,
        email: "user@example.com",
        isActive: true,
        balance: 100.5,
      })

      const result = jsonToJava(json, "Account")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain("public class Account")
        expect(result.data.result).toContain("private int id")
        expect(result.data.result).toContain("private String email")
        expect(result.data.result).toContain("private boolean isActive")
        expect(result.data.result).toContain("private double balance")
      }
    })

    test("배열 JSON은 실패", () => {
      const json = JSON.stringify([1, 2, 3])
      const result = jsonToJava(json, "Test")

      expect(result.success).toBe(false)
    })

    test("빈 JSON은 실패", () => {
      const result = jsonToJava("", "Test")
      expect(result.success).toBe(false)
    })

    test("유효하지 않은 JSON은 실패", () => {
      const result = jsonToJava("{invalid json}", "Test")
      expect(result.success).toBe(false)
    })

    test("null JSON은 실패", () => {
      const json = JSON.stringify(null)
      const result = jsonToJava(json, "Test")

      expect(result.success).toBe(false)
    })

    test("기본 클래스 이름 생성 (className 미제공)", () => {
      const json = JSON.stringify({ field1: "value" })
      const result = jsonToJava(json)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain("public class GeneratedClass")
      }
    })

    test("snake_case JSON을 camelCase Java로 변환", () => {
      const json = JSON.stringify({
        first_name: "John",
        last_name: "Doe",
      })

      const result = jsonToJava(json, "User", "snake_case")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain("private String firstName")
        expect(result.data.result).toContain("private String lastName")
      }
    })

    test("Getter와 Setter가 올바르게 생성됨", () => {
      const json = JSON.stringify({ testField: "value" })
      const result = jsonToJava(json, "Test")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain("getTestField()")
        expect(result.data.result).toContain("setTestField")
      }
    })

    test("여러 타입의 필드를 포함한 JSON", () => {
      const json = JSON.stringify({
        id: 123,
        name: "Product",
        price: 99.99,
        inStock: true,
      })

      const result = jsonToJava(json, "Product")

      expect(result.success).toBe(true)
      if (result.success) {
        const code = result.data.result
        expect(code).toContain("private int id")
        expect(code).toContain("private String name")
        expect(code).toContain("private double price")
        expect(code).toContain("private boolean inStock")
      }
    })

    test("깊은 객체(nested)는 Object 타입으로 변환", () => {
      const json = JSON.stringify({
        name: "User",
        address: {
          street: "123 Main St",
          city: "Anytown",
        },
      })

      const result = jsonToJava(json, "User")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain("private Object address")
      }
    })

    test("배열 필드는 List로 변환", () => {
      const json = JSON.stringify({
        name: "Team",
        members: ["Alice", "Bob"],
      })

      const result = jsonToJava(json, "Team")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain("private List<Object> members")
      }
    })
  })

  // ============================================
  // convertNaming 테스트
  // ============================================

  describe("convertNaming", () => {
    test("camelCase를 snake_case로 변환", () => {
      const result = convertNaming("firstName", "camelCase", "snake_case")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toBe("first_name")
      }
    })

    test("snake_case를 camelCase로 변환", () => {
      const result = convertNaming("first_name", "snake_case", "camelCase")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toBe("firstName")
      }
    })

    test("여러 단어 camelCase를 snake_case로", () => {
      const result = convertNaming(
        "getUserFullName",
        "camelCase",
        "snake_case"
      )

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toBe("get_user_full_name")
      }
    })

    test("여러 단어 snake_case를 camelCase로", () => {
      const result = convertNaming(
        "get_user_full_name",
        "snake_case",
        "camelCase"
      )

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toBe("getUserFullName")
      }
    })

    test("같은 형식으로 변환하면 변경 없음", () => {
      const result = convertNaming("testField", "camelCase", "camelCase")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toBe("testField")
      }
    })

    test("연속된 대문자 처리 (HTTPServer)", () => {
      const result = convertNaming("HTTPServer", "camelCase", "snake_case")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result.toLowerCase()).toContain("http")
      }
    })

    test("빈 입력은 실패", () => {
      const result = convertNaming("", "camelCase", "snake_case")
      expect(result.success).toBe(false)
    })

    test("숫자를 포함한 camelCase", () => {
      const result = convertNaming("user2Name", "camelCase", "snake_case")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain("user")
        expect(result.data.result).toContain("name")
      }
    })

    test("단일 단어는 변환되지 않음", () => {
      const result = convertNaming("name", "camelCase", "snake_case")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toBe("name")
      }
    })
  })

  // ============================================
  // 통합 테스트
  // ============================================

  describe("Integration Tests", () => {
    test("Java → JSON → Java 순환 변환", () => {
      const javaCode = `
        public class Product {
          private String name;
          private String sku;
        }
      `

      // Java → JSON
      const step1 = javaToJson(javaCode)
      expect(step1.success).toBe(true)

      if (step1.success) {
        // JSON → Java
        const step2 = jsonToJava(step1.data.result, "Product")
        expect(step2.success).toBe(true)

        if (step2.success) {
          expect(step2.data.result).toContain("public class Product")
          expect(step2.data.result).toContain("private String name")
          expect(step2.data.result).toContain("private String sku")
        }
      }
    })

    test("snake_case 옵션 일관성", () => {
      const javaCode = `
        public class UserAccount {
          private String firstName;
          private String lastName;
        }
      `

      const result = javaToJson(javaCode, "snake_case")

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.casing).toBe("snake_case")
        const json = JSON.parse(result.data.result)
        expect(json.first_name).toBeDefined()
        expect(json.last_name).toBeDefined()
      }
    })
  })
})
