/**
 * Java ↔ JSON 변환 로직
 * Java 클래스와 JSON 간의 상호 변환을 처리합니다.
 */

import {
  JavaJsonConversionData,
  JavaJsonConversionResult,
  ErrorResponse,
} from "./types"

/**
 * Java 클래스 구조를 나타내는 인터페이스
 */
interface JavaClass {
  className: string
  fields: Array<{
    name: string
    type: string
    isCollection: boolean
    isMap: boolean
    genericType?: string
  }>
}

/**
 * Java 클래스 문법을 파싱합니다.
 * @param javaCode - Java 클래스 코드
 * @returns 파싱된 Java 클래스 정보
 */
function parseJavaClass(javaCode: string): JavaClass | null {
  const trimmed = javaCode.trim()

  // 클래스 이름 추출
  const classMatch = trimmed.match(/(?:public\s+)?class\s+(\w+)/)
  if (!classMatch) return null

  const className = classMatch[1]

  // 필드 추출 - List<T>, Map<K,V> 등의 Generic 타입 지원
  const fieldPattern = /(?:private|public)?\s+(?:static\s+)?(?:final\s+)?(\w+(?:<[^<>]*(?:<[^>]*>[^<>]*)*>)?)\s+(\w+)\s*[=;]/g
  const fields: JavaClass["fields"] = []
  let match

  while ((match = fieldPattern.exec(trimmed)) !== null) {
    const type = match[1]
    const name = match[2]

    const isCollection =
      type.includes("List") || type.includes("Set") || type.includes("ArrayList")
    const isMap = type.includes("Map") || type.includes("HashMap")

    // Generic 타입 추출
    const genericMatch = type.match(/<([^>]+)>/)
    const genericType = genericMatch ? genericMatch[1] : undefined

    fields.push({
      name,
      type,
      isCollection,
      isMap,
      genericType,
    })
  }

  return { className, fields }
}

/**
 * Java 필드 타입을 JSON 기본값으로 변환합니다.
 */
function getDefaultValueForType(javaType: string): any {
  if (javaType.includes("String")) return ""
  if (javaType.includes("int") || javaType.includes("Integer")) return 0
  if (javaType.includes("long") || javaType.includes("Long")) return 0
  if (javaType.includes("double") || javaType.includes("Double")) return 0.0
  if (javaType.includes("float") || javaType.includes("Float")) return 0.0
  if (javaType.includes("boolean") || javaType.includes("Boolean")) return false
  if (javaType.includes("Date")) return new Date().toISOString()
  if (javaType.includes("List") || javaType.includes("ArrayList")) return []
  if (javaType.includes("Map") || javaType.includes("HashMap")) return {}
  return null
}

/**
 * Java 클래스로부터 JSON 예시를 생성합니다.
 */
function generateJsonFromJavaClass(
  javaClass: JavaClass,
  casing: "camelCase" | "snake_case" = "camelCase"
): any {
  const json: Record<string, any> = {}

  for (const field of javaClass.fields) {
    const fieldName = convertCasing(field.name, "camelCase", casing)
    json[fieldName] = getDefaultValueForType(field.type)
  }

  return json
}

/**
 * JSON 객체로부터 Java DTO 클래스 코드를 생성합니다.
 */
function generateJavaFromJson(
  json: Record<string, any>,
  className: string,
  casing: "camelCase" | "snake_case" = "camelCase"
): string {
  let javaCode = `public class ${className} {\n`

  // 필드 정의
  for (const [key, value] of Object.entries(json)) {
    const fieldName = convertCasing(key, casing, "camelCase")
    const javaType = inferJavaType(value)

    javaCode += `  private ${javaType} ${fieldName};\n`
  }

  javaCode += "\n"

  // Getter/Setter 정의
  for (const [key, value] of Object.entries(json)) {
    const fieldName = convertCasing(key, casing, "camelCase")
    const javaType = inferJavaType(value)
    const capitalizedName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1)

    javaCode += `  public ${javaType} get${capitalizedName}() {\n`
    javaCode += `    return ${fieldName};\n`
    javaCode += `  }\n\n`

    javaCode += `  public void set${capitalizedName}(${javaType} ${fieldName}) {\n`
    javaCode += `    this.${fieldName} = ${fieldName};\n`
    javaCode += `  }\n\n`
  }

  javaCode += "}\n"

  return javaCode
}

/**
 * JSON 값의 타입을 Java 타입으로 추론합니다.
 */
function inferJavaType(value: any): string {
  if (typeof value === "string") return "String"
  if (typeof value === "number") {
    return Number.isInteger(value) ? "int" : "double"
  }
  if (typeof value === "boolean") return "boolean"
  if (value instanceof Date || typeof value === "string") return "Date"
  if (Array.isArray(value)) return "List<Object>"
  if (typeof value === "object" && value !== null) return "Object"
  return "Object"
}

/**
 * 문자열의 네이밍 방식을 변환합니다.
 */
function convertCasing(
  text: string,
  from: "camelCase" | "snake_case",
  to: "camelCase" | "snake_case"
): string {
  if (from === to) return text

  if (from === "camelCase" && to === "snake_case") {
    return text
      .replace(/([a-z])([A-Z])/g, "$1_$2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
      .toLowerCase()
  }

  if (from === "snake_case" && to === "camelCase") {
    return text.replace(/_([a-z])/g, (_, char) => char.toUpperCase())
  }

  return text
}

/**
 * Java 클래스를 JSON으로 변환합니다.
 */
export function javaToJson(
  javaCode: string,
  casing: "camelCase" | "snake_case" = "camelCase"
): JavaJsonConversionResult {
  if (!javaCode || javaCode.trim() === "") {
    return {
      success: false,
      error: "Java 코드가 비어있습니다",
      details: "변환할 Java 클래스 코드를 입력해주세요",
    } as ErrorResponse
  }

  try {
    const javaClass = parseJavaClass(javaCode)
    if (!javaClass) {
      return {
        success: false,
        error: "Java 클래스 파싱 실패",
        details: "유효한 Java 클래스 코드를 입력해주세요. 예: public class User { private String name; }",
      } as ErrorResponse
    }

    const jsonObject = generateJsonFromJavaClass(javaClass, casing)
    const jsonString = JSON.stringify(jsonObject, null, 2)

    return {
      success: true,
      data: {
        result: jsonString,
        type: "java-to-json",
        original: javaCode,
        casing,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: "Java 변환 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : String(error),
    } as ErrorResponse
  }
}

/**
 * JSON을 Java DTO 클래스로 변환합니다.
 */
export function jsonToJava(
  jsonString: string,
  className: string = "GeneratedClass",
  casing: "camelCase" | "snake_case" = "camelCase"
): JavaJsonConversionResult {
  if (!jsonString || jsonString.trim() === "") {
    return {
      success: false,
      error: "JSON이 비어있습니다",
      details: "변환할 JSON을 입력해주세요",
    } as ErrorResponse
  }

  if (!className || className.trim() === "") {
    className = "GeneratedClass"
  }

  try {
    const json = JSON.parse(jsonString)

    if (typeof json !== "object" || json === null || Array.isArray(json)) {
      return {
        success: false,
        error: "유효하지 않은 JSON",
        details: "JSON 객체를 입력해주세요 (배열 제외)",
      } as ErrorResponse
    }

    const javaCode = generateJavaFromJson(json, className, casing)

    return {
      success: true,
      data: {
        result: javaCode,
        type: "json-to-java",
        original: jsonString,
        casing,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: "JSON 파싱 실패",
      details: error instanceof Error ? error.message : String(error),
    } as ErrorResponse
  }
}

/**
 * 네이밍 방식을 변환합니다 (외부 사용용).
 */
export function convertNaming(
  text: string,
  from: "camelCase" | "snake_case",
  to: "camelCase" | "snake_case"
): JavaJsonConversionResult {
  if (!text || text.trim() === "") {
    return {
      success: false,
      error: "입력이 비어있습니다",
      details: "변환할 텍스트를 입력해주세요",
    } as ErrorResponse
  }

  try {
    const converted = convertCasing(text, from, to)
    return {
      success: true,
      data: {
        result: converted,
        type: "java-to-json",
        original: text,
        casing: to,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: "변환 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : String(error),
    } as ErrorResponse
  }
}
