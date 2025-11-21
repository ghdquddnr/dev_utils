# PRD: URL Encode/Decode 도구

**작성일**: 2025-11-21
**상태**: 준비 완료

---

## 📋 개요

URL에 포함된 특수 문자, 한글, 이모지 등을 인코딩/디코딩하는 도구입니다. 쿼리 파라미터가 깨지거나 로그에서 인코딩된 URL을 확인할 때 유용합니다.

---

## 🎯 목표

1. 텍스트 → URL Encode 변환
2. URL Encode → 텍스트 디코딩
3. 다양한 인코딩 방식 지원 (UTF-8, euc-kr 등)
4. 쿼리 파라미터별 개별 인코딩/디코딩
5. 전체 URL 검증 및 분석

---

## 👥 사용자 스토리

**AS A** 웹 개발자
**I WANT TO** URL 쿼리 파라미터가 깨졌을 때 원본 텍스트 확인
**SO THAT** 사용자 입력 데이터를 정확하게 파악할 수 있습니다.

**AS A** 로그 분석 엔지니어
**I WANT TO** 로그에 기록된 인코딩된 URL을 읽을 수 있는 형태로 변환
**SO THAT** 문제 분석이 더 빨라집니다.

**AS A** API 개발자
**I WANT TO** 한글이나 특수문자가 포함된 쿼리 파라미터를 올바르게 인코딩
**SO THAT** API 클라이언트들이 올바르게 사용할 수 있습니다.

---

## ✅ 기능 요구사항

### 6.1 텍스트 → URL Encode

1. **입력**: 텍스트 문자열
   - 예: `Hello World! 안녕하세요 😊`
   - 예: `name=John Doe&age=30`

2. **기능**:
   - 공백 → `%20` 또는 `+`
   - 한글 → UTF-8 인코딩 후 `%XX%XX` 형태
   - 특수문자 인코딩
   - 이모지 인코딩

3. **옵션**:
   - 인코딩 방식: `%20` vs `+` (공백 처리)
   - 문자 집합: UTF-8 (기본) vs euc-kr (선택)
   - 예약 문자 처리: `=`, `&`, `?` 등

4. **출력**:
   ```
   입력: Hello World! 안녕하세요
   출력: Hello%20World%21%20%EC%95%88%EB%85%95%ED%95%98%EC%84%B8%EC%9A%94
   ```

### 6.2 URL Encode → 텍스트 Decode

1. **입력**: 인코딩된 URL 또는 쿼리 파라미터
   - 예: `Hello%20World%21`
   - 예: `%EC%95%88%EB%85%95%ED%95%98%EC%84%B8%EC%9A%94`

2. **기능**:
   - `%XX` 형태 디코딩
   - `+` 공백 처리
   - 잘못된 인코딩 에러 표시
   - 자동 문자 집합 감지

3. **출력**:
   ```
   입력: Hello%20World%21%20%EC%95%88%EB%85%95%ED%95%98%EC%84%B8%EC%9A%94
   출력: Hello World! 안녕하세요
   ```

### 6.3 쿼리 파라미터 분석

1. **입력**: 전체 URL 또는 쿼리 스트링
   - 예: `https://example.com?name=John%20Doe&age=30&tag=%EC%A0%88%EC%A0%88%ED%95%9C`
   - 예: `name=John%20Doe&age=30`

2. **기능**:
   - URL 파싱
   - 쿼리 파라미터 추출
   - 각 파라미터별 디코딩

3. **출력**: 테이블 형식
   ```
   Key              | Encoded Value              | Decoded Value
   ─────────────────┼────────────────────────────┼──────────────
   name             | John%20Doe                 | John Doe
   age              | 30                         | 30
   tag              | %EC%A0%88%EC%A0%88%ED%95%9C | 절절한
   ```

### 6.4 옵션

- **인코딩 방식**:
  - `%20` (표준)
  - `+` (폼 데이터)

- **문자 집합**:
  - UTF-8 (기본)
  - euc-kr (한글)
  - ISO-8859-1 (라틴)

- **예약 문자**:
  - URL 예약 문자(`=`, `&`, `?`, `#` 등) 인코딩 여부

### 6.5 UI/UX

- **탭**:
  - Encode (텍스트 → URL)
  - Decode (URL → 텍스트)
  - Query Parser (쿼리 파라미터 분석)

- **Encode 탭**:
  - 입력: 텍스트 (Textarea)
  - 출력: 인코딩된 URL (Card, 복사 버튼)
  - 옵션: 공백 처리 방식 선택

- **Decode 탭**:
  - 입력: 인코딩된 URL (Textarea)
  - 출력: 디코딩된 텍스트 (Card, 복사 버튼)

- **Query Parser 탭**:
  - 입력: 전체 URL 또는 쿼리 스트링
  - 출력: 파라미터 테이블
  - 버튼: 개별 파라미터 복사, 전체 선택

- **공통 버튼**:
  - "변환" (자동 또는 클릭)
  - "복사"
  - "초기화"

### 6.6 에러 처리

- 잘못된 인코딩 시 경고
- 문자 집합 불일치 시 안내
- 유효하지 않은 URL 형식 안내

---

## 📌 비포함 항목 (Out of Scope)

- Base64 인코딩 (별도 도구)
- HTML Entity 인코딩 (별도 도구)
- 실제 URL 검증 (구조 확인만)
- DNS 조회 또는 네트워크 테스트

---

## 🎨 디자인 고려사항

- Shadcn Tabs로 3가지 기능 구분
- 실시간 변환 (입력하면 자동 변환)
- 복사 버튼으로 빠른 복사
- Query Parser는 테이블로 명확하게 표시
- 반응형 레이아웃

---

## 🔧 기술 고려사항

### JavaScript 내장 함수

```js
// URL Encode
encodeURIComponent('Hello World!') // "Hello%20World%21"
encodeURI('https://example.com?name=John Doe') // URL 전체 인코딩

// URL Decode
decodeURIComponent('Hello%20World%21') // "Hello World!"
decodeURI('...')
```

### 커스텀 함수 필요

```typescript
// 공백을 + 로 인코딩
function encodeFormData(str: string): string {
  return encodeURIComponent(str).replace(/%20/g, '+');
}

// 쿼리 파라미터 파싱
function parseQueryString(qs: string): Record<string, string> {
  const params = new URLSearchParams(qs);
  const result: Record<string, string> = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}

// 다양한 문자 집합 처리
function decodeWithCharset(encoded: string, charset: string): string {
  if (charset === 'utf-8') {
    return decodeURIComponent(encoded);
  }
  // 다른 문자 집합은 복잡한 변환 필요
}
```

### 클라이언트 사이드 처리

- 모든 변환은 브라우저에서만 실행

---

## 📊 성공 메트릭

1. **변환 정확도**: 100% 정확한 인코딩/디코딩
2. **한글 처리**: 한글, 이모지 완벽 지원
3. **에러 메시지**: 잘못된 입력에 대한 명확한 안내
4. **성능**: 1초 이내 변환
5. **사용성**: 1분 내에 필요한 변환 완료

---

## 🤔 미해결 질문

1. euc-kr 같은 다른 문자 집합 지원할까?
2. Base64, HTML Entity 등 다른 인코딩도 함께 제공할까?
3. URL 전체 유효성 검증이 필요할까?
4. 배치 처리 (여러 URL 한번에) 필요할까?

---

**문서 버전**: 1.0
**마지막 수정**: 2025-11-21
