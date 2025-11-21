"use client"

import React, { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatJson, minifyJson } from "@/lib/json-handler"
import { copyToClipboard } from "@/lib/utils"
import { AlertCircle, CheckCircle2, Copy, RotateCcw } from "lucide-react"

/**
 * JSON Formatter & Validator 도구 컴포넌트
 * 사용자가 입력한 JSON을 검증하고 포맷팅합니다.
 */
export function JsonFormatter() {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)
  const [mode, setMode] = useState<"format" | "minify">("format")

  /**
   * JSON을 포맷팅합니다.
   */
  const handleFormat = () => {
    const res = formatJson(input)
    if (res.success) {
      setResult(res.data.formatted)
      setIsValid(true)
      setError(null)
    } else {
      setError(res.error)
      setIsValid(false)
      setResult(null)
    }
  }

  /**
   * JSON을 축소 형식으로 변환합니다.
   */
  const handleMinify = () => {
    const res = minifyJson(input)
    if (res.success) {
      setResult(res.data.formatted)
      setIsValid(true)
      setError(null)
    } else {
      setError(res.error)
      setIsValid(false)
      setResult(null)
    }
  }

  /**
   * 입력값이 변경될 때 실시간 검증을 수행합니다.
   */
  const handleInputChange = (value: string) => {
    setInput(value)

    // 입력이 비어있지 않으면 실시간 검증
    if (value.trim()) {
      const res = formatJson(value)
      if (res.success) {
        setIsValid(true)
        setError(null)
      } else {
        setIsValid(false)
        setError(res.error)
        setResult(null)
      }
    } else {
      setIsValid(false)
      setError(null)
      setResult(null)
    }
  }

  /**
   * 입력 및 결과를 초기화합니다.
   */
  const handleReset = () => {
    setInput("")
    setResult(null)
    setError(null)
    setIsValid(false)
  }

  /**
   * 결과를 클립보드에 복사합니다.
   */
  const handleCopy = async () => {
    if (result) {
      await copyToClipboard(result, "JSON이 복사되었습니다")
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* 모드 선택 버튼 */}
      <div className="flex gap-2">
        <Button
          variant={mode === "format" ? "default" : "outline"}
          onClick={() => {
            setMode("format")
            setResult(null)
          }}
          size="sm"
        >
          포맷팅
        </Button>
        <Button
          variant={mode === "minify" ? "default" : "outline"}
          onClick={() => {
            setMode("minify")
            setResult(null)
          }}
          size="sm"
        >
          축소
        </Button>
      </div>

      {/* 입력 영역 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-slate-700">
            입력 (Input)
          </label>
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${
              isValid
                ? "bg-green-100 text-green-800"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {isValid ? "✓ Valid" : "대기중"}
          </span>
        </div>
        <Textarea
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={`JSON을 여기에 입력하세요...\n\n예시:\n{\n  "name": "John",\n  "age": 30\n}`}
          className="h-64 font-mono text-sm resize-none"
        />
      </div>

      {/* 에러 메시지 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>JSON 오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 결과 영역 */}
      {result && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700">
              결과 (Output)
            </label>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              유효한 JSON
            </div>
          </div>
          <Card className="bg-slate-50 border-slate-200 p-4">
            <pre className="font-mono text-sm whitespace-pre-wrap break-words max-h-64 overflow-y-auto text-slate-800">
              {result}
            </pre>
          </Card>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex gap-2 flex-wrap">
        {mode === "format" ? (
          <Button onClick={handleFormat} className="flex-1 sm:flex-none">
            포맷팅
          </Button>
        ) : (
          <Button onClick={handleMinify} className="flex-1 sm:flex-none">
            축소
          </Button>
        )}

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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">💡 팁:</span> JSON을 입력하면 실시간으로
          검증되고, 포맷팅 또는 축소 버튼을 클릭하면 변환됩니다.
        </p>
      </div>
    </div>
  )
}

export default JsonFormatter
