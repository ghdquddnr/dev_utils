"use client"

import { Card } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface ToolPlaceholderProps {
  toolName: string
}

export function ToolPlaceholder({ toolName }: ToolPlaceholderProps) {
  return (
    <Card className="p-8 border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-900/20">
      <div className="flex items-start gap-4">
        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-1 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
            {toolName} - 개발 중
          </h3>
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            이 도구는 현재 개발 중입니다. 곧 사용 가능할 예정입니다.
          </p>
        </div>
      </div>
    </Card>
  )
}
