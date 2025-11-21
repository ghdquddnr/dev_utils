"use client"

import React, { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { yamlToProperties, propertiesToYaml } from "@/lib/yaml-properties-handler"
import { copyToClipboard } from "@/lib/utils"
import { AlertCircle, CheckCircle2, Copy, RotateCcw, ArrowRightLeft } from "lucide-react"

/**
 * YAML ↔ Properties 변환 도구 컴포넌트
 */
export function YamlPropertiesConverter() {
  const [mode, setMode] = useState<"yaml-to-properties" | "properties-to-yaml">(
    "yaml-to-properties"
  )
  const [input, setInput] = useState("")
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [indentation, setIndentation] = useState<2 | 4>(2)
  const [isConverting, setIsConverting] = useState(false)

  /**
   * YAML을 Properties로 변환합니다.
   */
  const handleYamlToProperties = async () => {
    if (!input.trim()) {
      setError("YAML을 입력해주세요")
      setResult(null)
      return
    }

    setIsConverting(true)
    try {
      const res = yamlToProperties(input, indentation)
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
   * Properties를 YAML로 변환합니다.
   */
  const handlePropertiesToYaml = async () => {
    if (!input.trim()) {
      setError("Properties를 입력해주세요")
      setResult(null)
      return
    }

    setIsConverting(true)
    try {
      const res = propertiesToYaml(input, indentation)
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
    if (mode === "yaml-to-properties") {
      handleYamlToProperties()
    } else {
      handlePropertiesToYaml()
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
    if (mode === "yaml-to-properties") {
      setInput(`# Application Configuration
application:
  name: MyApp
  version: 1.0.0

server:
  host: localhost
  port: 8080

database:
  type: postgresql
  host: db.example.com
  port: 5432
  name: mydb`)
    } else {
      setInput(`# Application Configuration
application.name=MyApp
application.version=1.0.0

server.host=localhost
server.port=8080

database.type=postgresql
database.host=db.example.com
database.port=5432
database.name=mydb`)
    }
    setResult(null)
    setError(null)
  }

  return (
    <div className="w-full space-y-4">
      {/* 모드 선택 탭 */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={mode === "yaml-to-properties" ? "default" : "outline"}
          onClick={() => {
            setMode("yaml-to-properties")
            setResult(null)
            setError(null)
          }}
          size="sm"
        >
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          YAML → Properties
        </Button>
        <Button
          variant={mode === "properties-to-yaml" ? "default" : "outline"}
          onClick={() => {
            setMode("properties-to-yaml")
            setResult(null)
            setError(null)
          }}
          size="sm"
        >
          <ArrowRightLeft className="h-4 w-4 mr-2 rotate-180" />
          Properties → YAML
        </Button>
      </div>

      {/* 옵션 패널 */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 space-y-3">
        <div>
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">
            들여쓰기 (YAML)
          </label>
          <div className="flex gap-2">
            <Button
              variant={indentation === 2 ? "default" : "outline"}
              onClick={() => setIndentation(2)}
              size="sm"
              className="text-xs"
            >
              2칸
            </Button>
            <Button
              variant={indentation === 4 ? "default" : "outline"}
              onClick={() => setIndentation(4)}
              size="sm"
              className="text-xs"
            >
              4칸
            </Button>
          </div>
        </div>
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
            mode === "yaml-to-properties"
              ? `YAML을 입력하세요...\n\n예시:\nname: John\nage: 30`
              : `Properties를 입력하세요...\n\n예시:\nname=John\nage=30`
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
          <li>YAML은 들여쓰기 기반의 구조화된 형식입니다</li>
          <li>Properties는 key=value 형식의 평면 구조입니다</li>
          <li>중첩된 값은 점(.)으로 연결됩니다 (예: user.name)</li>
          <li>배열은 인덱스로 표현됩니다 (예: items[0])</li>
          <li>주석(#)은 변환 시 자동으로 제거됩니다</li>
        </ul>
      </div>
    </div>
  )
}

export default YamlPropertiesConverter
