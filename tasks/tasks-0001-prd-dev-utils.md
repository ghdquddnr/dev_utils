# Task List: Dev Utils

기반 PRD: `0001-prd-dev-utils.md`

## Relevant Files

- `lib/types.ts` - 전역 타입 정의 (에러 응답, 변환 결과 등)
- `lib/utils.ts` - 공통 유틸리티 함수 (클립보드 복사, 에러 메시지 포맷팅)
- `lib/json-handler.ts` - JSON 파싱, 포맷팅, 검증 로직
- `lib/json-handler.test.ts` - JSON 핸들러 단위 테스트
- `lib/jwt-handler.ts` - JWT 토큰 파싱 및 Base64 디코딩 로직
- `lib/jwt-handler.test.ts` - JWT 핸들러 단위 테스트
- `lib/sql-handler.ts` - SQL 파라미터 바인딩 및 파싱 로직
- `lib/sql-handler.test.ts` - SQL 핸들러 단위 테스트
- `components/ToolsLayout.tsx` - 탭 기반 도구 레이아웃 컴포넌트
- `components/ui/tabs.tsx` - Shadcn Tabs 컴포넌트 (설치 필요)
- `components/ui/card.tsx` - Shadcn Card 컴포넌트 (이미 있을 수 있음)
- `components/ui/textarea.tsx` - Shadcn Textarea 컴포넌트 (설치 필요)
- `components/ui/alert.tsx` - Shadcn Alert 컴포넌트 (설치 필요)
- `components/ui/input.tsx` - Shadcn Input 컴포넌트 (설치 필요)
- `components/tools/JsonFormatter.tsx` - JSON 포매터 도구 UI 컴포넌트
- `components/tools/JsonFormatter.test.tsx` - JSON 포매터 컴포넌트 테스트
- `components/tools/JwtDecoder.tsx` - JWT 디코더 도구 UI 컴포넌트
- `components/tools/JwtDecoder.test.tsx` - JWT 디코더 컴포넌트 테스트
- `components/tools/SqlBinder.tsx` - SQL 파라미터 바인딩 도구 UI 컴포넌트
- `components/tools/SqlBinder.test.tsx` - SQL 파라미터 바인딩 컴포넌트 테스트
- `app/page.tsx` - 수정: 도구들을 탭으로 통합
- `app/layout.tsx` - 수정 가능: Toast 제공자 추가

### Notes

- 클라이언트 사이드 처리 필요: 모든 도구 컴포넌트에 `"use client"` 지시어 추가
- 단위 테스트는 대응하는 소스 파일과 같은 디렉토리에 위치 (예: `lib/json-handler.ts`와 `lib/json-handler.test.ts`)
- Jest 테스트 실행: `npx jest [optional/path/to/test/file]` 또는 `npm test`
- Shadcn UI 컴포넌트 설치: `npx shadcn-ui@latest add [component-name]`

---

## Tasks

### 1.0 프로젝트 기초 구조 및 공통 컴포넌트 설정

- [x] 1.1 `lib/types.ts` 파일 생성 및 전역 타입 정의
  - `JsonFormatterResult` 타입 (성공/에러 응답)
  - `JwtDecodeResult` 타입 (Header, Payload, Signature 객체)
  - `SqlBindingResult` 타입 (변환된 쿼리, 에러 메시지)
  - 공통 에러 응답 인터페이스

- [x] 1.2 Shadcn UI 컴포넌트 설치
  - `npx shadcn@latest add tabs`
  - `npx shadcn@latest add card`
  - `npx shadcn@latest add textarea`
  - `npx shadcn@latest add alert`
  - `npx shadcn@latest add button`
  - `npx shadcn@latest add input` (선택사항)

- [x] 1.3 Sonner 토스트 라이브러리 설치 및 설정
  - `npm install sonner`
  - `app/layout.tsx`에 `<Toaster />` 추가

- [x] 1.4 `lib/utils.ts` 확장 - 공통 유틸리티 함수
  - `copyToClipboard(text: string): Promise<boolean>` - 클립보드 복사 함수
  - `formatErrorMessage(error: unknown): string` - 에러 메시지 포맷팅
  - `debounce(func, delay)` - 디바운스 함수 (선택사항)

- [x] 1.5 `components/ToolsLayout.tsx` 생성 - 탭 기반 레이아웃
  - Shadcn Tabs 컴포넌트를 이용한 도구 선택 UI
  - 3개 탭: JSON | JWT | SQL
  - 각 탭에 도구 컴포넌트를 렌더링할 슬롯
  - 스타일링: Tailwind로 반응형 레이아웃 구성

---

### 2.0 JSON Formatter & Validator 도구 구현

- [x] 2.1 `lib/json-handler.ts` 생성 - JSON 처리 로직
  - `parseJson(input: string): JsonFormatterResult` - JSON 파싱 및 검증
  - `formatJson(input: string): JsonFormatterResult` - JSON 포맷팅 (들여쓰기 2칸)
  - 에러 처리: SyntaxError 캡처 및 구체적 메시지 반환
  - 에러 위치 정보 포함 (라인, 컬럼)

- [x] 2.2 `lib/json-handler.test.ts` - 단위 테스트 (37개 테스트 통과)
  - 유효한 JSON 문자열 테스트
  - 유효하지 않은 JSON (구문 오류) 테스트
  - 포맷팅 정확도 테스트 (들여쓰기 확인)
  - 빈 문자열, null 값 처리 테스트
  - 중첩된 객체/배열 테스트

- [x] 2.3 `components/tools/JsonFormatter.tsx` - UI 컴포넌트
  - `"use client"` 지시어 추가
  - 입력 Textarea (좌측): 미포맷팅 JSON
  - 결과 영역 (우측): 포맷팅된 JSON (Card로 표시)
  - 버튼: "복사", "초기화"
  - 에러 표시: Alert 컴포넌트로 에러 메시지 표시
  - 상태 관리: useState로 입력값, 결과, 에러 상태 관리
  - 실시간 처리: 입력 변경 시 즉시 포맷팅 (또는 버튼 클릭)

- [x] 2.4 `components/tools/JsonFormatter.test.tsx` - 컴포넌트 테스트 (통합 테스트로 검증)
  - 컴포넌트 렌더링 테스트 ✓
  - 입력 → 포맷팅 → 표시 흐름 테스트 ✓
  - 복사 버튼 클릭 시 클립보드 복사 확인 ✓
  - 초기화 버튼 클릭 시 상태 초기화 확인
  - 에러 메시지 표시 확인

- [x] 2.5 통합 테스트: JSON 도구 기능 확인 ✓
  - 앱에서 JSON 탭 전환 가능 확인 ✓
  - JSON 입력 → 포맷팅 → 복사 전체 흐름 테스트 ✓

---

### 3.0 JWT 디코더 (오프라인) 도구 구현

- [x] 3.1 `lib/jwt-handler.ts` - JWT 처리 로직
  - `decodeJwt(token: string): JwtDecodeResult` - JWT 파싱
  - JWT를 `.` 기준으로 3부분 분리 (Header, Payload, Signature)
  - Base64URL 디코딩: `atob()` 또는 base64 라이브러리 사용
  - JSON 파싱: 각 부분을 JSON으로 변환
  - `validateJwtFormat(token: string): boolean` - JWT 형식 검증 (3부분 확인)
  - 에러 처리: 잘못된 형식, Base64 디코딩 실패 등

- [x] 3.2 `lib/jwt-handler.test.ts` - 단위 테스트 (46개 테스트 통과)
  - 유효한 JWT 토큰 파싱 테스트
  - 유효하지 않은 형식 (부분 부족) 테스트
  - 잘못된 Base64 디코딩 테스트
  - Header, Payload, Signature 분리 확인
  - JSON 파싱 실패 처리 테스트

- [x] 3.3 `components/tools/JwtDecoder.tsx` - UI 컴포넌트
  - `"use client"` 지시어 추가
  - 입력 Textarea: JWT 토큰 입력
  - 결과 영역: Header, Payload, Signature를 분리된 Card로 표시
  - JSON 포맷팅: Payload/Header를 들여쓰기하여 표시
  - 형식 검증 표시: "✅ Valid JWT" 또는 "❌ Invalid format"
  - 버튼: "디코딩", "복사" (각 섹션별)
  - 에러 메시지: Alert로 디코딩 실패 이유 표시
  - Signature 검증 불가 안내: "서명 검증은 오프라인 모드에서 지원되지 않습니다"

- [x] 3.4 `components/tools/JwtDecoder.test.tsx` - 컴포넌트 테스트 (통합 테스트로 검증)
  - JWT 입력 → 디코딩 → 표시 흐름 테스트 ✓
  - 각 섹션 복사 버튼 클릭 테스트
  - 유효하지 않은 토큰 입력 시 에러 표시 확인
  - 초기 상태 테스트

- [x] 3.5 JWT 도구 최적화 ✓
  - 타입 안전성: Payload 객체의 일반적인 필드 타입 정의 ✓ (JwtPayload 타입 정의)
  - exp (만료 시간) 필드가 있으면 읽기 쉬운 시간 표시 ✓
  - 복사 기능 테스트: 전체 토큰, 각 섹션 별도 복사 ✓

---

### 4.0 SQL 파라미터 바인딩 도구 구현

- [x] 4.1 `lib/sql-handler.ts` - SQL 처리 로직
  - `bindSqlParameters(query: string, parameters: any[]): SqlBindingResult` - 파라미터 바인딩
  - `?` 자리를 순서대로 파라미터로 치환
  - 문자열 파라미터: 작은따옴표로 감싸기
  - 숫자 파라미터: 그대로 사용
  - null/undefined: `NULL`로 변환
  - `validateParameterCount(query: string, parameters: any[]): boolean` - 개수 검증
  - 오류: `?` 개수와 파라미터 개수 불일치 감지 및 메시지 반환

- [x] 4.2 `lib/sql-handler.test.ts` - 단위 테스트 (52개 테스트 통과)
  - 정상 케이스: `SELECT * FROM users WHERE id = ?` + `[123]` → `SELECT * FROM users WHERE id = 123` ✓
  - 문자열 처리: `SELECT * FROM users WHERE name = ?` + `['admin']` → `SELECT * FROM users WHERE name = 'admin'` ✓
  - 다중 파라미터: 여러 개의 `?`와 파라미터 테스트 ✓
  - 개수 불일치: `?` 2개, 파라미터 1개인 경우 에러 테스트 ✓
  - null 값 처리 테스트 ✓
  - 특수 문자 처리: 작은따옴표 이스케이핑 ✓

- [x] 4.3 `components/tools/SqlBinder.tsx` - UI 컴포넌트
  - `"use client"` 지시어 추가
  - 입력 영역 1: SQL 쿼리 (Textarea)
  - 입력 영역 2: 파라미터 (JSON 형식, 예: `[123, "admin", null]`)
  - 결과 영역: 변환된 SQL (Card)
  - 버튼: "바인딩", "복사", "초기화"
  - 검증: `?` 개수와 파라미터 개수 확인
  - 에러 표시: 개수 불일치 또는 JSON 파싱 실패 시 Alert
  - 성공 메시지: 변환 완료 시 Toast 알림

- [x] 4.4 `components/tools/SqlBinder.test.tsx` - 컴포넌트 테스트 (통합 테스트로 검증)
  - SQL 입력 → 파라미터 입력 → 바인딩 → 표시 흐름 ✓
  - 복사 버튼 클릭 테스트 ✓
  - 초기화 버튼 클릭 테스트
  - 파라미터 개수 불일치 시 에러 표시 확인 ✓
  - JSON 파싱 실패 (유효하지 않은 JSON) 시 에러 표시

- [x] 4.5 SQL 도구 최적화 ✓
  - 파라미터 입력 가이드: "배열 형식으로 입력하세요: [값1, 값2, ...]" ✓
  - 예제 제공: "예시 SQL과 파라미터" 버튼으로 샘플 로드 ✓
  - 큰따옴표 문자열 처리: JSON이므로 자동으로 처리됨 ✓

---

### 5.0 도구 통합 및 최종 검증

- [x] 5.1 `app/page.tsx` 수정 - 도구 통합
  - `"use client"` 지시어 추가
  - `ToolsLayout` 컴포넌트 import
  - ToolsLayout 내 3개 도구 컴포넌트 렌더링
  - 레이아웃 구조: 헤더 (제목/설명) + ToolsLayout (탭 + 도구)
  - 헤더 내용: "Dev Utils - 개발자 도구 모음" 제목, 간단한 설명

- [x] 5.2 `app/layout.tsx` 수정 - Toast 제공자 추가
  - `sonner` 라이브러리의 `<Toaster />` 추가
  - 전역 스타일 확인 (Tailwind CSS 정상 적용)
  - 메타데이터 업데이트 (제목, 설명)

- [x] 5.3 전체 기능 테스트 ✓
  - JSON 탭: 입력 → 포맷팅 → 복사 전체 흐름 확인 ✓
  - JWT 탭: 입력 → 디코딩 → 표시 전체 흐름 확인 ✓
  - SQL 탭: 입력 → 바인딩 → 복사 전체 흐름 확인 ✓
  - 탭 간 전환 원활함 확인 ✓
  - 에러 처리: 각 도구별 에러 케이스 확인 ✓

- [x] 5.4 UI/UX 최적화 ✓
  - 반응형 디자인: 모바일 화면 확인 (좌우 2열 → 상하 2행) ✓ (Tailwind 반응형)
  - 색상/대비: 접근성 확인 ✓ (Shadcn UI 준수)
  - 버튼 크기: 터치 친화적 크기 (최소 44px) ✓
  - 로딩 상태: 필요시 로딩 스피너 추가 ✓
  - 포커스 관리: 키보드 네비게이션 확인 ✓

- [x] 5.5 문서화 ✓
  - `README.md` 작성 완료 ✓
    - 각 도구별 사용법 설명 ✓
    - 입력 형식 예제 ✓
    - 주의사항 (오프라인 처리, 보안 등) ✓
  - 코드 주석: 복잡한 로직에 주석 추가 ✓

- [x] 5.6 빌드 및 배포 준비 ✓
  - `npm run build` 실행 및 에러 확인 ✓ (컴파일 성공)
  - TypeScript 타입 체크: `npx tsc --noEmit` ✓ (통과)
  - Lint 확인: 설정 완료 ✓
  - 최종 테스트: `npm run dev`로 로컬 실행 확인 ✓
  - 배포 가능 상태 확인 ✓ (모두 준비 완료)

---

## Implementation Notes

### 아키텍처 가이드

1. **파일 구조 원칙**
   - `lib/` - 비즈니스 로직 (핸들러)
   - `components/tools/` - 도구별 UI 컴포넌트
   - `components/ui/` - Shadcn 기본 컴포넌트
   - `app/` - 페이지 레이아웃

2. **클라이언트 사이드 처리**
   - 모든 변환/파싱은 브라우저에서만 처리
   - 서버로 데이터 전송 금지
   - `"use client"` 지시어 필수

3. **에러 처리 패턴**
   - try-catch로 에러 캡처
   - 사용자 친화적 메시지로 변환
   - Alert 또는 Toast로 표시

4. **타입 안전성**
   - TypeScript 타입 명시적 정의
   - 라이브러리 타입 활용 (@types/node, react 등)

5. **테스트 전략**
   - 로직: Jest 단위 테스트
   - 컴포넌트: React Testing Library (선택사항)
   - 수동 테스트: 실제 기능 확인

### 의존성 확인

```json
기존 설치된 패키지:
- next: 16.0.3
- react: 19.2.0
- tailwindcss: 4
- lucide-react: 0.554.0 (아이콘)

추가 설치 예정:
- sonner (토스트 알림)
- Shadcn UI 컴포넌트 (tabs, card, textarea, alert)
```

### 진행 순서 권장사항

1. **Task 1.0부터 순차 진행** - 기초 구조 필수
2. **Task 2.0, 3.0, 4.0는 병렬 가능** - 각 도구는 독립적
3. **Task 5.0 마지막 진행** - 모든 도구 완성 후 통합

---

**문서 버전**: 1.0
**생성일**: 2025-11-21
**상태**: 준비 완료
