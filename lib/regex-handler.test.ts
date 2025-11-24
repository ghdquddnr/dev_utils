import {
  loadRegexPatterns,
  searchPatterns,
  getPatternById,
  testRegex,
  getAllCategories,
  getComplexityLevels,
  getCategoryColor,
  getComplexityColor,
  getCategoryStats,
  getComplexityStats,
  filterByCategory,
  filterByComplexity,
} from "./regex-handler";

describe("regex-handler", () => {
  describe("loadRegexPatterns", () => {
    test("패턴 목록을 로드해야 함", () => {
      const patterns = loadRegexPatterns();
      expect(patterns).toBeDefined();
      expect(Array.isArray(patterns)).toBe(true);
      expect(patterns.length).toBeGreaterThan(0);
    });

    test("각 패턴은 필수 필드를 가져야 함", () => {
      const patterns = loadRegexPatterns();
      patterns.forEach((pattern) => {
        expect(pattern.id).toBeDefined();
        expect(pattern.name).toBeDefined();
        expect(pattern.pattern).toBeDefined();
        expect(pattern.flags).toBeDefined();
        expect(pattern.description).toBeDefined();
        expect(pattern.category).toBeDefined();
        expect(pattern.complexity).toBeDefined();
        expect(pattern.examples).toBeDefined();
        expect(pattern.examples.valid).toBeDefined();
        expect(pattern.examples.invalid).toBeDefined();
        expect(pattern.usage).toBeDefined();
        expect(pattern.usage.javascript).toBeDefined();
      });
    });

    test("최소 20개 이상의 패턴이 있어야 함", () => {
      const patterns = loadRegexPatterns();
      expect(patterns.length).toBeGreaterThanOrEqual(20);
    });
  });

  describe("searchPatterns", () => {
    test("쿼리 없이 호출하면 모든 패턴을 반환해야 함", () => {
      const patterns = searchPatterns();
      expect(patterns.length).toBeGreaterThan(0);
    });

    test("빈 쿼리로 호출하면 모든 패턴을 반환해야 함", () => {
      const patterns = searchPatterns("");
      expect(patterns.length).toBeGreaterThan(0);
    });

    test("패턴 이름으로 검색할 수 있어야 함", () => {
      const patterns = searchPatterns("이메일");
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.some((p) => p.name.includes("이메일"))).toBe(true);
    });

    test("패턴 설명으로 검색할 수 있어야 함", () => {
      const patterns = searchPatterns("검증");
      expect(patterns.length).toBeGreaterThan(0);
    });

    test("대소문자 구분 없이 검색해야 함", () => {
      const patternsLower = searchPatterns("email");
      const patternsUpper = searchPatterns("EMAIL");
      expect(patternsLower.length).toBe(patternsUpper.length);
    });

    test("존재하지 않는 검색어는 빈 배열을 반환해야 함", () => {
      const patterns = searchPatterns("존재하지않는패턴xyz123");
      expect(patterns.length).toBe(0);
    });

    test("카테고리 필터를 적용할 수 있어야 함", () => {
      const patterns = searchPatterns(undefined, { category: "validation" });
      expect(patterns.length).toBeGreaterThan(0);
      patterns.forEach((pattern) => {
        expect(pattern.category).toBe("validation");
      });
    });

    test("복잡도 필터를 적용할 수 있어야 함", () => {
      const patterns = searchPatterns(undefined, { complexity: "basic" });
      expect(patterns.length).toBeGreaterThan(0);
      patterns.forEach((pattern) => {
        expect(pattern.complexity).toBe("basic");
      });
    });

    test("검색어와 필터를 함께 사용할 수 있어야 함", () => {
      const patterns = searchPatterns("이메일", { category: "validation" });
      patterns.forEach((pattern) => {
        expect(pattern.category).toBe("validation");
      });
    });

    test("여러 필터를 동시에 적용할 수 있어야 함", () => {
      const patterns = searchPatterns(undefined, {
        category: "validation",
        complexity: "basic",
      });
      patterns.forEach((pattern) => {
        expect(pattern.category).toBe("validation");
        expect(pattern.complexity).toBe("basic");
      });
    });
  });

  describe("getPatternById", () => {
    test("올바른 ID로 패턴을 조회해야 함", () => {
      const result = getPatternById("email-basic");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.pattern.id).toBe("email-basic");
        expect(result.data.pattern.name).toBeDefined();
      }
    });

    test("존재하지 않는 ID는 에러를 반환해야 함", () => {
      const result = getPatternById("non-existent-pattern");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("찾을 수 없습니다");
      }
    });

    test("빈 ID는 에러를 반환해야 함", () => {
      const result = getPatternById("");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("입력해주세요");
      }
    });

    test("공백만 있는 ID는 에러를 반환해야 함", () => {
      const result = getPatternById("   ");
      expect(result.success).toBe(false);
    });

    test("조회된 패턴은 모든 필수 정보를 포함해야 함", () => {
      const result = getPatternById("email-basic");
      expect(result.success).toBe(true);
      if (result.success) {
        const { pattern } = result.data;
        expect(pattern.id).toBe("email-basic");
        expect(pattern.name).toBeDefined();
        expect(pattern.pattern).toBeDefined();
        expect(pattern.description).toBeDefined();
        expect(pattern.examples.valid.length).toBeGreaterThan(0);
        expect(pattern.examples.invalid.length).toBeGreaterThan(0);
      }
    });
  });

  describe("testRegex", () => {
    test("이메일 패턴이 유효한 이메일을 매칭해야 함", () => {
      const result = testRegex(
        "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        "",
        "user@example.com"
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isMatch).toBe(true);
        expect(result.data.matches).toContain("user@example.com");
        expect(result.data.matchCount).toBe(1);
      }
    });

    test("이메일 패턴이 유효하지 않은 이메일을 거부해야 함", () => {
      const result = testRegex(
        "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        "",
        "invalid-email"
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isMatch).toBe(false);
        expect(result.data.matchCount).toBe(0);
      }
    });

    test("전역 플래그로 여러 매칭을 찾아야 함", () => {
      const result = testRegex("\\d+", "g", "abc 123 def 456 ghi 789");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isMatch).toBe(true);
        expect(result.data.matches).toEqual(["123", "456", "789"]);
        expect(result.data.matchCount).toBe(3);
      }
    });

    test("대소문자 구분 없이 매칭해야 함 (i 플래그)", () => {
      const result = testRegex("hello", "i", "HELLO World");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isMatch).toBe(true);
        expect(result.data.matches).toContain("HELLO");
      }
    });

    test("빈 패턴은 에러를 반환해야 함", () => {
      const result = testRegex("", "", "test");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("패턴을 입력해주세요");
      }
    });

    test("유효하지 않은 정규식은 에러를 반환해야 함", () => {
      const result = testRegex("[invalid(", "", "test");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("유효하지 않습니다");
      }
    });

    test("전화번호 패턴이 한국 휴대폰 번호를 매칭해야 함", () => {
      const result = testRegex(
        "^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$",
        "",
        "010-1234-5678"
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isMatch).toBe(true);
      }
    });

    test("URL 패턴이 HTTPS URL을 매칭해야 함", () => {
      const result = testRegex(
        "^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b",
        "",
        "https://www.example.com"
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isMatch).toBe(true);
      }
    });

    test("16진수 색상 코드를 매칭해야 함", () => {
      const result = testRegex("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", "", "#FFF");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isMatch).toBe(true);
      }
    });

    test("HTML 태그를 추출해야 함 (gi 플래그)", () => {
      const result = testRegex(
        "<\\/?[a-z][a-z0-9]*\\b[^>]*>",
        "gi",
        "<div class='test'>Hello</div>"
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isMatch).toBe(true);
        expect(result.data.matchCount).toBeGreaterThan(0);
      }
    });
  });

  describe("getAllCategories", () => {
    test("모든 카테고리 목록을 반환해야 함", () => {
      const categories = getAllCategories();
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    test("카테고리 목록에 중복이 없어야 함", () => {
      const categories = getAllCategories();
      const uniqueCategories = new Set(categories);
      expect(categories.length).toBe(uniqueCategories.size);
    });

    test("카테고리 목록이 정렬되어야 함", () => {
      const categories = getAllCategories();
      const sorted = [...categories].sort();
      expect(categories).toEqual(sorted);
    });

    test("주요 카테고리가 포함되어야 함", () => {
      const categories = getAllCategories();
      expect(categories).toContain("validation");
      expect(categories).toContain("format");
      expect(categories).toContain("extraction");
      expect(categories).toContain("code");
    });
  });

  describe("getComplexityLevels", () => {
    test("모든 복잡도 레벨을 반환해야 함", () => {
      const levels = getComplexityLevels();
      expect(levels).toBeDefined();
      expect(Array.isArray(levels)).toBe(true);
      expect(levels.length).toBe(3);
    });

    test("복잡도 레벨에 basic, intermediate, advanced가 포함되어야 함", () => {
      const levels = getComplexityLevels();
      expect(levels).toContain("basic");
      expect(levels).toContain("intermediate");
      expect(levels).toContain("advanced");
    });
  });

  describe("getCategoryColor", () => {
    test("validation 카테고리는 파란색을 반환해야 함", () => {
      const color = getCategoryColor("validation");
      expect(color).toContain("blue");
    });

    test("format 카테고리는 초록색을 반환해야 함", () => {
      const color = getCategoryColor("format");
      expect(color).toContain("green");
    });

    test("extraction 카테고리는 보라색을 반환해야 함", () => {
      const color = getCategoryColor("extraction");
      expect(color).toContain("purple");
    });

    test("code 카테고리는 주황색을 반환해야 함", () => {
      const color = getCategoryColor("code");
      expect(color).toContain("orange");
    });

    test("알 수 없는 카테고리는 slate 색을 반환해야 함", () => {
      const color = getCategoryColor("unknown");
      expect(color).toContain("slate");
    });
  });

  describe("getComplexityColor", () => {
    test("basic 복잡도는 초록색을 반환해야 함", () => {
      const color = getComplexityColor("basic");
      expect(color).toContain("green");
    });

    test("intermediate 복잡도는 노란색을 반환해야 함", () => {
      const color = getComplexityColor("intermediate");
      expect(color).toContain("yellow");
    });

    test("advanced 복잡도는 빨간색을 반환해야 함", () => {
      const color = getComplexityColor("advanced");
      expect(color).toContain("red");
    });

    test("알 수 없는 복잡도는 회색을 반환해야 함", () => {
      const color = getComplexityColor("unknown");
      expect(color).toContain("gray");
    });
  });

  describe("getCategoryStats", () => {
    test("카테고리별 통계를 반환해야 함", () => {
      const stats = getCategoryStats();
      expect(stats).toBeDefined();
      expect(typeof stats).toBe("object");
    });

    test("통계에 validation 카테고리가 포함되어야 함", () => {
      const stats = getCategoryStats();
      expect(stats["validation"]).toBeGreaterThan(0);
    });

    test("통계 값이 0보다 커야 함", () => {
      const stats = getCategoryStats();
      Object.values(stats).forEach((count) => {
        expect(count).toBeGreaterThan(0);
      });
    });
  });

  describe("getComplexityStats", () => {
    test("복잡도별 통계를 반환해야 함", () => {
      const stats = getComplexityStats();
      expect(stats).toBeDefined();
      expect(typeof stats).toBe("object");
    });

    test("통계에 basic 복잡도가 포함되어야 함", () => {
      const stats = getComplexityStats();
      expect(stats["basic"]).toBeGreaterThan(0);
    });

    test("통계 값이 0보다 커야 함", () => {
      const stats = getComplexityStats();
      Object.values(stats).forEach((count) => {
        expect(count).toBeGreaterThan(0);
      });
    });
  });

  describe("filterByCategory", () => {
    const allPatterns = loadRegexPatterns();

    test("카테고리로 필터링할 수 있어야 함", () => {
      const filtered = filterByCategory(allPatterns, "validation");
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach((pattern) => {
        expect(pattern.category).toBe("validation");
      });
    });

    test("'All' 카테고리는 모든 패턴을 반환해야 함", () => {
      const filtered = filterByCategory(allPatterns, "All");
      expect(filtered.length).toBe(allPatterns.length);
    });

    test("빈 카테고리는 모든 패턴을 반환해야 함", () => {
      const filtered = filterByCategory(allPatterns, "");
      expect(filtered.length).toBe(allPatterns.length);
    });

    test("존재하지 않는 카테고리는 빈 배열을 반환해야 함", () => {
      const filtered = filterByCategory(allPatterns, "NonExistentCategory");
      expect(filtered.length).toBe(0);
    });
  });

  describe("filterByComplexity", () => {
    const allPatterns = loadRegexPatterns();

    test("복잡도로 필터링할 수 있어야 함", () => {
      const filtered = filterByComplexity(allPatterns, "basic");
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach((pattern) => {
        expect(pattern.complexity).toBe("basic");
      });
    });

    test("'All' 복잡도는 모든 패턴을 반환해야 함", () => {
      const filtered = filterByComplexity(allPatterns, "All");
      expect(filtered.length).toBe(allPatterns.length);
    });

    test("빈 복잡도는 모든 패턴을 반환해야 함", () => {
      const filtered = filterByComplexity(allPatterns, "");
      expect(filtered.length).toBe(allPatterns.length);
    });

    test("intermediate 복잡도로 필터링할 수 있어야 함", () => {
      const filtered = filterByComplexity(allPatterns, "intermediate");
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach((pattern) => {
        expect(pattern.complexity).toBe("intermediate");
      });
    });

    test("advanced 복잡도로 필터링할 수 있어야 함", () => {
      const filtered = filterByComplexity(allPatterns, "advanced");
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach((pattern) => {
        expect(pattern.complexity).toBe("advanced");
      });
    });
  });
});
