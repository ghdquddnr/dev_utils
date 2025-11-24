/**
 * RegEx 패턴 관리 및 테스트 핸들러
 * 정규식 패턴 라이브러리를 관리하고 테스트 기능을 제공합니다.
 */

import regexPatternsData from "@/lib/data/regex-patterns.json";
import {
  RegexPattern,
  RegexTestData,
  RegexTestResult,
  ErrorResponse,
  Result,
} from "@/lib/types";

/**
 * 모든 정규식 패턴을 로드합니다.
 * @returns 정규식 패턴 배열
 */
export function loadRegexPatterns(): RegexPattern[] {
  return regexPatternsData as RegexPattern[];
}

/**
 * 검색 필터 인터페이스
 */
interface SearchFilters {
  category?: string;
  complexity?: string;
}

/**
 * 정규식 패턴을 검색하고 필터링합니다.
 * @param query - 검색어 (선택사항)
 * @param filters - 검색 필터 (카테고리, 복잡도)
 * @returns 필터링된 패턴 배열
 */
export function searchPatterns(
  query?: string,
  filters?: SearchFilters
): RegexPattern[] {
  let patterns = loadRegexPatterns();

  // 검색어가 있으면 필터링
  if (query && query.trim() !== "") {
    const lowerQuery = query.toLowerCase();
    patterns = patterns.filter(
      (pattern) =>
        pattern.name.toLowerCase().includes(lowerQuery) ||
        pattern.description.toLowerCase().includes(lowerQuery) ||
        pattern.pattern.toLowerCase().includes(lowerQuery) ||
        pattern.id.toLowerCase().includes(lowerQuery) ||
        pattern.category.toLowerCase().includes(lowerQuery)
    );
  }

  // 카테고리 필터
  if (filters?.category && filters.category !== "All") {
    patterns = patterns.filter((p) => p.category === filters.category);
  }

  // 복잡도 필터
  if (filters?.complexity && filters.complexity !== "All") {
    patterns = patterns.filter((p) => p.complexity === filters.complexity);
  }

  return patterns;
}

/**
 * ID로 특정 패턴을 조회합니다.
 * @param id - 패턴 ID
 * @returns Result<RegexPattern> 조회 결과
 */
export function getPatternById(
  id: string
): Result<{ pattern: RegexPattern }> {
  if (!id || id.trim() === "") {
    return {
      success: false,
      error: "패턴 ID를 입력해주세요",
    } as ErrorResponse;
  }

  const patterns = loadRegexPatterns();
  const pattern = patterns.find((p) => p.id === id);

  if (!pattern) {
    return {
      success: false,
      error: `패턴 ID '${id}'를 찾을 수 없습니다`,
    } as ErrorResponse;
  }

  return {
    success: true,
    data: { pattern },
  };
}

/**
 * 정규식을 테스트하고 결과를 반환합니다.
 * @param pattern - 정규식 패턴 문자열
 * @param flags - 정규식 플래그 (g, i, m 등)
 * @param testString - 테스트할 문자열
 * @returns RegexTestResult 테스트 결과
 */
export function testRegex(
  pattern: string,
  flags: string,
  testString: string
): RegexTestResult {
  // 입력 검증
  if (!pattern || pattern.trim() === "") {
    return {
      success: false,
      error: "정규식 패턴을 입력해주세요",
    } as ErrorResponse;
  }

  if (testString === undefined || testString === null) {
    return {
      success: false,
      error: "테스트할 문자열을 입력해주세요",
    } as ErrorResponse;
  }

  try {
    // 정규식 객체 생성
    const regex = new RegExp(pattern, flags);

    // 전역 플래그(g)가 있는 경우 matchAll 사용
    const matches: string[] = [];
    if (flags.includes("g")) {
      const matchIterator = testString.matchAll(regex);
      for (const match of matchIterator) {
        matches.push(match[0]);
      }
    } else {
      // 전역 플래그가 없으면 exec 사용
      const match = regex.exec(testString);
      if (match) {
        matches.push(match[0]);
      }
    }

    const isMatch = matches.length > 0;
    const matchCount = matches.length;

    return {
      success: true,
      data: {
        pattern,
        flags,
        testString,
        isMatch,
        matches,
        matchCount,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: "정규식 패턴이 유효하지 않습니다",
      details:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다",
    } as ErrorResponse;
  }
}

/**
 * 모든 카테고리 목록을 반환합니다.
 * @returns 고유한 카테고리 배열 (정렬됨)
 */
export function getAllCategories(): string[] {
  const patterns = loadRegexPatterns();
  const categories = new Set(patterns.map((p) => p.category));
  return Array.from(categories).sort();
}

/**
 * 모든 복잡도 레벨을 반환합니다.
 * @returns 복잡도 레벨 배열
 */
export function getComplexityLevels(): string[] {
  return ["basic", "intermediate", "advanced"];
}

/**
 * 카테고리별 색상 클래스를 반환합니다.
 * @param category - 카테고리
 * @returns Tailwind CSS 색상 클래스
 */
export function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    validation: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
    format: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    extraction: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
    code: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300",
  };

  return (
    colorMap[category] ||
    "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300"
  );
}

/**
 * 복잡도별 색상 클래스를 반환합니다.
 * @param complexity - 복잡도 레벨
 * @returns Tailwind CSS 색상 클래스
 */
export function getComplexityColor(complexity: string): string {
  const colorMap: Record<string, string> = {
    basic: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    intermediate: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
    advanced: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
  };

  return (
    colorMap[complexity] ||
    "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
  );
}

/**
 * 카테고리별 통계를 반환합니다.
 * @returns 카테고리별 패턴 개수
 */
export function getCategoryStats(): Record<string, number> {
  const patterns = loadRegexPatterns();
  const stats: Record<string, number> = {};

  patterns.forEach((pattern) => {
    stats[pattern.category] = (stats[pattern.category] || 0) + 1;
  });

  return stats;
}

/**
 * 복잡도별 통계를 반환합니다.
 * @returns 복잡도별 패턴 개수
 */
export function getComplexityStats(): Record<string, number> {
  const patterns = loadRegexPatterns();
  const stats: Record<string, number> = {};

  patterns.forEach((pattern) => {
    stats[pattern.complexity] = (stats[pattern.complexity] || 0) + 1;
  });

  return stats;
}

/**
 * 특정 카테고리의 패턴을 필터링합니다.
 * @param patterns - 패턴 배열
 * @param category - 카테고리 ("All"이면 전체 반환)
 * @returns 필터링된 패턴 배열
 */
export function filterByCategory(
  patterns: RegexPattern[],
  category: string
): RegexPattern[] {
  if (!category || category === "All" || category.trim() === "") {
    return patterns;
  }
  return patterns.filter((p) => p.category === category);
}

/**
 * 특정 복잡도의 패턴을 필터링합니다.
 * @param patterns - 패턴 배열
 * @param complexity - 복잡도 ("All"이면 전체 반환)
 * @returns 필터링된 패턴 배열
 */
export function filterByComplexity(
  patterns: RegexPattern[],
  complexity: string
): RegexPattern[] {
  if (!complexity || complexity === "All" || complexity.trim() === "") {
    return patterns;
  }
  return patterns.filter((p) => p.complexity === complexity);
}
