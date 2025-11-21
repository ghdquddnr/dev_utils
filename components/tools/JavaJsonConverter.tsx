"use client"

import React, { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { javaToJson, jsonToJava } from "@/lib/java-json-handler"
import { copyToClipboard } from "@/lib/utils"
import { AlertCircle, CheckCircle2, Copy, RotateCcw, ArrowRightLeft } from "lucide-react"

/**
 * Java ↔ JSON 변환 도구 컴포넌트
 */
export function JavaJsonConverter() {
  const [mode, setMode] = useState<"java-to-json" | "json-to-java">("java-to-json")
  const [input, setInput] = useState("")
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [casing, setCasing] = useState<"camelCase" | "snake_case">("camelCase")
  const [className, setClassName] = useState("GeneratedClass")
  const [isConverting, setIsConverting] = useState(false)

  /**
   * Java를 JSON으로 변환합니다.
   */
  const handleJavaToJson = async () => {
    if (!input.trim()) {
      setError("Java 코드를 입력해주세요")
      setResult(null)
      return
    }

    setIsConverting(true)
    try {
      const res = javaToJson(input, casing)
      if (res.success) {
        setResult(res.data.result)
        setError(null)
      } else {
        setError(res.error)
        setResult(null)
      }
    } finally {
      setIsConverting(false)
    }
  }

  /**
   * JSON을 Java로 변환합니다.
   */
  const handleJsonToJava = async () => {
    if (!input.trim()) {
      setError("JSON을 입력해주세요")
      setResult(null)
      return
    }

    setIsConverting(true)
    try {
      const res = jsonToJava(input, className, casing)
      if (res.success) {
        setResult(res.data.result)
        setError(null)
      } else {
        setError(res.error)
        setResult(null)
      }
    } finally {
      setIsConverting(false)
    }
  }

  /**
   * 변환을 수행합니다.
   */
  const handleConvert = () => {
    if (mode === "java-to-json") {
      handleJavaToJson()
    } else {
      handleJsonToJava()
    }
  }

  /**
   * 입력 및 결과를 초기화합니다.
   */
  const handleReset = () => {
    setInput("")
    setResult(null)
    setError(null)
  }

  /**
   * 결과를 클립보드에 복사합니다.
   */
  const handleCopy = async () => {
    if (result) {
      await copyToClipboard(result, "복사되었습니다")
    }
  }

  /**
   * 예제를 로드합니다.
   */
  const handleLoadExample = () => {
    if (mode === "java-to-json") {
      setInput(`public class User {
  private String name;
  private int age;
  private String email;
  private boolean active;
}`)
    } else {
      setInput(`{
  "name": "John",
  "age": 30,
  "email": "john@example.com",
  "active": true
}`)
      setClassName("User")
    }
    setResult(null)
    setError(null)
  }

  return (
    <div className="w-full space-y-4">
      {/* 모드 선택 탭 */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={mode === "java-to-json" ? "default" : "outline"}
          onClick={() => {
            setMode("java-to-json")
            setResult(null)
            setError(null)
          }}
          size="sm"
        >
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          Java → JSON
        </Button>
        <Button
          variant={mode === "json-to-java" ? "default" : "outline"}
          onClick={() => {
            setMode("json-to-java")
            setResult(null)
            setError(null)
          }}
          size="sm"
        >
          <ArrowRightLeft className="h-4 w-4 mr-2 rotate-180" />
          JSON → Java
        </Button>
      </div>

      {/* 옵션 패널 */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 space-y-3">
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
            네이밍 방식
          </label>
          <div className="flex gap-2">
            <Button
              variant={casing === "camelCase" ? "default" : "outline"}
              onClick={() => setCasing("camelCase")}
              size="sm"
              className="text-xs"
            >
              camelCase
            </Button>
            <Button
              variant={casing === "snake_case" ? "default" : "outline"}
              onClick={() => setCasing("snake_case")}
              size="sm"
              className="text-xs"
            >
              snake_case
            </Button>
          </div>
        </div>

        {mode === "json-to-java" && (
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              클래스 이름
            </label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="GeneratedClass"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        )}
      </div>

      {/* 입력 영역 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            입력 (Input)
          </label>
          <Button
            onClick={handleLoadExample}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            📋 예제 로드
          </Button>
        </div>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "java-to-json"
              ? `Java 클래스를 입력하세요...\n\n예시:\npublic class User {\n  private String name;\n  private int age;\n}`
              : `JSON을 입력하세요...\n\n예시:\n{\n  "name": "John",\n  "age": 30\n}`
          }
          className="h-64 font-mono text-sm resize-none"
        />
      </div>

      {/* 에러 메시지 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>변환 오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 결과 영역 */}
      {result && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              결과 (Output)
            </label>
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-3 w-3" />
              변환 성공
            </div>
          </div>
          <Card className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-4">
            <pre className="font-mono text-sm whitespace-pre-wrap break-words max-h-64 overflow-y-auto text-slate-800 dark:text-slate-200">
              {result}
            </pre>
          </Card>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={handleConvert}
          disabled={isConverting || !input.trim()}
          className="flex-1 sm:flex-none"
        >
          {isConverting ? "변환 중..." : "변환"}
        </Button>

        {result && (
          <Button
            onClick={handleCopy}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            <Copy className="h-4 w-4 mr-2" />
            복사
          </Button>
        )}

        <Button
          onClick={handleReset}
          variant="outline"
          className="flex-1 sm:flex-none"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          초기화
        </Button>
      </div>

      {/* 팁 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-2">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          <span className="font-semibold">💡 팁:</span>
        </p>
        <ul className="text-sm text-blue-800 dark:text-blue-200 list-disc list-inside space-y-1">
          <li>Java 클래스의 필드를 자동으로 감지합니다</li>
          <li>JSON 객체는 camelCase 또는 snake_case로 변환됩니다</li>
          <li>JSON to Java 변환 시 getter/setter가 자동으로 생성됩니다</li>
          <li>
            기본 타입 (String, int, boolean 등)과 List, Map을 지원합니다
          </li>
        </ul>
      </div>
    </div>
  )
}

export default JavaJsonConverter
