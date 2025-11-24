"use client";

import React, { useState, useEffect } from "react";
import {
  searchPatterns,
  testRegex,
  getAllCategories,
  getComplexityLevels,
  getCategoryColor,
  getComplexityColor,
} from "@/lib/regex-handler";
import { RegexPattern } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, Search, CheckCircle2, XCircle, Code2 } from "lucide-react";
import { toast } from "sonner";

export function RegexTester() {
  // 패턴 라이브러리 상태
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedComplexity, setSelectedComplexity] = useState<string>("All");
  const [searchResults, setSearchResults] = useState<RegexPattern[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<RegexPattern | null>(null);

  // 테스터 상태
  const [pattern, setPattern] = useState<string>("");
  const [flags, setFlags] = useState<string>("");
  const [testString, setTestString] = useState<string>("");
  const [testResult, setTestResult] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);

  // 기타 상태
  const [activeLanguage, setActiveLanguage] = useState<string>("javascript");

  const categories = ["All", ...getAllCategories()];
  const complexityLevels = ["All", ...getComplexityLevels()];

  // 패턴 검색 실행
  useEffect(() => {
    const filters: any = {};
    if (selectedCategory !== "All") filters.category = selectedCategory;
    if (selectedComplexity !== "All") filters.complexity = selectedComplexity;

    const results = searchPatterns(searchQuery, filters);
    setSearchResults(results);
  }, [searchQuery, selectedCategory, selectedComplexity]);

  // 패턴 선택 핸들러
  const handleSelectPattern = (patternData: RegexPattern) => {
    setSelectedPattern(patternData);
    setPattern(patternData.pattern);
    setFlags(patternData.flags);
    setTestString(""); // 테스트 문자열 초기화
    setTestResult(null);
    setTestError(null);
    setActiveLanguage("javascript");
  };

  // 테스트 실행 핸들러
  const handleTest = () => {
    setTestError(null);
    setTestResult(null);

    const result = testRegex(pattern, flags, testString);

    if (result.success) {
      setTestResult(result.data);
    } else {
      setTestError(result.error);
    }
  };

  // 예제 로드 핸들러
  const loadExample = (type: "valid" | "invalid", index: number) => {
    if (!selectedPattern) return;

    const examples =
      type === "valid"
        ? selectedPattern.examples.valid
        : selectedPattern.examples.invalid;

    if (examples && examples[index]) {
      setTestString(examples[index]);
      setTestResult(null);
      setTestError(null);
    }
  };

  // 클립보드 복사
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label}가 클립보드에 복사되었습니다`);
  };

  // 초기화 핸들러
  const handleReset = () => {
    setPattern("");
    setFlags("");
    setTestString("");
    setTestResult(null);
    setTestError(null);
    setSelectedPattern(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 왼쪽: 패턴 라이브러리 */}
      <Card>
        <CardHeader>
          <CardTitle>패턴 라이브러리</CardTitle>
          <CardDescription>
            사전 정의된 정규식 패턴을 검색하고 선택하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 검색 입력 */}
          <div className="space-y-2">
            <Label>검색</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="패턴 이름, 설명으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* 필터 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>카테고리</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>복잡도</Label>
              <Select
                value={selectedComplexity}
                onValueChange={setSelectedComplexity}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {complexityLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 검색 결과 카운트 */}
          <div className="text-sm text-muted-foreground">
            {searchResults.length}개의 패턴이 발견되었습니다
          </div>

          {/* 패턴 목록 */}
          <div className="grid gap-3 max-h-96 overflow-y-auto">
            {searchResults.map((patternData) => (
              <Card
                key={patternData.id}
                className={`cursor-pointer transition-colors ${
                  selectedPattern?.id === patternData.id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => handleSelectPattern(patternData)}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{patternData.name}</span>
                      <div className="flex gap-1">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(
                            patternData.category
                          )}`}
                        >
                          {patternData.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${getComplexityColor(
                            patternData.complexity
                          )}`}
                        >
                          {patternData.complexity}
                        </span>
                      </div>
                    </div>
                    <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
                      {patternData.pattern}
                    </code>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {patternData.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {searchResults.length === 0 && (
            <Alert>
              <Search className="h-4 w-4" />
              <AlertTitle>검색 결과 없음</AlertTitle>
              <AlertDescription>
                검색 조건에 맞는 패턴이 없습니다. 다른 검색어나 필터를 시도해보세요.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 오른쪽: 테스터 */}
      <div className="space-y-6">
        {/* 테스터 입력 */}
        <Card>
          <CardHeader>
            <CardTitle>RegEx 테스터</CardTitle>
            <CardDescription>
              정규식을 테스트하고 결과를 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 패턴 입력 */}
            <div className="space-y-2">
              <Label>정규식 패턴</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="정규식 패턴을 입력하세요..."
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  className="flex-1 font-mono"
                />
                <Input
                  placeholder="플래그"
                  value={flags}
                  onChange={(e) => setFlags(e.target.value)}
                  className="w-20 font-mono"
                  maxLength={5}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                플래그: g (전역), i (대소문자 무시), m (여러 줄)
              </p>
            </div>

            {/* 테스트 문자열 */}
            <div className="space-y-2">
              <Label>테스트 문자열</Label>
              <Textarea
                placeholder="테스트할 문자열을 입력하세요..."
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                className="font-mono min-h-24"
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-2">
              <Button onClick={handleTest} className="flex-1">
                <Search className="h-4 w-4 mr-2" />
                테스트
              </Button>
              <Button onClick={handleReset} variant="outline">
                초기화
              </Button>
            </div>

            {/* 에러 메시지 */}
            {testError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>에러</AlertTitle>
                <AlertDescription>{testError}</AlertDescription>
              </Alert>
            )}

            {/* 테스트 결과 */}
            {testResult && (
              <Alert variant={testResult.isMatch ? "default" : "destructive"}>
                {testResult.isMatch ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {testResult.isMatch ? "매칭 성공" : "매칭 실패"}
                </AlertTitle>
                <AlertDescription>
                  {testResult.isMatch ? (
                    <div className="space-y-2 mt-2">
                      <p className="font-semibold">
                        {testResult.matchCount}개의 매칭이 발견되었습니다
                      </p>
                      <div className="space-y-1">
                        {testResult.matches.map((match: string, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded"
                          >
                            <code className="text-sm">{match}</code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(match, "매칭 결과")}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    "매칭되는 패턴이 없습니다"
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* 선택된 패턴 상세 정보 */}
        {selectedPattern && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedPattern.name}</span>
                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${getCategoryColor(
                      selectedPattern.category
                    )}`}
                  >
                    {selectedPattern.category}
                  </span>
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${getComplexityColor(
                      selectedPattern.complexity
                    )}`}
                  >
                    {selectedPattern.complexity}
                  </span>
                </div>
              </CardTitle>
              <CardDescription>{selectedPattern.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 패턴과 플래그 */}
              <div className="space-y-2">
                <Label>패턴</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 rounded bg-muted font-mono text-sm">
                    {selectedPattern.pattern}
                  </code>
                  <code className="px-3 py-2 rounded bg-muted font-mono text-sm">
                    {selectedPattern.flags || "-"}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      copyToClipboard(selectedPattern.pattern, "패턴")
                    }
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* 예제 */}
              <div className="space-y-3">
                <Label>예제</Label>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Valid 예제 */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      ✓ 유효한 예제
                    </span>
                    <div className="space-y-1">
                      {selectedPattern.examples.valid.map((example, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded text-sm cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30"
                          onClick={() => loadExample("valid", idx)}
                        >
                          <code>{example}</code>
                          <Button size="sm" variant="ghost">
                            로드
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Invalid 예제 */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-red-700 dark:text-red-400">
                      ✗ 유효하지 않은 예제
                    </span>
                    <div className="space-y-1">
                      {selectedPattern.examples.invalid.map((example, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded text-sm cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30"
                          onClick={() => loadExample("invalid", idx)}
                        >
                          <code>{example}</code>
                          <Button size="sm" variant="ghost">
                            로드
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 사용 예제 코드 */}
              <div className="space-y-3">
                <Label>사용 예제 코드</Label>
                {/* 언어 선택 */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={activeLanguage === "javascript" ? "default" : "outline"}
                    onClick={() => setActiveLanguage("javascript")}
                  >
                    <Code2 className="h-3 w-3 mr-1" />
                    JavaScript
                  </Button>
                  {selectedPattern.usage.java && (
                    <Button
                      size="sm"
                      variant={activeLanguage === "java" ? "default" : "outline"}
                      onClick={() => setActiveLanguage("java")}
                    >
                      <Code2 className="h-3 w-3 mr-1" />
                      Java
                    </Button>
                  )}
                </div>

                {/* 코드 블록 */}
                <div className="relative">
                  <pre className="rounded-lg bg-slate-950 dark:bg-slate-900 p-4 overflow-x-auto">
                    <code className="text-sm text-slate-50">
                      {activeLanguage === "javascript"
                        ? selectedPattern.usage.javascript
                        : selectedPattern.usage.java}
                    </code>
                  </pre>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-2 text-white hover:text-white hover:bg-white/20"
                    onClick={() =>
                      copyToClipboard(
                        activeLanguage === "javascript"
                          ? selectedPattern.usage.javascript
                          : selectedPattern.usage.java || "",
                        "코드 예제"
                      )
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
