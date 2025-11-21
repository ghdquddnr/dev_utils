/**
 * YAML ↔ Properties 변환 로직
 * YAML과 Properties 형식 간의 상호 변환을 처리합니다.
 */

import {
  YamlPropertiesConversionData,
  YamlPropertiesConversionResult,
  ErrorResponse,
} from "./types"

import YAML from "js-yaml"

/**
 * YAML 문자열을 파싱합니다.
 */
function parseYaml(input: string): Record<string, any> | null {
  try {
    const result = YAML.load(input)
    if (typeof result === "object" && result !== null) {
      return result as Record<string, any>
    }
    return null
  } catch (error) {
    return null
  }
}

/**
 * Properties 문자열을 파싱합니다.
 */
function parseProperties(input: string): Record<string, string> {
  const result: Record<string, string> = {}
  const lines = input.split("\n")

  for (const line of lines) {
    const trimmed = line.trim()

    // 빈 줄과 주석 무시
    if (!trimmed || trimmed.startsWith("#")) {
      continue
    }

    // key=value 형식 파싱
    const [key, ...valueParts] = trimmed.split("=")
    if (key) {
      const value = valueParts.join("=").trim()
      result[key.trim()] = value
    }
  }

  return result
}

/**
 * 객체를 Properties 형식으로 변환합니다 (깊이 1 기준).
 */
function objectToProperties(
  obj: Record<string, any>,
  prefix: string = "",
  indentation: 2 | 4 = 2
): string {
  let result = ""

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (value === null || value === undefined) {
      result += `${fullKey}=\n`
    } else if (typeof value === "object") {
      if (Array.isArray(value)) {
        // 배열은 [0], [1] 형태로 변환
        value.forEach((item, index) => {
          const itemKey = `${fullKey}[${index}]`
          if (typeof item === "object" && item !== null) {
            result += objectToProperties(
              item,
              itemKey,
              indentation
            )
          } else {
            result += `${itemKey}=${String(item)}\n`
          }
        })
      } else {
        // 객체는 재귀
        result += objectToProperties(value, fullKey, indentation)
      }
    } else if (typeof value === "boolean") {
      result += `${fullKey}=${value}\n`
    } else {
      result += `${fullKey}=${String(value)}\n`
    }
  }

  return result
}

/**
 * Properties 형식을 객체로 변환합니다.
 */
function propertiesToObject(props: Record<string, string>): Record<string, any> {
  const result: Record<string, any> = {}

  for (const [key, value] of Object.entries(props)) {
    // 배열 인덱스 처리 (예: items[0] 또는 items[0].name)
    const arrayMatch = key.match(/^([^\[]+)\[(\d+)\](.*)$/)
    if (arrayMatch) {
      const arrayKey = arrayMatch[1]
      const index = parseInt(arrayMatch[2], 10)
      const remainder = arrayMatch[3]

      if (!result[arrayKey]) {
        result[arrayKey] = []
      }

      if (!Array.isArray(result[arrayKey])) {
        result[arrayKey] = []
      }

      // remainder가 있으면 (예: .name), 중첩 객체 생성
      if (remainder) {
        const nestedParts = remainder.substring(1).split(".") // .name → [name]
        if (!result[arrayKey][index]) {
          result[arrayKey][index] = {}
        }
        let current = result[arrayKey][index]
        for (let i = 0; i < nestedParts.length - 1; i++) {
          if (!current[nestedParts[i]]) {
            current[nestedParts[i]] = {}
          }
          current = current[nestedParts[i]]
        }
        current[nestedParts[nestedParts.length - 1]] = parseValue(value)
      } else {
        // items[0] = value (직접 할당)
        result[arrayKey][index] = parseValue(value)
      }
      continue
    }

    // 중첩된 키 처리 (예: user.name)
    const parts = key.split(".")
    let current = result

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (!current[part]) {
        current[part] = {}
      }
      current = current[part]
    }

    current[parts[parts.length - 1]] = parseValue(value)
  }

  return result
}

/**
 * 문자열 값을 적절한 타입으로 파싱합니다.
 */
function parseValue(value: string): any {
  if (value === "" || value === "null") {
    return null
  }
  if (value === "true") {
    return true
  }
  if (value === "false") {
    return false
  }
  if (/^\d+$/.test(value)) {
    return parseInt(value, 10)
  }
  if (/^\d+\.\d+$/.test(value)) {
    return parseFloat(value)
  }
  return value
}

/**
 * YAML을 Properties로 변환합니다.
 */
export function yamlToProperties(
  yaml: string,
  indentation: 2 | 4 = 2
): YamlPropertiesConversionResult {
  if (!yaml || yaml.trim() === "") {
    return {
      success: false,
      error: "YAML이 비어있습니다",
      details: "변환할 YAML을 입력해주세요",
    } as ErrorResponse
  }

  try {
    const parsed = parseYaml(yaml)
    if (!parsed) {
      return {
        success: false,
        error: "YAML 파싱 실패",
        details: "유효한 YAML 형식을 입력해주세요",
      } as ErrorResponse
    }

    const properties = objectToProperties(parsed)

    return {
      success: true,
      data: {
        result: properties.trim(),
        type: "yaml-to-properties",
        original: yaml,
        indentation,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: "YAML 변환 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : String(error),
    } as ErrorResponse
  }
}

/**
 * Properties를 YAML로 변환합니다.
 */
export function propertiesToYaml(
  properties: string,
  indentation: 2 | 4 = 2
): YamlPropertiesConversionResult {
  if (!properties || properties.trim() === "") {
    return {
      success: false,
      error: "Properties가 비어있습니다",
      details: "변환할 Properties를 입력해주세요",
    } as ErrorResponse
  }

  try {
    const parsed = parseProperties(properties)
    const obj = propertiesToObject(parsed)
    const yaml = YAML.dump(obj, {
      indent: indentation,
      lineWidth: -1,
      noRefs: true,
    })

    return {
      success: true,
      data: {
        result: yaml.trim(),
        type: "properties-to-yaml",
        original: properties,
        indentation,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: "Properties 변환 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : String(error),
    } as ErrorResponse
  }
}
