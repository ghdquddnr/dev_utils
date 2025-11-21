/**
 * YAML ↔ Properties Handler 단위 테스트
 */

import { yamlToProperties, propertiesToYaml } from "./yaml-properties-handler"

describe("yaml-properties-handler", () => {
  // ============================================
  // yamlToProperties 테스트
  // ============================================

  describe("yamlToProperties", () => {
    test("기본 YAML을 Properties로 변환", () => {
      const yaml = `
name: John
age: 30
email: john@example.com
      `
      const result = yamlToProperties(yaml)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain("name=John")
        expect(result.data.result).toContain("age=30")
        expect(result.data.result).toContain("email=john@example.com")
      }
    })

    test("중첩 YAML을 Properties로 변환", () => {
      const yaml = `
user:
  name: Alice
  age: 25
  email: alice@example.com
server:
  host: localhost
  port: 3000
      `
      const result = yamlToProperties(yaml)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain("user.name=Alice")
        expect(result.data.result).toContain("user.age=25")
        expect(result.data.result).toContain("server.host=localhost")
        expect(result.data.result).toContain("server.port=3000")
      }
    })

    test("배열 YAML을 Properties로 변환", () => {
      const yaml = `
items:
  - name: Item1
    value: 100
  - name: Item2
    value: 200
      `
      const result = yamlToProperties(yaml)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain("items[0]")
        expect(result.data.result).toContain("items[1]")
      }
    })

    test("불린 값이 포함된 YAML", () => {
      const yaml = `
enabled: true
disabled: false
      `
      const result = yamlToProperties(yaml)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain("enabled=true")
        expect(result.data.result).toContain("disabled=false")
      }
    })

    test("숫자 값이 포함된 YAML", () => {
      const yaml = `
count: 42
ratio: 3.14
      `
      const result = yamlToProperties(yaml)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain("count=42")
        expect(result.data.result).toContain("ratio=3.14")
      }
    })

    test("빈 YAML은 실패", () => {
      const result = yamlToProperties("")
      expect(result.success).toBe(false)
    })

    test("유효하지 않은 YAML은 실패", () => {
      const yaml = `
invalid:
  - item1
  item2: wrong indent
      `
      const result = yamlToProperties(yaml)
      expect(result.success).toBe(false)
    })

    test("들여쓰기 옵션 (4칸)", () => {
      const yaml = `
database:
  host: localhost
  port: 5432
      `
      const result = yamlToProperties(yaml, 4)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.indentation).toBe(4)
      }
    })

    test("null 값 처리", () => {
      const yaml = `
name: John
middle: null
last: Doe
      `
      const result = yamlToProperties(yaml)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain("name=John")
        expect(result.data.result).toContain("last=Doe")
      }
    })

    test("공백과 특수문자 처리", () => {
      const yaml = `
url: "https://example.com/api"
message: "Hello World!"
      `
      const result = yamlToProperties(yaml)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain("url=https://example.com/api")
        expect(result.data.result).toContain("message=Hello World!")
      }
    })
  })

  // ============================================
  // propertiesToYaml 테스트
  // ============================================

  describe("propertiesToYaml", () => {
    test("기본 Properties를 YAML로 변환", () => {
      const props = `
name=John
age=30
email=john@example.com
      `
      const result = propertiesToYaml(props)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain("name: John")
        expect(result.data.result).toContain("age: 30")
        expect(result.data.result).toContain("email: john@example.com")
      }
    })

    test("중첩 Properties를 YAML로 변환", () => {
      const props = `
user.name=Bob
user.age=35
server.host=localhost
server.port=3000
      `
      const result = propertiesToYaml(props)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain("user:")
        expect(result.data.result).toContain("name: Bob")
        expect(result.data.result).toContain("age: 35")
        expect(result.data.result).toContain("server:")
      }
    })

    test("배열 Properties를 YAML로 변환", () => {
      const props = `
items[0].name=Item1
items[0].value=100
items[1].name=Item2
items[1].value=200
      `
      const result = propertiesToYaml(props)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain("items:")
      }
    })

    test("불린 값이 포함된 Properties", () => {
      const props = `
enabled=true
disabled=false
      `
      const result = propertiesToYaml(props)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain("enabled: true")
        expect(result.data.result).toContain("disabled: false")
      }
    })

    test("주석 무시", () => {
      const props = `
# This is a comment
name=John
# Another comment
age=30
      `
      const result = propertiesToYaml(props)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain("name: John")
        expect(result.data.result).toContain("age: 30")
        expect(result.data.result).not.toContain("comment")
      }
    })

    test("빈 Properties는 실패", () => {
      const result = propertiesToYaml("")
      expect(result.success).toBe(false)
    })

    test("빈 줄 무시", () => {
      const props = `
name=John

age=30

      `
      const result = propertiesToYaml(props)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain("name: John")
        expect(result.data.result).toContain("age: 30")
      }
    })

    test("들여쓰기 옵션 (4칸)", () => {
      const props = `
user.name=John
server.host=localhost
      `
      const result = propertiesToYaml(props, 4)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.indentation).toBe(4)
      }
    })

    test("값에 등호 포함", () => {
      const props = `
formula=a=b+c
      `
      const result = propertiesToYaml(props)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain("formula: a=b+c")
      }
    })

    test("URL 값 처리", () => {
      const props = `
api.url=https://api.example.com/v1
      `
      const result = propertiesToYaml(props)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain("api:")
      }
    })
  })

  // ============================================
  // 통합 테스트
  // ============================================

  describe("Integration Tests", () => {
    test("YAML → Properties → YAML 순환 변환", () => {
      const originalYaml = `
name: John
age: 30
email: john@example.com
      `

      // YAML → Properties
      const step1 = yamlToProperties(originalYaml)
      expect(step1.success).toBe(true)

      if (step1.success) {
        // Properties → YAML
        const step2 = propertiesToYaml(step1.data.result)
        expect(step2.success).toBe(true)

        if (step2.success) {
          expect(step2.data.result).toContain("name:")
          expect(step2.data.result).toContain("age:")
          expect(step2.data.result).toContain("email:")
        }
      }
    })

    test("Properties → YAML → Properties 순환 변환", () => {
      const originalProps = `
database.host=localhost
database.port=5432
database.name=mydb
      `

      // Properties → YAML
      const step1 = propertiesToYaml(originalProps)
      expect(step1.success).toBe(true)

      if (step1.success) {
        // YAML → Properties
        const step2 = yamlToProperties(step1.data.result)
        expect(step2.success).toBe(true)

        if (step2.success) {
          expect(step2.data.result).toContain("database.host=localhost")
          expect(step2.data.result).toContain("database.port=5432")
          expect(step2.data.result).toContain("database.name=mydb")
        }
      }
    })

    test("복잡한 중첩 구조 변환", () => {
      const yaml = `
application:
  name: MyApp
  version: 1.0.0
  server:
    host: 0.0.0.0
    port: 8080
  database:
    type: postgresql
    host: db.example.com
    port: 5432
      `

      const result = yamlToProperties(yaml)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain("application.name=MyApp")
        expect(result.data.result).toContain("application.version=1.0.0")
        expect(result.data.result).toContain("application.server.host=0.0.0.0")
        expect(result.data.result).toContain("application.database.type=postgresql")
      }
    })

    test("배열 포함 구조 변환", () => {
      const yaml = `
servers:
  - name: server1
    host: host1.example.com
  - name: server2
    host: host2.example.com
      `

      const result = yamlToProperties(yaml)

      expect(result.success).toBe(true)
      if (result.success) {
        const props = result.data.result
        expect(props).toContain("servers[0]")
        expect(props).toContain("servers[1]")
      }
    })

    test("타입 변환 일관성 (숫자, 불린)", () => {
      const props = `
count=42
ratio=3.14
enabled=true
      `

      const result = propertiesToYaml(props)

      expect(result.success).toBe(true)
      if (result.success) {
        // 다시 YAML로 변환되면 타입이 보존되어야 함
        expect(result.data.result).toContain("count: 42")
        expect(result.data.result).toContain("enabled: true")
      }
    })

    test("공백 포함 값 변환", () => {
      const yaml = `
description: "This is a long description with spaces"
path: "/path/to/directory with spaces"
      `

      const result = yamlToProperties(yaml)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain(
          "description=This is a long description with spaces"
        )
      }
    })
  })

  // ============================================
  // 에지 케이스 테스트
  // ============================================

  describe("Edge Cases", () => {
    test("특수 문자 처리", () => {
      const yaml = `
special: "!@#$%^&*()"
quotes: 'single "quoted" string'
      `

      const result = yamlToProperties(yaml)
      expect(result.success).toBe(true)
    })

    test("유니코드 처리", () => {
      const yaml = `
korean: "한글 테스트"
chinese: "中文测试"
emoji: "😀🎉"
      `

      const result = yamlToProperties(yaml)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain("korean=한글 테스트")
      }
    })

    test("깊은 중첩 구조", () => {
      const yaml = `
level1:
  level2:
    level3:
      level4:
        value: deep
      `

      const result = yamlToProperties(yaml)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain("level1.level2.level3.level4.value=deep")
      }
    })

    test("빈 객체", () => {
      const yaml = `
empty: {}
      `

      const result = yamlToProperties(yaml)
      expect(result.success).toBe(true)
    })

    test("빈 배열", () => {
      const yaml = `
emptyList: []
      `

      const result = yamlToProperties(yaml)
      expect(result.success).toBe(true)
    })

    test("긴 키 이름", () => {
      const props = `
very.long.property.name.with.many.levels=value
      `

      const result = propertiesToYaml(props)
      expect(result.success).toBe(true)
    })
  })
})
