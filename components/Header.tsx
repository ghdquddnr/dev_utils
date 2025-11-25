"use client"

import { ThemeToggle } from "@/components/ThemeToggle"

/**
 * 최상단 헤더 컴포넌트
 * 전체 너비로 표시되며 앱 제목과 테마 토글을 포함합니다.
 */
export function Header() {
  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Dev Utils
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
          개발자 도구 모음
        </p>
      </div>
      <ThemeToggle />
    </header>
  )
}

export default Header
