# PRD: Redis Key 패턴 스캐너 (모의)

**작성일**: 2025-11-21
**상태**: 준비 완료

---

## 📋 개요

Redis 데이터베이스의 Key 패턴을 검증하고 관리하는 도구입니다. 실제 Redis에 접속하지 않고, 프로젝트에 정의된 Key 네이밍 컨벤션을 문서화하고 테스트할 수 있습니다. 개발자가 빠르게 Redis 명령어를 생성해서 클립보드에 복사하거나, Key 패턴을 검증할 수 있습니다.

---

## 🎯 목표

1. 프로젝트의 Redis Key 패턴 정의 및 문서화
2. Key 패턴 검증 (올바른 형식 확인)
3. 일반적인 Redis 명령어(GET, SET, EXPIRE 등) 빠르게 생성
4. 사전 정의된 Key 패턴으로부터 명령어 자동 생성
5. 팀이 일관된 Key 네이밍 컨벤션 유지

---

## 👥 사용자 스토리

**AS A** 백엔드 개발자
**I WANT TO** Redis Key 패턴을 정의하고 자주 사용하는 Key를 빠르게 조회
**SO THAT** Redis 개발이 더 효율적이 됩니다.

**AS A** DevOps 엔지니어
**I WANT TO** 개발계/테스트계 Redis의 Key 패턴을 검증
**SO THAT** Key 네이밍 컨벤션을 따르고 있는지 확인할 수 있습니다.

**AS A** 팀 리더
**I WANT TO** 프로젝트의 Redis Key 네이밍 규칙을 한 곳에서 관리
**SO THAT** 팀원들이 일관된 패턴을 사용합니다.

---

## ✅ 기능 요구사항

### 7.1 Key 패턴 정의

1. **미리 정의된 패턴 (사전 설정)**:
   ```
   user:{userId}:profile          (사용자 프로필)
   user:{userId}:preferences      (사용자 설정)
   user:{userId}:sessions:{sid}   (사용자 세션)
   order:{orderId}:items          (주문 항목)
   order:{orderId}:status         (주문 상태)
   cache:products:list            (상품 리스트 캐시)
   session:{sessionId}:data       (세션 데이터)
   lock:transaction:{txId}        (트랜잭션 락)
   ```

2. **패턴 요소**:
   - 고정 문자열: `user`, `order`, `cache`
   - 변수: `{userId}`, `{orderId}` 등
   - 구분자: `:` (권장)
   - 범주: 앞부분으로 그룹화 (예: `user:`, `order:`)

3. **메타데이터**:
   - 패턴 설명
   - 데이터 타입 (String, Hash, List, Set 등)
   - 기본 TTL (Time To Live)
   - 사용 예시

### 7.2 Key 패턴 검증

1. **입력**: Key 문자열
   - 예: `user:12345:profile`
   - 예: `order:ORD-2025-001:items`

2. **기능**:
   - 정의된 패턴과 매칭
   - 패턴이 올바른지 검증
   - 필수 변수 확인
   - 매칭되는 패턴 제안

3. **출력**:
   ```
   입력: user:12345:profile
   매칭된 패턴: user:{userId}:profile
   ✅ 올바른 형식입니다.

   변수 분석:
   - userId: 12345 (숫자형)

   권장 데이터 타입: Hash
   권장 TTL: 86400초 (24시간)
   ```

### 7.3 Redis 명령어 생성기

1. **사전 명령어 템플릿**:
   ```
   GET user:12345:profile
   SET user:12345:profile '{"name":"John","age":30}' EX 86400
   HGET user:12345:profile name
   EXPIRE user:12345:profile 86400
   DEL user:12345:profile
   KEYS user:*
   SCAN 0 MATCH user:*
   ```

2. **기능**:
   - Key 패턴 선택 → 명령어 자동 생성
   - 변수값 입력 → 완성된 명령어 생성
   - 자주 쓰는 명령어 (GET, SET, DEL 등) 버튼
   - 복사 버튼으로 터미널에 붙여넣기

3. **명령어 옵션**:
   - GET: 단순 조회
   - SET: 값 설정 + TTL 지정
   - MGET: 여러 Key 한번에 조회
   - HGET: Hash 필드 조회
   - EXPIRE: TTL 갱신
   - DEL: 삭제
   - KEYS/SCAN: 패턴 검색

### 7.4 패턴 관리 UI

1. **패턴 라이브러리**:
   - 정의된 패턴 목록 (테이블 또는 카드)
   - 각 패턴별:
     - 패턴 문자열
     - 설명
     - 데이터 타입
     - 기본 TTL
     - 사용 예시
   - 클릭 시 명령어 생성 영역에 로드

2. **검색/필터**:
   - 카테고리별 필터 (user:, order:, cache: 등)
   - 키워드 검색

### 7.5 명령어 생성 워크플로우

1. **패턴 선택**:
   - 라이브러리에서 원하는 패턴 클릭
   - 예: `user:{userId}:profile` 선택

2. **변수 입력**:
   - userId 입력 필드 자동 생성
   - 예: `12345` 입력

3. **명령어 선택**:
   - "GET", "SET", "EXPIRE" 등 버튼
   - 옵션: TTL, JSON 값 등

4. **완성된 명령어 표시**:
   - 예: `GET user:12345:profile`
   - 복사 버튼

5. **명령어 실행 가이드**:
   - Redis CLI 명령어 표시
   - 예: `redis-cli GET user:12345:profile`

### 7.6 UI/UX

#### 좌측: 패턴 라이브러리
- 패턴 목록 (스크롤 가능)
- 각 패턴 카드:
  - 패턴 문자열
  - 간단한 설명
  - 데이터 타입 배지
  - 클릭 → 명령어 생성기로 로드

#### 중앙/우측: 명령어 생성기
- **패턴 정보**:
  - 선택된 패턴 표시
  - 패턴 설명
  - 변수 목록

- **변수 입력**:
  - 동적 입력 필드 생성
  - 각 변수별 입력창

- **명령어 선택**:
  - "GET", "SET", "EXPIRE", "DEL" 등 버튼
  - SET 선택 시 추가 옵션:
    - JSON 값 입력
    - TTL 지정 (초 단위)

- **결과 표시**:
  - 완성된 Redis 명령어 (Code 블록)
  - 복사 버튼
  - Redis CLI 호출 예시

#### 하단: 패턴 검증
- Key 입력 필드
- "검증" 버튼
- 검증 결과 표시

#### 버튼
- "복사"
- "터미널에서 실행" (가이드)
- "초기화"

### 7.7 에러 처리

- 패턴 미매칭 경고
- 변수 누락 시 안내
- 잘못된 형식 제안

---

## 📌 비포함 항목 (Out of Scope)

- 실제 Redis 서버 접속 및 데이터 조회
- Redis 명령어 실행 (브라우저에서 불가)
- Redis Cluster 지원
- Redis Stream, Geo 등 고급 자료구조
- 실시간 모니터링

---

## 🎨 디자인 고려사항

- 좌측 패턴 라이브러리, 우측 명령어 생성기 레이아웃
- 패턴 카드로 시각적으로 표시
- 코드 블록으로 명령어 표시
- 복사 버튼으로 빠른 복사
- 반응형 (모바일에서는 1열)

---

## 🔧 기술 고려사항

### Key 패턴 데이터 구조

```typescript
interface RedisKeyPattern {
  id: string;
  pattern: string;          // "user:{userId}:profile"
  description: string;      // "사용자 프로필 정보"
  dataType: 'string' | 'hash' | 'list' | 'set' | 'zset';
  defaultTTL?: number;      // 초 단위
  category: string;         // "user", "order", "cache" 등
  example: string;          // "user:12345:profile"
  variables: {
    name: string;           // "userId"
    type: string;           // "number", "string"
    description: string;
  }[];
}
```

### 패턴 매칭 알고리즘

```typescript
function matchKeyToPattern(key: string, pattern: string): {
  matched: boolean;
  variables: Record<string, string>;
} {
  // 패턴을 정규식으로 변환
  // 예: "user:{userId}:profile" → /^user:(\d+):profile$/
  const regex = patternToRegex(pattern);
  const match = key.match(regex);

  if (!match) {
    return { matched: false, variables: {} };
  }

  // 변수값 추출
  return {
    matched: true,
    variables: extractVariables(pattern, match)
  };
}
```

### 명령어 생성 함수

```typescript
function generateRedisCommand(
  pattern: string,
  variables: Record<string, string>,
  command: 'GET' | 'SET' | 'DEL' | 'EXPIRE',
  options?: { value?: string; ttl?: number }
): string {
  // 변수를 실제값으로 치환
  const key = substituteVariables(pattern, variables);

  switch (command) {
    case 'GET':
      return `GET ${key}`;
    case 'SET':
      return `SET ${key} '${options?.value}' EX ${options?.ttl || 86400}`;
    case 'DEL':
      return `DEL ${key}`;
    case 'EXPIRE':
      return `EXPIRE ${key} ${options?.ttl || 86400}`;
  }
}
```

### 클라이언트 사이드 처리

- 모든 명령어 생성은 브라우저에서 실행
- 사전 정의된 패턴은 코드 또는 JSON에서 로드

---

## 📊 성공 메트릭

1. **패턴 관리**: 10개 이상의 패턴 등록 및 관리 가능
2. **명령어 생성**: 100% 정확한 Redis 명령어 생성
3. **패턴 검증**: 정의된 패턴 95% 이상 정확하게 매칭
4. **사용성**: 3클릭 이내에 명령어 생성 및 복사 가능

---

## 🤔 미해결 질문

1. 실제 Redis 서버와 연동할까? (향후 고려사항)
2. 팀별로 다른 패턴 라이브러리를 관리할까?
3. 패턴 버전 관리 필요할까?
4. 다른 개발자가 패턴을 제안하고 승인하는 워크플로우 필요할까?

---

**문서 버전**: 1.0
**마지막 수정**: 2025-11-21
