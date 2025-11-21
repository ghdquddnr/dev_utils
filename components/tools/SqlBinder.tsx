"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  bindSqlParameters,
  countPlaceholders,
  getSqlExamples,
} from "@/lib/sql-handler"
import { copyToClipboard } from "@/lib/utils"
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  RotateCcw,
  Lightbulb,
} from "lucide-react"

/**
 * SQL Parameter Binder 도구 컴포넌트
 * PreparedStatement SQL(?)과 파라미터를 바인딩합니다.
 */
export function SqlBinder() {
  const [query, setQuery] = useState("")
  const [parametersJson, setParametersJson] = useState("")
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)
  const [showExamples, setShowExamples] = useState(false)

  const examples = getSqlExamples()

  /**
   * SQL을 바인딩합니다.
   */
  const handleBind = () => {
    const res = bindSqlParameters(query, parametersJson)

    if (res.success) {
      setResult(res.data.boundQuery)
      setIsValid(true)
      setError(null)
    } else {
      setError(res.error)
      setIsValid(false)
      setResult(null)
    }
  }

  /**
   * 입력값이 변경될 때 ? 개수를 표시합니다.
   */
  const placeholderCount = countPlaceholders(query)

  /**
   * 파라미터 JSON이 유효한지 확인합니다.
   */
  let parameterCount = 0
  try {
    if (parametersJson.trim()) {
      const parsed = JSON.parse(parametersJson)
      if (Array.isArray(parsed)) {
        parameterCount = parsed.length
      }
    }
  } catch {
    // JSON 파싱 오류는 무시 (사용자가 입력 중일 수 있음)
  }

  const isParameterMatch = placeholderCount > 0 && placeholderCount === parameterCount

  /**
   * 입력 및 결과를 초기화합니다.
   */
  const handleReset = () => {
    setQuery("")
    setParametersJson("")
    setResult(null)
    setError(null)
    setIsValid(false)
    setShowExamples(false)
  }

  /**
   * 결과를 클립보드에 복사합니다.
   */
  const handleCopy = async () => {
    if (result) {
      await copyToClipboard(result, "SQL이 복사되었습니다")
    }
  }

  /**
   * 예제를 로드합니다.
   */
  const loadExample = (example: (typeof examples)[0]) => {
    setQuery(example.query)
    setParametersJson(example.parameters)
    setResult(null)
    setError(null)
    setShowExamples(false)
  }

  return (
    <div className="w-full space-y-4">
      {/* SQL 쿼리 입력 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-slate-700">
            SQL 쿼리 (Input)
          </label>
          <span className="text-xs font-medium px-2 py-1 rounded bg-slate-100 text-slate-600">
            ? {placeholderCount}개
          </span>
        </div>
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`SQL 쿼리를 여기에 입력하세요...\n\n예시:\nSELECT * FROM users WHERE id = ? AND status = ?`}
          className="h-32 font-mono text-sm resize-none"
        />
      </div>

      {/* 파라미터 입력 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-slate-700">
            파라미터 (JSON 배열)
          </label>
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${
              isParameterMatch
                ? "bg-green-100 text-green-800"
                : parameterCount > 0
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            {parameterCount > 0 ? `${parameterCount}개` : "입력 필요"}
          </span>
        </div>
        <Textarea
          value={parametersJson}
          onChange={(e) => setParametersJson(e.target.value)}
          placeholder={`파라미터를 JSON 배열 형식으로 입력하세요...\n\n예시:\n[123, 'active']`}
          className="h-24 font-mono text-sm resize-none"
        />
        <p className="text-xs text-slate-500 mt-2">
          💡 문자열은 쌍따옴표("")로 감싸세요. 예: ["John", 30, true, null]
        </p>
      </div>

      {/* 파라미터 개수 검증 상태 */}
      {placeholderCount > 0 && (
        <div
          className={`rounded-lg p-3 border ${
            isParameterMatch
              ? "bg-green-50 border-green-200"
              : "bg-yellow-50 border-yellow-200"
          }`}
        >
          <p
            className={`text-sm font-semibold ${
              isParameterMatch ? "text-green-800" : "text-yellow-800"
            }`}
          >
            {isParameterMatch ? "✓ 파라미터 개수가 일치합니다" : "⚠️ 파라미터 개수가 일치하지 않습니다"}
          </p>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>SQL 바인딩 오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 결과 영역 */}
      {result && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700">
              바인딩된 SQL (Output)
            </label>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              완료
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
        <Button
          onClick={handleBind}
          disabled={!query.trim() || !parametersJson.trim()}
          className="flex-1 sm:flex-none"
        >
          바인딩
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

        <Button
          onClick={() => setShowExamples(!showExamples)}
          variant="outline"
          className="flex-1 sm:flex-none"
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          예제
        </Button>
      </div>

      {/* 예제 표시 */}
      {showExamples && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700">SQL 예제</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => loadExample(example)}
                className="w-full text-left bg-slate-50 border border-slate-200 rounded-lg p-3 hover:bg-slate-100 hover:border-slate-300 transition"
              >
                <p className="font-mono text-xs text-slate-700 break-words">
                  {example.query}
                </p>
                <p className="font-mono text-xs text-slate-500 mt-1">
                  파라미터: {example.parameters}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 팁 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">💡 팁:</span> SQL의 <code className="bg-blue-100 px-1 rounded">?</code> 자리에
          파라미터를 입력하고 "바인딩" 버튼을 클릭하면 완전한 SQL이 생성됩니다. 특수문자가 있는 경우 자동으로
          이스케이프됩니다.
        </p>
      </div>
    </div>
  )
}

export default SqlBinder
