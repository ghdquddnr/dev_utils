"use client"

/**
 * Cron Expression 생성기/테스터 컴포넌트
 * Cron 표현식 생성, 파싱, 검증 및 다음 실행 시간 계산을 제공합니다.
 */

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  RotateCcw,
  Clock,
  Sparkles,
} from "lucide-react"
import {
  buildCronExpression,
  parseCronExpression,
  describeCron,
  getNextExecutionTimes,
  validateCronExpression,
  CRON_PRESETS,
  CronConfig,
} from "@/lib/cron-handler"

export function CronExpressionGenerator() {
  // 모드 상태 (GUI 빌더, 문자열 입력/검증)
  const [mode, setMode] = useState<"builder" | "validator">("builder")

  // GUI 빌더 상태
  const [minute, setMinute] = useState<string>("*")
  const [hour, setHour] = useState<string>("*")
  const [dayOfMonth, setDayOfMonth] = useState<string>("*")
  const [month, setMonth] = useState<string>("*")
  const [dayOfWeek, setDayOfWeek] = useState<string>("*")
  const [second, setSecond] = useState<string | undefined>(undefined)
  const [includeSeconds, setIncludeSeconds] = useState<boolean>(false)

  // 문자열 입력 상태
  const [cronInput, setCronInput] = useState<string>("")

  // 결과 및 에러 상태
  const [result, setResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  /**
   * GUI에서 Cron 표현식 생성
   */
  const handleBuildCron = () => {
    const config: CronConfig = {
      minute,
      hour,
      dayOfMonth,
      month,
      dayOfWeek,
    }

    if (includeSeconds) {
      config.second = second || "0"
    }

    const buildResult = buildCronExpression(config)
    if (buildResult.success) {
      const expression = buildResult.data.expression

      // 다음 실행 시간 계산
      const timesResult = getNextExecutionTimes(expression, 10)
      if (timesResult.success) {
        setResult({
          expression,
          description: buildResult.data.description,
          nextExecutionTimes: timesResult.data.nextExecutionTimes,
        })
        setError(null)
      } else {
        setError(timesResult.error)
        setResult(null)
      }
    } else {
      setError(buildResult.error)
      setResult(null)
    }
  }

  /**
   * 문자열 입력에서 Cron 표현식 검증
   */
  const handleValidateCron = () => {
    if (!cronInput || cronInput.trim() === "") {
      setError("Cron 표현식을 입력해주세요")
      setResult(null)
      return
    }

    const validationResult = validateCronExpression(cronInput)
    if (validationResult.success) {
      // 설명 생성
      const descResult = describeCron(cronInput)
      const description = descResult.success
        ? descResult.data.description
        : "Cron 표현식"

      // 다음 실행 시간 계산
      const timesResult = getNextExecutionTimes(cronInput, 10)
      if (timesResult.success) {
        setResult({
          expression: cronInput,
          description,
          nextExecutionTimes: timesResult.data.nextExecutionTimes,
        })
        setError(null)
      } else {
        setError(timesResult.error)
        setResult(null)
      }
    } else {
      setError(validationResult.error)
      setResult(null)
    }
  }

  /**
   * 프리셋 로드
   */
  const handleLoadPreset = (presetKey: string) => {
    const preset = CRON_PRESETS[presetKey]
    if (!preset) return

    // 프리셋 표현식을 GUI 필드에 반영
    const parts = preset.expression.split(/\s+/)
    if (parts.length === 5) {
      setMinute(parts[0])
      setHour(parts[1])
      setDayOfMonth(parts[2])
      setMonth(parts[3])
      setDayOfWeek(parts[4])
      setIncludeSeconds(false)
      setSecond(undefined)
    }

    // 결과도 바로 표시
    const timesResult = getNextExecutionTimes(preset.expression, 10)
    if (timesResult.success) {
      setResult({
        expression: preset.expression,
        description: preset.description,
        nextExecutionTimes: timesResult.data.nextExecutionTimes,
      })
      setError(null)
    }
  }

  /**
   * 모드 전환 시 초기화
   */
  const handleModeChange = (newMode: "builder" | "validator") => {
    setMode(newMode)
    setResult(null)
    setError(null)
  }

  /**
   * 복사 기능
   */
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  /**
   * 초기화
   */
  const handleReset = () => {
    setMinute("*")
    setHour("*")
    setDayOfMonth("*")
    setMonth("*")
    setDayOfWeek("*")
    setSecond(undefined)
    setIncludeSeconds(false)
    setCronInput("")
    setResult(null)
    setError(null)
  }

  return (
    <div className="space-y-6">
      {/* 모드 선택 탭 */}
      <Tabs
        value={mode}
        onValueChange={(value) =>
          handleModeChange(value as "builder" | "validator")
        }
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="builder">
            <Sparkles className="w-4 h-4 mr-2" />
            GUI 빌더
          </TabsTrigger>
          <TabsTrigger value="validator">
            <Clock className="w-4 h-4 mr-2" />
            표현식 검증
          </TabsTrigger>
        </TabsList>

        {/* GUI 빌더 모드 */}
        <TabsContent value="builder" className="space-y-4">
          {/* 프리셋 선택 */}
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">
              프리셋 선택
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(CRON_PRESETS).map(([key, preset]) => (
                <Button
                  key={key}
                  onClick={() => handleLoadPreset(key)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  {preset.description}
                </Button>
              ))}
            </div>
          </Card>

          {/* Cron 필드 입력 */}
          <Card className="p-4 space-y-4">
            <h3 className="text-sm font-medium text-slate-900 dark:text-white">
              Cron 필드 설정
            </h3>

            {/* 초 포함 여부 */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeSeconds"
                checked={includeSeconds}
                onChange={(e) => setIncludeSeconds(e.target.checked)}
                className="rounded"
              />
              <label
                htmlFor="includeSeconds"
                className="text-sm text-slate-700 dark:text-slate-300"
              >
                초(Second) 필드 포함 (Quartz/Spring 형식)
              </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {includeSeconds && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-white">
                    초 (0-59)
                  </label>
                  <input
                    type="text"
                    value={second || "0"}
                    onChange={(e) => setSecond(e.target.value)}
                    placeholder="0, *, */5"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900 dark:text-white">
                  분 (0-59)
                </label>
                <input
                  type="text"
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  placeholder="0, *, */5"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900 dark:text-white">
                  시 (0-23)
                </label>
                <input
                  type="text"
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  placeholder="0, *, 9-17"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900 dark:text-white">
                  일 (1-31)
                </label>
                <input
                  type="text"
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(e.target.value)}
                  placeholder="1, *, 1,15"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900 dark:text-white">
                  월 (1-12)
                </label>
                <input
                  type="text"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  placeholder="1, *, JAN"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900 dark:text-white">
                  요일 (0-7)
                </label>
                <input
                  type="text"
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  placeholder="0, *, MON-FRI"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </Card>

          {/* 빌더 액션 버튼 */}
          <div className="flex gap-2">
            <Button onClick={handleBuildCron} className="flex-1">
              생성 및 검증
            </Button>
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="w-4 h-4" />
              초기화
            </Button>
          </div>
        </TabsContent>

        {/* 표현식 검증 모드 */}
        <TabsContent value="validator" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900 dark:text-white">
              Cron 표현식
            </label>
            <Textarea
              value={cronInput}
              onChange={(e) => setCronInput(e.target.value)}
              placeholder="예: 0 9 * * 1-5 (평일 오전 9시)&#10;또는: 0 0 12 * * * (매일 정오, Quartz 형식)"
              className="font-mono h-24"
            />
          </div>

          {/* 검증 액션 버튼 */}
          <div className="flex gap-2">
            <Button
              onClick={handleValidateCron}
              disabled={!cronInput}
              className="flex-1"
            >
              검증 및 테스트
            </Button>
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="w-4 h-4" />
              초기화
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* 에러 표시 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 결과 표시 */}
      {result && (
        <Card className="p-4 space-y-3 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-green-900 dark:text-green-300">
                Cron 표현식 검증 성공
              </h3>
            </div>
            <Button
              onClick={() => handleCopy(result.expression)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              표현식 복사
            </Button>
          </div>

          <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
            <div>
              <strong>Cron 표현식:</strong>{" "}
              <code className="bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded font-mono">
                {result.expression}
              </code>
            </div>

            <div>
              <strong>설명:</strong> {result.description}
            </div>

            {result.nextExecutionTimes && (
              <div>
                <strong>다음 10번 실행 시간:</strong>
                <ul className="mt-2 space-y-1 ml-4 list-disc">
                  {result.nextExecutionTimes.map((time: string, index: number) => {
                    const date = new Date(time)
                    return (
                      <li key={index} className="font-mono text-xs">
                        {date.toLocaleString("ko-KR", {
                          timeZone: "Asia/Seoul",
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 팁 섹션 */}
      <Card className="p-4 space-y-2 bg-slate-50 dark:bg-slate-900/50">
        <h3 className="font-semibold text-slate-900 dark:text-white">💡 팁</h3>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
          <li>
            Linux 형식: 5필드 (분 시 일 월 요일), 예: <code>0 9 * * 1-5</code>
          </li>
          <li>
            Quartz/Spring 형식: 6필드 (초 분 시 일 월 요일), 예:{" "}
            <code>0 0 12 * * *</code>
          </li>
          <li>
            특수 문자: <code>*</code> (모든 값), <code>*/5</code> (5분마다),{" "}
            <code>1-5</code> (범위), <code>1,15</code> (목록)
          </li>
          <li>
            요일: 0=일요일, 1=월요일, ..., 6=토요일 또는 SUN, MON, ..., SAT
          </li>
          <li>프리셋 버튼으로 자주 사용하는 패턴을 빠르게 생성할 수 있습니다</li>
        </ul>
      </Card>
    </div>
  )
}
