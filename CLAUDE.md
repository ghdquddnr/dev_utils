# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소에서 작업할 때 참고할 가이드를 제공합니다.

---

## 프로젝트 개요

**Dev Utils**는 클라이언트 사이드에서 안전하게 동작하는 개발자 유틸리티 도구 모음입니다. 모든 데이터는 브라우저 내에서만 처리되며 서버로 전송되지 않습니다.

### 주요 기술 스택
- **Framework**: Next.js 16.0.3 (React 19.2.0)
- **스타일**: Tailwind CSS 4, Shadcn UI
- **테스트**: Jest 30.2.0, React Testing Library
- **언어**: TypeScript 5

---

## 핵심 아키텍처

### 도구 패턴 (Tool Pattern)

모든 도구는 일관된 3계층 패턴을 따릅니다:

#### 1. **Handler 계층** (`lib/*-handler.ts`)
- 비즈니스 로직 담당
- 입력 검증, 변환, 에러 처리
- `Result<T> = SuccessResponse<T> | ErrorResponse` 패턴 사용 (판별식 유니온)
- 모든 함수는 제너릭 `Result<T>` 타입 반환

**예시:**
```typescript
export function yamlToProperties(
  yaml: string,
  indentation: 2 | 4 = 2
): YamlPropertiesConversionResult {
  if (!yaml || yaml.trim() === "") {
    return {
      success: false,
      error: "YAML이 비어있습니다",
      details: "변환할 YAML을 입력해주세요",
    } as ErrorResponse
  }
  // ... 변환 로직
  return {
    success: true,
    data: {
      result: properties.trim(),
      type: "yaml-to-properties",
      original: yaml,
      indentation,
    },
  }
}
```

#### 2. **Component 계층** (`components/tools/*Converter.tsx`)
- React 상태 관리 (useState)
- 사용자 입력 수집 및 Handler 함수 호출
- 결과 표시 및 사용자 상호작용 (복사, 초기화 등)
- Shadcn UI 컴포넌트 사용 (Button, Textarea, Card, Alert)
- "use client" 디렉티브 포함

**패턴:**
```typescript
"use client"

export function YamlPropertiesConverter() {
  const [mode, setMode] = useState<"yaml-to-properties" | "properties-to-yaml">()
  const [input, setInput] = useState("")
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleConvert = () => {
    const res = yamlToProperties(input)
    if (res.success) {
      setResult(res.data.result)
      setError(null)
    } else {
      setError(res.error)
      setResult(null)
    }
  }
  // ... JSX
}
```

#### 3. **라우팅 계층** (`components/ToolsLayout.tsx`)
- 탭별 도구 렌더링
- 메뉴 네비게이션
- 모든 도구가 자동으로 통합됨

### 타입 시스템

모든 타입은 `lib/types.ts`에 중앙집중식으로 정의:

```typescript
// 공통 응답 패턴
export type Result<T> = SuccessResponse<T> | ErrorResponse

// 도구별 타입
export interface YamlPropertiesConversionData {
  result: string
  type: 'yaml-to-properties' | 'properties-to-yaml'
  original: string
  indentation?: 2 | 4
}

export type YamlPropertiesConversionResult = Result<YamlPropertiesConversionData>
```

---

## 개발 워크플로우

### 새 도구 추가 (스텝별)

#### 1. 타입 정의 (`lib/types.ts`)
```typescript
export interface NewToolData {
  result: string
  type: string
  original: string
}

export type NewToolResult = Result<NewToolData>
```

#### 2. Handler 구현 (`lib/new-tool-handler.ts`)
```typescript
import { NewToolData, NewToolResult, ErrorResponse } from "./types"

export function newToolFunction(input: string): NewToolResult {
  if (!input || input.trim() === "") {
    return { success: false, error: "입력이 필요합니다" } as ErrorResponse
  }
  try {
    const result = /* 변환 로직 */
    return { success: true, data: { result, type: "new-tool", original: input } }
  } catch (error) {
    return { success: false, error: "변환 중 오류" } as ErrorResponse
  }
}
```

#### 3. 단위 테스트 (`lib/new-tool-handler.test.ts`)
- Jest 사용
- describe/test 블록 구조
- 성공/실패 경우 모두 테스트
- 최소 30-40개 테스트 케이스 권장

#### 4. React 컴포넌트 (`components/tools/NewToolConverter.tsx`)
- "use client" 디렉티브
- useState로 input/result/error 상태 관리
- Textarea로 입력, Card로 출력 표시
- Button, Alert 사용
- 에러 메시지와 성공 표시

#### 5. 컴포넌트 테스트 (`components/tools/NewToolConverter.test.tsx`)
- React Testing Library 사용
- render, fireEvent, waitFor 활용
- 렌더링, 입력, 변환, 복사, 에러 표시 테스트

#### 6. 통합 (`components/ToolsLayout.tsx`)
```typescript
import { NewToolConverter } from "@/components/tools/NewToolConverter"

case "new-tool":
  return <NewToolConverter />
```

---

## 자주 사용하는 명령어

### 개발
```bash
npm run dev                           # 개발 서버 시작 (포트 3000)
npm run build                         # 프로덕션 빌드
npm start                             # 프로덕션 서버 시작
```

### 테스트
```bash
npm test                              # 모든 테스트 실행
npm run test:watch                    # 감시 모드로 테스트
npm test -- lib/yaml-properties-handler.test.ts  # 특정 파일 테스트
npm test -- --testNamePattern="배열"   # 이름으로 테스트 필터링
```

### 타입 검사
```bash
npx tsc --noEmit                      # TypeScript 타입 체크
npx tsc --noEmit --listFiles          # 파일 목록과 함께 체크
```

### 린트
```bash
npm run lint                          # ESLint 실행
npm run lint -- --fix                 # 자동 수정
```

---

## 파일 구조

```
dev_utils/
├── app/                      # Next.js 앱 라우터
│   ├── globals.css           # 전역 스타일
│   ├── layout.tsx            # 루트 레이아웃
│   └── page.tsx              # 메인 페이지
│
├── components/
│   ├── tools/                # 도구 컴포넌트 (Tool Pattern)
│   │   ├── JsonFormatter.tsx
│   │   ├── JwtDecoder.tsx
│   │   ├── SqlBinder.tsx
│   │   ├── JavaJsonConverter.tsx
│   │   ├── YamlPropertiesConverter.tsx
│   │   └── ...
│   │
│   ├── ui/                   # Shadcn UI 컴포넌트
│   │   ├── button.tsx
│   │   ├── textarea.tsx
│   │   ├── card.tsx
│   │   ├── alert.tsx
│   │   └── ...
│   │
│   ├── Sidebar.tsx           # 메뉴 네비게이션
│   ├── ToolsLayout.tsx       # 도구 라우팅 및 레이아웃
│   └── ToolPlaceholder.tsx   # 미구현 도구 플레이스홀더
│
├── lib/
│   ├── handlers/             # 비즈니스 로직 (Handler Pattern)
│   │   ├── *-handler.ts      # 각 도구의 변환 로직
│   │   └── *-handler.test.ts # 단위 테스트
│   │
│   ├── data/                 # 데이터 파일 (JSON)
│   │   ├── error-codes.json
│   │   ├── redis-patterns.json
│   │   └── regex-patterns.json
│   │
│   ├── types.ts              # 모든 타입 정의 (중앙집중식)
│   ├── utils.ts              # 유틸리티 함수
│   └── __mocks__/            # Jest Mock 파일
│
├── tasks/                    # 프로젝트 작업 문서
│   └── tasks-0002-0009-all-features.md
│
├── jest.config.js            # Jest 설정
├── jest.setup.js             # Jest 초기화
├── tsconfig.json             # TypeScript 설정
├── next.config.js            # Next.js 설정
├── tailwind.config.js        # Tailwind CSS 설정
└── package.json              # 프로젝트 의존성
```

---

## 핵심 패턴 및 관례

### 1. 에러 처리
모든 handler 함수는 `Result<T>` 반환:
- 성공: `{ success: true, data: {...} }`
- 실패: `{ success: false, error: "에러 메시지", details?: "상세정보" }`

컴포넌트에서는:
```typescript
const res = yamlToProperties(input)
if (res.success) {
  setResult(res.data.result)
  setError(null)
} else {
  setError(res.error)
  setResult(null)
}
```

### 2. 상태 관리
컴포넌트는 4가지 기본 상태 관리:
- `input`: 사용자 입력 텍스트
- `result`: 변환 결과 (성공 시)
- `error`: 에러 메시지 (실패 시)
- `mode`: 변환 모드 (양방향 도구의 경우)

### 3. UI 컴포넌트 레이아웃
표준 패턴:
1. 모드/옵션 선택 버튼
2. 옵션 패널
3. 입력 영역 (Textarea)
4. 에러 메시지 (Alert)
5. 결과 영역 (Card)
6. 액션 버튼 (변환, 복사, 초기화)
7. 팁 섹션

### 4. 테스트 구조
```typescript
describe("tool-handler", () => {
  describe("functionName", () => {
    test("기능 설명", () => {
      const result = functionName(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.result).toContain("expected")
      }
    })

    test("에러 케이스", () => {
      const result = functionName("")
      expect(result.success).toBe(false)
    })
  })
})
```

---

## 코딩 스타일 및 한글 주석

### 필수 사항
- **모든 주석은 한글로만 작성**
- **코드 함수명, 변수명은 영문** (단, 테스트 설명은 한글 가능)
- **JSDoc 주석은 한글로 작성**

### 예시
```typescript
/**
 * YAML 문자열을 Properties 형식으로 변환합니다.
 * @param yaml - 입력 YAML 문자열
 * @param indentation - 들여쓰기 칸수 (2 또는 4)
 * @returns 변환 결과 (성공 또는 에러)
 */
export function yamlToProperties(
  yaml: string,
  indentation: 2 | 4 = 2
): YamlPropertiesConversionResult {
  // YAML이 비어있는지 확인
  if (!yaml || yaml.trim() === "") {
    return {
      success: false,
      error: "YAML이 비어있습니다",
    } as ErrorResponse
  }
  // ... 로직
}
```

---

## 테스트 전략

### 단위 테스트 (Handler)
- **최소 테스트 케이스**: 30-40개
- **테스트 범위**:
  - ✅ 정상 입력 및 변환
  - ✅ 중첩 구조, 특수 문자, 유니코드
  - ✅ 빈 입력, 유효하지 않은 입력
  - ✅ 엣지 케이스 (매우 큰 입력, 특수 문자 조합)
  - ✅ 에러 메시지 표시

### 컴포넌트 테스트
- **테스트 범위**:
  - ✅ 컴포넌트 렌더링
  - ✅ 모드 전환
  - ✅ 입력 → 변환 → 결과 표시 흐름
  - ✅ 복사, 초기화, 예제 로드 버튼
  - ✅ 에러 메시지 표시

### 테스트 실행
```bash
# 전체 테스트
npm test

# 특정 도구 테스트
npm test -- lib/yaml-properties-handler.test.ts

# 감시 모드 (파일 변경 시 자동 실행)
npm run test:watch

# 테스트 및 커버리지 확인
npm test -- --coverage
```

---

## 빌드 및 배포

### 개발 빌드
```bash
npm run dev
# http://localhost:3000에서 접속
```

### 프로덕션 빌드
```bash
npm run build       # .next 디렉토리 생성
npm start          # 프로덕션 서버 시작 (포트 3000)
```

### 사전 체크
배포 전에 반드시 확인:
```bash
npm run build           # 빌드 성공 확인
npx tsc --noEmit      # 타입 에러 확인
npm test              # 모든 테스트 통과 확인
npm run lint          # ESLint 검사
```

---

## 현재 진행 상황 (Task 2.0 완료)

### ✅ 완료된 기능
- **1.0 기초 구조**: 타입, 레이아웃, 메뉴 확장 완료
- **2.1 Java ↔ JSON 변환기**: 35개 테스트 통과, UI 완성
- **2.2 YAML ↔ Properties 변환기**: 32개 테스트 통과, UI 완성, 브라우저 테스트 완료

### 📋 다음 작업
- **3.0 시간 & 데이터 처리**: Timestamp, Cron
- **4.0 보안 & 유틸리티**: URL Encoder, Redis Scanner
- **5.0 사내 특화**: 에러 코드 조회기, RegEx 테스터

---

## 주요 팁

### 1. 포트 충돌 해결
포트 3000이 이미 사용 중인 경우:
```bash
# Windows PowerShell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess |
  ForEach-Object { Stop-Process -Id $_ -Force }

# Linux/Mac
lsof -i :3000 | tail -1 | awk '{print $2}' | xargs kill -9
```

### 2. TypeScript 타입 에러
```bash
# 이 명령어로 정확한 에러 위치 확인
npx tsc --noEmit --listFiles
```

### 3. Jest Mock 설정
`jest.config.js`의 `moduleNameMapper`로 경로 별칭 처리:
```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
}
```

### 4. 테스트 감시 모드
파일 변경 시 자동으로 테스트 실행:
```bash
npm run test:watch
```

---

## 참고 사항

- 모든 개발은 **한국어 주석**으로 진행
- 코드 변수/함수명은 **영문**만 사용
- 테스트 완료 후 **체크표시 반드시 기록**
- **작업 문서**: `tasks/tasks-0002-0009-all-features.md` 참고
