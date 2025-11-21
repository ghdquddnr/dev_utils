"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  decodeJwt,
  validateJwtFormat,
  getJwtInfo,
  getExpirationTime,
  getIssuedAtTime,
  isTokenExpired,
} from "@/lib/jwt-handler"
import { copyToClipboard } from "@/lib/utils"
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  RotateCcw,
  Clock,
  AlertTriangle,
} from "lucide-react"

/**
 * JWT Decoder 도구 컴포넌트
 * JWT 토큰을 파싱하고 Header, Payload, Signature를 표시합니다.
 */
export function JwtDecoder() {
  const [input, setInput] = useState("")
  const [header, setHeader] = useState<any>(null)
  const [payload, setPayload] = useState<any>(null)
  const [signature, setSignature] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)
  const [tokenInfo, setTokenInfo] = useState<any>(null)

  /**
   * JWT를 디코딩합니다.
   */
  const handleDecode = () => {
    const result = decodeJwt(input)

    if (result.success) {
      setHeader(result.data.header)
      setPayload(result.data.payload)
      setSignature(result.data.signature)
      setIsValid(true)
      setError(null)

      // 토큰 정보 조회
      const info = getJwtInfo(input)
      setTokenInfo(info)
    } else {
      setError(result.error)
      setIsValid(false)
      setHeader(null)
      setPayload(null)
      setSignature(null)
      setTokenInfo(null)
    }
  }

  /**
   * 입력값이 변경될 때 형식만 검증합니다.
   */
  const handleInputChange = (value: string) => {
    setInput(value)

    // 형식 검증
    if (value.trim()) {
      const isValidFormat = validateJwtFormat(value)
      setIsValid(isValidFormat)
      if (!isValidFormat) {
        setError("유효하지 않은 JWT 형식입니다")
        setHeader(null)
        setPayload(null)
        setSignature(null)
        setTokenInfo(null)
      } else {
        setError(null)
      }
    } else {
      setIsValid(false)
      setError(null)
      setHeader(null)
      setPayload(null)
      setSignature(null)
      setTokenInfo(null)
    }
  }

  /**
   * 입력 및 결과를 초기화합니다.
   */
  const handleReset = () => {
    setInput("")
    setHeader(null)
    setPayload(null)
    setSignature(null)
    setError(null)
    setIsValid(false)
    setTokenInfo(null)
  }

  /**
   * 특정 섹션을 클립보드에 복사합니다.
   */
  const handleCopy = async (text: string, label: string) => {
    await copyToClipboard(text, `${label}이(가) 복사되었습니다`)
  }

  // 만료 정보
  const expiresAt = payload ? getExpirationTime(payload) : null
  const issuedAt = payload ? getIssuedAtTime(payload) : null
  const expired = payload ? isTokenExpired(payload) : false

  return (
    <div className="w-full space-y-4">
      {/* 입력 영역 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-slate-700">
            JWT 토큰 (Input)
          </label>
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${
              isValid
                ? "bg-green-100 text-green-800"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {isValid ? "✓ 형식 유효" : "형식 검증"}
          </span>
        </div>
        <Textarea
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={`JWT 토큰을 여기에 입력하세요...\n\n예시:\neyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`}
          className="h-32 font-mono text-sm resize-none"
        />
      </div>

      {/* 에러 메시지 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>JWT 오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 디코딩 결과 */}
      {header && payload && (
        <div className="space-y-4">
          {/* 토큰 상태 */}
          {tokenInfo && (
            <div
              className={`rounded-lg p-3 border ${
                expired
                  ? "bg-orange-50 border-orange-200"
                  : "bg-green-50 border-green-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {expired ? (
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
                <span className={expired ? "text-orange-800" : "text-green-800"}>
                  {tokenInfo.message}
                </span>
              </div>
            </div>
          )}

          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-700">Header</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopy(JSON.stringify(header, null, 2), "Header")}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <Card className="bg-slate-50 border-slate-200 p-4">
              <pre className="font-mono text-xs whitespace-pre-wrap break-words text-slate-800">
                {JSON.stringify(header, null, 2)}
              </pre>
            </Card>
          </div>

          {/* Payload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-700">Payload</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopy(JSON.stringify(payload, null, 2), "Payload")}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <Card className="bg-slate-50 border-slate-200 p-4">
              <pre className="font-mono text-xs whitespace-pre-wrap break-words max-h-48 overflow-y-auto text-slate-800">
                {JSON.stringify(payload, null, 2)}
              </pre>
            </Card>

            {/* 시간 정보 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {issuedAt && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 flex items-start gap-2">
                  <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-blue-900">발급 (iat)</p>
                    <p className="text-xs text-blue-800">{issuedAt}</p>
                  </div>
                </div>
              )}
              {expiresAt && (
                <div
                  className={`rounded-lg p-2 flex items-start gap-2 border ${
                    expired
                      ? "bg-orange-50 border-orange-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <Clock
                    className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                      expired ? "text-orange-600" : "text-green-600"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-xs font-semibold ${
                        expired ? "text-orange-900" : "text-green-900"
                      }`}
                    >
                      만료 (exp)
                    </p>
                    <p
                      className={`text-xs ${
                        expired ? "text-orange-800" : "text-green-800"
                      }`}
                    >
                      {expiresAt}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Signature */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-700">Signature</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopy(signature || "", "Signature")}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <Card className="bg-slate-50 border-slate-200 p-4">
              <p className="font-mono text-xs break-all text-slate-800">{signature}</p>
            </Card>
            <p className="text-xs text-slate-500 mt-2">
              ℹ️ 서명 검증은 오프라인 모드에서는 수행되지 않습니다.
            </p>
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={handleDecode} className="flex-1 sm:flex-none">
          디코딩
        </Button>

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
          <span className="font-semibold">💡 팁:</span> JWT는 점(.)으로 구분된 3부분
          (header.payload.signature)으로 이루어져 있습니다. 형식이 유효하면 디코딩 버튼을
          클릭하세요.
        </p>
      </div>
    </div>
  )
}

export default JwtDecoder
