"use client";

import React, { useState, useEffect } from "react";
import { REDIS_PATTERNS, generateRedisCommand } from "@/lib/redis-patterns";
import { RedisKeyPattern } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, AlertCircle, Search, Terminal } from "lucide-react";
import { toast } from "sonner";

export function RedisKeyScanner() {
  const [selectedPatternId, setSelectedPatternId] = useState<string>("");
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [generatedCommand, setGeneratedCommand] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const selectedPattern = REDIS_PATTERNS.find(p => p.id === selectedPatternId);

  useEffect(() => {
    if (selectedPattern) {
      // 패턴 변경 시 변수 초기화
      const initialVariables: Record<string, string> = {};
      selectedPattern.variables.forEach(v => {
        initialVariables[v.name] = "";
      });
      setVariables(initialVariables);
      setGeneratedCommand("");
      setError(null);
    }
  }, [selectedPatternId]);

  useEffect(() => {
    if (selectedPattern && Object.keys(variables).length > 0) {
      const result = generateRedisCommand(selectedPattern, variables);
      if (result.success) {
        setGeneratedCommand(result.data.command);
        setError(null);
      } else {
        setGeneratedCommand("");
        // 입력 중에는 에러를 바로 표시하지 않고, 생성이 안되는 상태로 둠
        // 또는 특정 조건에서만 에러 표시
      }
    }
  }, [selectedPattern, variables]);

  const handleVariableChange = (name: string, value: string) => {
    setVariables(prev => ({ ...prev, [name]: value }));
  };

  const copyToClipboard = () => {
    if (generatedCommand) {
      navigator.clipboard.writeText(generatedCommand);
      toast.success("명령어가 클립보드에 복사되었습니다");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Redis Key Pattern Scanner</CardTitle>
          <CardDescription>
            자주 사용되는 Redis 키 패턴을 검색하고 명령어를 생성합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pattern Selection */}
          <div className="space-y-2">
            <Label>패턴 선택</Label>
            <Select value={selectedPatternId} onValueChange={setSelectedPatternId}>
              <SelectTrigger>
                <SelectValue placeholder="패턴을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {REDIS_PATTERNS.map(pattern => (
                  <SelectItem key={pattern.id} value={pattern.id}>
                    <span className="font-mono mr-2">[{pattern.category}]</span>
                    {pattern.pattern}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPattern && (
            <>
              <div className="rounded-md bg-muted p-4">
                <p className="text-sm text-muted-foreground mb-2">설명</p>
                <p className="font-medium">{selectedPattern.description}</p>
                <div className="mt-2 flex gap-2 text-xs">
                  <span className="px-2 py-1 rounded bg-primary/10 text-primary font-mono">
                    Type: {selectedPattern.dataType.toUpperCase()}
                  </span>
                  {selectedPattern.defaultTTL && (
                    <span className="px-2 py-1 rounded bg-yellow-500/10 text-yellow-600 font-mono">
                      TTL: {selectedPattern.defaultTTL}s
                    </span>
                  )}
                </div>
              </div>

              {/* Variable Inputs */}
              <div className="space-y-4">
                <Label className="text-base">변수 입력</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  {selectedPattern.variables.map(variable => (
                    <div key={variable.name} className="space-y-2">
                      <Label htmlFor={variable.name} className="flex items-center gap-2">
                        {variable.name}
                        <span className="text-xs text-muted-foreground font-normal">
                          ({variable.type})
                        </span>
                      </Label>
                      <Input
                        id={variable.name}
                        placeholder={variable.description}
                        value={variables[variable.name] || ""}
                        onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Generated Command */}
              <div className="space-y-2">
                <Label className="text-base">생성된 명령어</Label>
                <div className="relative">
                  <div className="rounded-lg bg-black p-4 font-mono text-sm text-green-400 min-h-[60px] flex items-center">
                    {generatedCommand ? (
                      <>
                        <Terminal className="mr-2 h-4 w-4 opacity-50" />
                        {generatedCommand}
                      </>
                    ) : (
                      <span className="text-muted-foreground opacity-50">
                        변수를 모두 입력하면 명령어가 생성됩니다...
                      </span>
                    )}
                  </div>
                  {generatedCommand && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:text-white hover:bg-white/20"
                      onClick={copyToClipboard}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
