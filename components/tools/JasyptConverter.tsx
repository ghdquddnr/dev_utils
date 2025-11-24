"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, RefreshCw, ChevronDown, ChevronUp, Lock, Unlock } from "lucide-react"
import { toast } from "sonner"
import type { JasyptApiRequest, JasyptApiResponse } from "@/lib/types"

/**
 * Jasypt 암호화/복호화 컴포넌트
 *
 * Java CLI 도구를 사용하여 Jasypt 암호화/복호화를 수행합니다.
 * LocalStorage에 설정을 저장하여 다음 사용 시 복원합니다.
 */
export function JasyptConverter() {
  // 기본 상태
  const [key, setKey] = useState<string>("")
  const [text, setText] = useState<string>("")
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // 고급 설정
  const [algorithm, setAlgorithm] = useState<string>("PBEWithSHA256And128BitAES-CBC-BC")
  const [outputType, setOutputType] = useState<string>("hexadecimal")
  const [poolSize, setPoolSize] = useState<string>("1")
  const [isOpen, setIsOpen] = useState<boolean>(false)

  // LocalStorage에서 설정 복원 (페이지 로드 시)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAlgorithm = localStorage.getItem("jasypt_algorithm")
      const savedOutputType = localStorage.getItem("jasypt_outputType")
      const savedPoolSize = localStorage.getItem("jasypt_poolSize")

      if (savedAlgorithm) setAlgorithm(savedAlgorithm)
      if (savedOutputType) setOutputType(savedOutputType)
      if (savedPoolSize) setPoolSize(savedPoolSize)
    }
  }, [])

  // 설정을 LocalStorage에 저장
  const saveSettings = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("jasypt_algorithm", algorithm)
      localStorage.setItem("jasypt_outputType", outputType)
      localStorage.setItem("jasypt_poolSize", poolSize)
    }
  }

  // 암호화/복호화 처리
  const handleProcess = async (mode: "encrypt" | "decrypt") => {
    setError(null)
    setResult(null)

    // 입력 검증
    if (!key.trim()) {
      setError("Secret Key를 입력해주세요")
      return
    }

    if (!text.trim()) {
      setError("입력 텍스트를 입력해주세요")
      return
    }

    // 설정 저장
    saveSettings()

    setIsLoading(true)

    try {
      // API 요청
      const requestBody: JasyptApiRequest = {
        mode,
        text: text.trim(),
        password: key.trim(),
        algorithm,
        outputType,
        poolSize,
      }

      const response = await fetch("/api/jasypt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data: JasyptApiResponse = await response.json()

      if (response.ok && data.result) {
        // 성공
        setResult(data.result)
        toast.success(`${mode === "encrypt" ? "암호화" : "복호화"} 완료!`)
      } else {
        // 실패
        setError(data.error || "처리 중 오류가 발생했습니다")
        toast.error(data.error || "처리 실패")
      }
    } catch (err: any) {
      setError("서버와의 통신 중 오류가 발생했습니다")
      toast.error("통신 오류")
      console.error("Jasypt API Error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // 결과 복사
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("클립보드에 복사되었습니다")
    } catch (error) {
      toast.error("복사에 실패했습니다")
    }
  }

  // 초기화
  const handleReset = () => {
    setText("")
    setResult(null)
    setError(null)
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Jasypt Encryptor/Decryptor
        </CardTitle>
        <CardDescription>
          Jasypt를 사용하여 문자열을 암호화하거나 복호화합니다
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Secret Key 입력 */}
        <div className="space-y-2">
          <Label htmlFor="secret-key" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Secret Key (Password)
          </Label>
          <Input
            id="secret-key"
            type="password"
            placeholder="암호화/복호화에 사용할 Secret Key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            disabled={isLoading}
          />
          <p className="text-xs text-slate-600 dark:text-slate-400">
            암호화 시 사용한 Key와 동일한 Key로 복호화해야 합니다
          </p>
        </div>

        {/* 입력 텍스트 */}
        <div className="space-y-2">
          <Label htmlFor="input-text">Target Text</Label>
          <Input
            id="input-text"
            type="text"
            placeholder="ENC(...) 또는 평문 텍스트"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
          />
          <p className="text-xs text-slate-600 dark:text-slate-400">
            복호화 시 ENC() 래퍼는 자동으로 제거됩니다
          </p>
        </div>

        {/* 고급 설정 */}
        <div className="border rounded-lg p-4 space-y-4">
          <button
            className="flex items-center justify-between w-full text-left"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="font-semibold text-sm">고급 설정</span>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {isOpen && (
            <div className="space-y-4 pt-2">
              {/* Algorithm */}
              <div className="space-y-2">
                <Label htmlFor="algorithm">Algorithm</Label>
                <Select value={algorithm} onValueChange={setAlgorithm} disabled={isLoading}>
                  <SelectTrigger id="algorithm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PBEWithSHA256And128BitAES-CBC-BC">
                      PBEWithSHA256And128BitAES-CBC-BC (권장)
                    </SelectItem>
                    <SelectItem value="PBEWithSHA256And256BitAES-CBC-BC">
                      PBEWithSHA256And256BitAES-CBC-BC
                    </SelectItem>
                    <SelectItem value="PBEWithMD5AndTripleDES">
                      PBEWithMD5AndTripleDES
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Output Type */}
              <div className="space-y-2">
                <Label htmlFor="output-type">Output Type</Label>
                <Select value={outputType} onValueChange={setOutputType} disabled={isLoading}>
                  <SelectTrigger id="output-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hexadecimal">Hexadecimal (16진수)</SelectItem>
                    <SelectItem value="base64">Base64</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pool Size */}
              <div className="space-y-2">
                <Label htmlFor="pool-size">Pool Size</Label>
                <Input
                  id="pool-size"
                  type="number"
                  min="1"
                  max="10"
                  value={poolSize}
                  onChange={(e) => setPoolSize(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Encryptor 풀 크기 (1-10, 보통 1 사용)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 버튼 그룹 */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => handleProcess("decrypt")}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Unlock className="h-4 w-4" />
            {isLoading ? "처리 중..." : "복호화 (Decrypt)"}
          </Button>
          <Button
            onClick={() => handleProcess("encrypt")}
            disabled={isLoading}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Lock className="h-4 w-4" />
            {isLoading ? "처리 중..." : "암호화 (Encrypt)"}
          </Button>
          <Button
            onClick={handleReset}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            초기화
          </Button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 결과 영역 */}
        {result && (
          <div className="space-y-3">
            <Label>결과 (클릭하여 복사)</Label>
            <div
              className="relative group cursor-pointer"
              onClick={() => handleCopy(result)}
            >
              <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto text-sm border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                {result}
              </pre>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Copy className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
            <Button
              onClick={() => handleCopy(result)}
              variant="outline"
              size="sm"
              className="w-full flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              클립보드에 복사
            </Button>
          </div>
        )}

        {/* 팁 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-300 mb-2">
            💡 사용 팁
          </h4>
          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
            <li>Secret Key는 암호화/복호화 시 동일해야 합니다</li>
            <li>복호화 시 ENC() 래퍼는 자동으로 제거됩니다</li>
            <li>Algorithm과 Output Type은 암호화/복호화 시 동일해야 합니다</li>
            <li>고급 설정은 LocalStorage에 자동 저장됩니다</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default JasyptConverter
