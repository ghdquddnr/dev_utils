"use client"

import { ThemeToggle } from "@/components/ThemeToggle"
import {
  FileJson,
  Lock,
  Database,
  ArrowRightLeft,
  Settings,
  Clock,
  Zap,
  Link2,
  Cpu,
  AlertCircle,
  FileText,
} from "lucide-react"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

/**
 * 좌측 사이드바 네비게이션 컴포넌트
 * 메뉴 선택 및 테마 토글 기능
 * 섹션: 기존 도구, 변환, 시간 & 데이터, 보안 & 유틸리티, 사내 특화
 */
export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuSections = [
    {
      title: "기본 도구",
      items: [
        {
          id: "json",
          icon: FileJson,
          label: "JSON",
          description: "포맷팅 & 검증",
        },
        {
          id: "jwt",
          icon: Lock,
          label: "JWT",
          description: "토큰 디코딩",
        },
        {
          id: "sql",
          icon: Database,
          label: "SQL",
          description: "파라미터 바인딩",
        },
      ],
    },
    {
      title: "변환 & 포맷팅",
      items: [
        {
          id: "java-json",
          icon: ArrowRightLeft,
          label: "Java ↔ JSON",
          description: "클래스 변환",
        },
        {
          id: "yaml-properties",
          icon: Settings,
          label: "YAML ↔ Props",
          description: "설정 변환",
        },
      ],
    },
    {
      title: "시간 & 데이터",
      items: [
        {
          id: "timestamp",
          icon: Clock,
          label: "Timestamp",
          description: "시간 변환",
        },
        {
          id: "cron",
          icon: Zap,
          label: "Cron",
          description: "스케줄 생성",
        },
      ],
    },
    {
      title: "보안 & 유틸리티",
      items: [
        {
          id: "url",
          icon: Link2,
          label: "URL",
          description: "인코딩/디코딩",
        },
        {
          id: "redis",
          icon: Cpu,
          label: "Redis",
          description: "키 패턴 관리",
        },
      ],
    },
    {
      title: "사내 특화",
      items: [
        {
          id: "error-code",
          icon: AlertCircle,
          label: "에러 코드",
          description: "조회 & 검색",
        },
        {
          id: "regex",
          icon: FileText,
          label: "RegEx",
          description: "패턴 테스트",
        },
      ],
    },
  ]

  return (
    <aside className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen fixed left-0 top-0">
      {/* 헤더 */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Dev Utils
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          개발자 도구 모음
        </p>
      </div>

      {/* 메뉴 */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto space-y-6">
        {menuSections.map((section) => (
          <div key={section.title}>
            {/* 섹션 제목 */}
            <h3 className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {section.title}
            </h3>

            {/* 섹션 아이템 */}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500 text-blue-900 dark:text-blue-300"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-l-4 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-semibold text-sm">{item.label}</div>
                        <div className="text-xs opacity-70">{item.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 푸터 - 테마 토글 */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            테마
          </span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
