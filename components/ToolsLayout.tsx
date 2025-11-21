"use client"

import { useState } from "react"
import { Sidebar } from "@/components/Sidebar"
import { JsonFormatter } from "@/components/tools/JsonFormatter"
import { JwtDecoder } from "@/components/tools/JwtDecoder"
import { SqlBinder } from "@/components/tools/SqlBinder"
import { JavaJsonConverter } from "@/components/tools/JavaJsonConverter"
import { YamlPropertiesConverter } from "@/components/tools/YamlPropertiesConverter"
import { TimestampConverter } from "@/components/tools/TimestampConverter"
import { CronExpressionGenerator } from "@/components/tools/CronExpressionGenerator"
import { ToolPlaceholder } from "@/components/tools/ToolPlaceholder"

interface ToolsLayoutProps {
  children?: React.ReactNode
}

/**
 * 사이드바 기반 도구 레이아웃 컴포넌트
 * 좌측 사이드바로 메뉴를 선택하고, 메인 영역에 선택된 도구를 표시합니다.
 */
export function ToolsLayout({ children }: ToolsLayoutProps) {
  const [activeTab, setActiveTab] = useState("json")

  const renderToolContent = () => {
    switch (activeTab) {
      // 기존 도구
      case "json":
        return <JsonFormatter />
      case "jwt":
        return <JwtDecoder />
      case "sql":
        return <SqlBinder />

      // 새로운 도구
      case "java-json":
        return <JavaJsonConverter />
      case "yaml-properties":
        return <YamlPropertiesConverter />
      case "timestamp":
        return <TimestampConverter />
      case "cron":
        return <CronExpressionGenerator />
      case "url":
        return <ToolPlaceholder toolName="URL Encoder/Decoder" />
      case "redis":
        return <ToolPlaceholder toolName="Redis Key 패턴 스캐너" />
      case "error-code":
        return <ToolPlaceholder toolName="에러 코드 조회기" />
      case "regex":
        return <ToolPlaceholder toolName="RegEx 테스트 & 라이브러리" />

      default:
        return <JsonFormatter />
    }
  }

  const getToolTitle = () => {
    const titles: Record<string, string> = {
      "json": "JSON 포매터",
      "jwt": "JWT 디코더",
      "sql": "SQL 파라미터 바인더",
      "java-json": "Java ↔ JSON 변환기",
      "yaml-properties": "YAML ↔ Properties 변환기",
      "timestamp": "Epoch/Unix Timestamp 변환기",
      "cron": "Cron Expression 생성기",
      "url": "URL Encode/Decode",
      "redis": "Redis Key 패턴 스캐너",
      "error-code": "에러 코드 조회기",
      "regex": "정규식(RegEx) 테스트 & 라이브러리",
    }
    return titles[activeTab] || "개발자 도구"
  }

  const getToolDescription = () => {
    const descriptions: Record<string, string> = {
      "json": "JSON을 포맷팅하고 검증하세요",
      "jwt": "JWT 토큰을 디코딩하세요 (오프라인)",
      "sql": "SQL 쿼리에 파라미터를 바인딩하세요",
      "java-json": "Java 클래스와 JSON을 상호 변환하세요",
      "yaml-properties": "YAML과 Properties 형식을 변환하세요",
      "timestamp": "Unix Timestamp와 날짜를 변환하세요",
      "cron": "Cron 표현식을 생성하고 테스트하세요",
      "url": "URL을 인코딩/디코딩하고 파라미터를 분석하세요",
      "redis": "Redis Key 패턴을 관리하고 명령어를 생성하세요",
      "error-code": "에러 코드를 검색하고 해결책을 확인하세요",
      "regex": "정규식을 테스트하고 패턴을 관리하세요",
    }
    return descriptions[activeTab] || "모든 데이터는 클라이언트에서 처리됩니다"
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950">
      {/* 사이드바 */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 메인 콘텐츠 */}
      <main className="ml-64 flex-1">
        <div className="h-screen overflow-y-auto bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
          {/* 헤더 */}
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-8 py-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {getToolTitle()}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {getToolDescription()}
            </p>
          </div>

          {/* 콘텐츠 영역 */}
          <div className="p-8">
            <div className="max-w-5xl">
              {/* 보안 안내 */}
              <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
                <div className="text-blue-600 dark:text-blue-400 text-lg mt-0.5 flex-shrink-0">
                  🔒
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                    보안 안내
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    모든 데이터는 클라이언트(브라우저) 내에서만 처리되며, 서버로
                    전송되지 않습니다. 민감한 정보를 안전하게 처리할 수 있습니다.
                  </p>
                </div>
              </div>

              {/* 도구 콘텐츠 */}
              {renderToolContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ToolsLayout
