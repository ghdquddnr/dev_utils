"use client"

/**
 * Timestamp 변환기 컴포넌트
 * Unix Timestamp와 날짜 간의 상호 변환을 제공합니다.
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
} from "lucide-react"
import {
  timestampToDate,
  dateToTimestamp,
  getCurrentTime,
} from "@/lib/timestamp-handler"

export function TimestampConverter() {
  // 모드 상태 (Timestamp→Date, Date→Timestamp)
  const [mode, setMode] = useState<"timestamp-to-date" | "date-to-timestamp">(
    "timestamp-to-date"
  )

  // 입력 상태
  const [timestampInput, setTimestampInput] = useState("")
  const [dateInput, setDateInput] = useState("")

  // 결과 및 에러 상태
  const [result, setResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 옵션 상태
  const [timezone, setTimezone] = useState<string>("KST")
  const [unit, setUnit] = useState<"s" | "ms">("ms")

  // 현재 시간 상태
  const [currentTime, setCurrentTime] = useState<any | null>(null)

  /**
   * Timestamp → Date 변환
   */
  const handleTimestampToDate = () => {
    const ts = parseInt(timestampInput, 10)
    if (isNaN(ts)) {
      setError("유효한 숫자를 입력해주세요")
      setResult(null)
      return
    }

    const res = timestampToDate(ts, timezone, unit)
    if (res.success) {
      setResult(res.data)
      setError(null)
    } else {
      setError(res.error)
      setResult(null)
    }
  }

  /**
   * Date → Timestamp 변환
   */
  const handleDateToTimestamp = () => {
    if (!dateInput) {
      setError("날짜를 입력해주세요")
      setResult(null)
      return
    }

    const date = new Date(dateInput)
    const res = dateToTimestamp(date, timezone, unit)
    if (res.success) {
      setResult(res.data)
      setError(null)
    } else {
      setError(res.error)
      setResult(null)
    }
  }

  /**
   * 현재 시간 가져오기
   */
  const handleGetCurrentTime = () => {
    const res = getCurrentTime(timezone)
    if (res.success) {
      setCurrentTime(res.data)
      setError(null)
    } else {
      setError(res.error)
      setCurrentTime(null)
    }
  }

  /**
   * 모드 전환 시 초기화
   */
  const handleModeChange = (newMode: "timestamp-to-date" | "date-to-timestamp") => {
    setMode(newMode)
    setTimestampInput("")
    setDateInput("")
    setResult(null)
    setError(null)
  }

  /**
   * 변환 실행
   */
  const handleConvert = () => {
    if (mode === "timestamp-to-date") {
      handleTimestampToDate()
    } else {
      handleDateToTimestamp()
    }
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
    setTimestampInput("")
    setDateInput("")
    setResult(null)
    setError(null)
    setCurrentTime(null)
  }

  return (
    <div className="space-y-6">
      {/* 모드 선택 탭 */}
      <Tabs
        value={mode}
        onValueChange={(value) =>
          handleModeChange(value as "timestamp-to-date" | "date-to-timestamp")
        }
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="timestamp-to-date">
            Timestamp → 날짜
          </TabsTrigger>
          <TabsTrigger value="date-to-timestamp">
            날짜 → Timestamp
          </TabsTrigger>
        </TabsList>

        {/* Timestamp → Date 모드 */}
        <TabsContent value="timestamp-to-date" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900 dark:text-white">
              Unix Timestamp
            </label>
            <Textarea
              value={timestampInput}
              onChange={(e) => setTimestampInput(e.target.value)}
              placeholder="예: 1609459200 (초) 또는 1609459200000 (밀리초)"
              className="font-mono h-24"
            />
          </div>
        </TabsContent>

        {/* 날짜 → Timestamp 모드 */}
        <TabsContent value="date-to-timestamp" className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="date-input"
              className="text-sm font-medium text-slate-900 dark:text-white"
            >
              날짜/시간 선택
            </label>
            <input
              id="date-input"
              type="datetime-local"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* 옵션 패널 */}
      <Card className="p-4 space-y-4">
        <h3 className="text-sm font-medium text-slate-900 dark:text-white">
          변환 옵션
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* 타임존 선택 */}
          <div className="space-y-2">
            <label className="text-sm text-slate-700 dark:text-slate-300">
              타임존
            </label>
            <Tabs value={timezone} onValueChange={setTimezone}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="KST">KST</TabsTrigger>
                <TabsTrigger value="UTC">UTC</TabsTrigger>
                <TabsTrigger value="JST">JST</TabsTrigger>
              </TabsList>
            </Tabs>
            <Tabs value={timezone} onValueChange={setTimezone}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="EST">EST</TabsTrigger>
                <TabsTrigger value="CST">CST</TabsTrigger>
                <TabsTrigger value="PST">PST</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* 단위 선택 */}
          <div className="space-y-2">
            <label className="text-sm text-slate-700 dark:text-slate-300">
              Timestamp 단위
            </label>
            <Tabs value={unit} onValueChange={(v) => setUnit(v as "s" | "ms")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="s">초 (s)</TabsTrigger>
                <TabsTrigger value="ms">밀리초 (ms)</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </Card>

      {/* 액션 버튼 */}
      <div className="flex gap-2">
        <Button
          onClick={handleGetCurrentTime}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Clock className="w-4 h-4" />
          지금
        </Button>
        <Button
          onClick={handleConvert}
          disabled={mode === "timestamp-to-date" ? !timestampInput : !dateInput}
          className="flex-1"
        >
          변환
        </Button>
        <Button onClick={handleReset} variant="outline">
          <RotateCcw className="w-4 h-4" />
          초기화
        </Button>
      </div>

      {/* 에러 표시 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 현재 시간 표시 */}
      {currentTime && (
        <Card className="p-4 space-y-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-blue-900 dark:text-blue-300">
              현재 시간
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-blue-700 dark:text-blue-400">UTC:</span>{" "}
              {currentTime.utc}
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-400">KST:</span>{" "}
              {currentTime.kst}
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-400">요일:</span>{" "}
              {currentTime.dayOfWeek}
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-400">ISO 8601:</span>{" "}
              {currentTime.iso8601}
            </div>
          </div>
        </Card>
      )}

      {/* 변환 결과 */}
      {result && (
        <Card className="p-4 space-y-3 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-green-900 dark:text-green-300">
                변환 성공
              </h3>
            </div>
            {result.timestamp !== undefined && (
              <Button
                onClick={() => handleCopy(result.timestamp.toString())}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                Timestamp 복사
              </Button>
            )}
          </div>

          <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <strong>UTC:</strong> {result.utc}
              </div>
              <div>
                <strong>KST:</strong> {result.kst}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <strong>요일:</strong> {result.dayOfWeek}
              </div>
              <div>
                <strong>상대 시간:</strong> {result.relativeTime}
              </div>
            </div>

            <div>
              <strong>ISO 8601:</strong> {result.iso8601}
            </div>

            {result.timestamp !== undefined && (
              <div>
                <strong>Timestamp:</strong>{" "}
                <code className="bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded">
                  {result.timestamp}
                </code>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 팁 섹션 */}
      <Card className="p-4 space-y-2 bg-slate-50 dark:bg-slate-900/50">
        <h3 className="font-semibold text-slate-900 dark:text-white">💡 팁</h3>
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
          <li>Unix Timestamp는 1970-01-01 00:00:00 UTC부터의 시간입니다</li>
          <li>초 단위는 10자리, 밀리초 단위는 13자리 숫자입니다</li>
          <li>"지금" 버튼으로 현재 시간을 확인할 수 있습니다</li>
          <li>다양한 타임존을 선택하여 변환할 수 있습니다</li>
        </ul>
      </Card>
    </div>
  )
}
