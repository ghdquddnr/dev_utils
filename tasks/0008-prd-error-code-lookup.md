# PRD: 에러 코드 조회기

**작성일**: 2025-11-21
**상태**: 준비 완료

---

## 📋 개요

프로젝트 내에서 정의한 커스텀 에러 코드(예: `ERR_User_001`, `ERR_Auth_002`)와 그 의미, 해결 방법을 빠르게 검색하고 확인하는 도구입니다. 에러 로그에서 코드를 보고 몇 초 만에 의미와 해결책을 파악할 수 있어, 디버깅과 고객 지원이 훨씬 빨라집니다.

---

## 🎯 목표

1. 에러 코드 관리 (정의, 설명, 해결책)
2. 빠른 검색 (코드, 키워드, 카테고리)
3. 상세 정보 표시 (의미, 원인, 해결 방법, 예제)
4. 팀 전체가 일관된 에러 정보 사용
5. 에러 코드 버전 관리 (선택사항)

---

## 👥 사용자 스토리

**AS A** 개발자
**I WANT TO** 로그에서 본 에러 코드의 의미를 빠르게 조회
**SO THAT** 문제 분석과 해결이 더 빨라집니다.

**AS A** QA 테스터
**I WANT TO** 모든 에러 코드와 해결책을 한 곳에서 확인
**SO THAT** 테스트 케이스를 더 효율적으로 작성할 수 있습니다.

**AS A** 고객 지원팀
**I WANT TO** 고객 로그의 에러 코드 의미 빠르게 확인
**SO THAT** 고객에게 더 정확한 지원을 제공할 수 있습니다.

**AS A** 팀 리더
**I WANT TO** 프로젝트의 모든 에러 코드를 중앙에서 관리
**SO THAT** 팀원들이 일관된 에러 처리를 하고, 중복 코드 생성을 막을 수 있습니다.

---

## ✅ 기능 요구사항

### 8.1 에러 코드 정의

1. **에러 코드 구조**:
   - **카테고리**: `ERR_User_`, `ERR_Auth_`, `ERR_Payment_` 등
   - **번호**: `001`, `002`, `003` 등
   - **전체 코드**: `ERR_User_001`

2. **에러 코드 정보**:
   ```
   코드: ERR_User_001
   카테고리: User
   심각도: ERROR
   HTTP 상태: 400 Bad Request
   메시지: 사용자를 찾을 수 없습니다.
   원인: 입력한 사용자 ID가 존재하지 않습니다.
   해결책:
     1. 사용자 ID를 올바르게 입력했는지 확인하세요.
     2. 사용자가 이미 탈퇴했을 수 있습니다.
   예제:
     - 입력: GET /api/users/99999
     - 응답: { "code": "ERR_User_001", "message": "..." }
   관련 코드: src/services/userService.ts:45
   ```

3. **메타데이터**:
   - 카테고리 (User, Auth, Payment, Order, System 등)
   - 심각도 (INFO, WARNING, ERROR, CRITICAL)
   - HTTP 상태 코드
   - 클라이언트 액션 (재시도, 입력 수정, 지원 문의 등)

### 8.2 검색 기능

1. **검색 방식**:
   - **코드로 검색**: `ERR_User_001` 입력하면 정보 표시
   - **키워드 검색**: "사용자를 찾을 수 없습니다" 검색
   - **카테고리 필터**: "User" 카테고리만 보기
   - **심각도 필터**: "ERROR" 등급만 보기

2. **검색 결과**:
   - 매칭되는 에러 코드 리스트 표시
   - 클릭하면 상세 정보 표시

### 8.3 상세 정보 표시

1. **구성 요소**:
   - **코드**: `ERR_User_001`
   - **카테고리**: User
   - **심각도**: ERROR (색상으로 표시)
   - **HTTP 상태**: 400
   - **메시지**: "사용자를 찾을 수 없습니다"

   - **상세 설명**:
     - 원인: 사용자 ID가 존재하지 않음
     - 해결책: 3-5개 단계별 해결책
     - 예제: cURL, JavaScript, Java 등 코드 예제

   - **추가 정보**:
     - 관련 에러 코드
     - 소스 코드 위치 (링크 가능)
     - 마지막 수정일

2. **복사 기능**:
   - 코드 복사
   - 메시지 복사
   - 전체 상세 정보 복사 (마크다운)

### 8.4 데이터 구조

```typescript
interface ErrorCode {
  id: string;              // "ERR_User_001"
  category: string;        // "User"
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  httpStatus?: number;     // 400, 404, 500 등
  message: string;         // 사용자 메시지
  description: string;     // 상세 설명
  causes: string[];        // 원인 목록
  solutions: string[];     // 해결책 목록
  examples: {
    language: string;      // "curl", "js", "java"
    code: string;
  }[];
  relatedCodes?: string[]; // 관련 에러 코드
  sourceFile?: string;     // src/services/userService.ts:45
  createdAt: Date;
  updatedAt: Date;
}
```

### 8.5 UI/UX

#### 검색 영역 (상단)
- **검색 입력**: 코드, 메시지, 키워드
- **필터 버튼**:
  - 카테고리 (User, Auth, Payment 등)
  - 심각도 (INFO, WARNING, ERROR, CRITICAL)
  - HTTP 상태 코드
- **정렬**: 최신순, 카테고리순, 심각도순

#### 검색 결과 (좌측 또는 위)
- 에러 코드 리스트
- 각 항목:
  - 코드 (`ERR_User_001`)
  - 메시지 ("사용자를 찾을 수 없습니다")
  - 카테고리 배지
  - 심각도 배지 (색상)
  - 클릭 시 상세 정보 로드

#### 상세 정보 (우측 또는 아래)
- 코드 정보
- 메시지, 원인, 해결책
- 코드 예제 (탭으로 언어 전환)
- 복사 버튼

#### 버튼
- "복사" (코드)
- "복사" (메시지)
- "복사" (전체 정보)
- "즐겨찾기"
- "소스 코드 보기" (링크)

### 8.6 고급 기능 (선택사항)

1. **즐겨찾기**: 자주 보는 에러 코드 저장
2. **최근 본 항목**: 최근 검색한 에러 코드 빠른 접근
3. **에러 통계**: 가장 자주 본 에러 코드
4. **내보내기**: CSV, JSON, PDF 형식 내보내기
5. **버전 관리**: 에러 코드 변경 이력 추적

---

## 📌 비포함 항목 (Out of Scope)

- 실시간 에러 로그 수집
- 에러 모니터링 대시보드
- 에러 발생 빈도 분석
- 에러 코드 자동 생성
- 다중 프로젝트 지원 (단일 프로젝트만)

---

## 🎨 디자인 고려사항

- 2열 레이아웃: 검색/결과 | 상세 정보
- 심각도별 색상 구분 (INFO: 파랑, WARNING: 노랑, ERROR: 빨강, CRITICAL: 검정)
- 카테고리별 배지
- 복사 버튼으로 빠른 복사
- 코드 예제는 구문 강조로 표시
- 반응형 (모바일에서는 1열)

---

## 🔧 기술 고려사항

### 데이터 저장소

1. **JSON 파일** (권장):
   ```json
   {
     "errorCodes": [
       {
         "id": "ERR_User_001",
         "category": "User",
         ...
       }
     ]
   }
   ```

2. **코드 내 상수**:
   ```typescript
   const ERROR_CODES = {
     ERR_User_001: { ... },
     ERR_Auth_001: { ... }
   };
   ```

### 검색 알고리즘

```typescript
function searchErrorCodes(query: string, filters?: {
  category?: string;
  severity?: string;
}): ErrorCode[] {
  // 코드, 메시지, 설명에서 검색
  return errorCodes.filter(code => {
    const matches = query.toLowerCase().split(' ').every(q =>
      code.id.toLowerCase().includes(q) ||
      code.message.toLowerCase().includes(q) ||
      code.description.toLowerCase().includes(q)
    );

    if (!matches) return false;

    if (filters?.category && code.category !== filters.category) {
      return false;
    }

    if (filters?.severity && code.severity !== filters.severity) {
      return false;
    }

    return true;
  });
}
```

### 클라이언트 사이드 처리

- 모든 검색과 필터링은 브라우저에서 실행
- 에러 코드 데이터는 정적 파일로 로드

---

## 📊 성공 메트릭

1. **데이터 관리**: 50개 이상의 에러 코드 관리 가능
2. **검색 정확도**: 검색 결과 95% 정확
3. **응답 속도**: 검색 결과 100ms 이내 표시
4. **사용성**: 평균 2클릭으로 원하는 에러 코드 찾기
5. **커버리지**: 모든 에러 코드의 설명 및 해결책 100% 완성

---

## 🤔 미해결 질문

1. 에러 코드 데이터를 외부 서버에서 로드할까, 아니면 정적으로 포함할까?
2. 에러 코드 변경 이력을 추적할까?
3. 다국어 지원(영어, 한글) 필요할까?
4. 에러 발생 빈도 데이터를 수집할까?

---

**문서 버전**: 1.0
**마지막 수정**: 2025-11-21
