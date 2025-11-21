# Task List: 모든 기능 구현 (0002-0010 PRD)

기반 PRD: `0002-prd-java-json-converter.md` ~ `0010-prd-jasypt-encryptor-decryptor.md`

---

## 📂 Relevant Files

### 기존 파일 (수정 필요)
- `components/ToolsLayout.tsx` - 탭 확장 (3개 → 9개 도구)
- `components/Sidebar.tsx` - 메뉴 항목 확장
- `lib/types.ts` - 새로운 handler 타입 정의 추가
- `app/page.tsx` - 도구 추가 (필요시)

### 변환 & 포맷팅 도구 (Java↔JSON, YAML↔Properties)
- `lib/java-json-handler.ts` - Java/JSON 변환 로직
- `lib/java-json-handler.test.ts` - 단위 테스트
- `components/tools/JavaJsonConverter.tsx` - UI 컴포넌트
- `components/tools/JavaJsonConverter.test.tsx` - 컴포넌트 테스트
- `lib/yaml-properties-handler.ts` - YAML/Properties 변환 로직
- `lib/yaml-properties-handler.test.ts` - 단위 테스트
- `components/tools/YamlPropertiesConverter.tsx` - UI 컴포넌트
- `components/tools/YamlPropertiesConverter.test.tsx` - 컴포넌트 테스트

### 시간 & 데이터 처리 도구 (Timestamp, Cron)
- `lib/timestamp-handler.ts` - Timestamp 변환, 타임존 처리
- `lib/timestamp-handler.test.ts` - 단위 테스트
- `components/tools/TimestampConverter.tsx` - UI 컴포넌트
- `components/tools/TimestampConverter.test.tsx` - 컴포넌트 테스트
- `lib/cron-handler.ts` - Cron 파싱, 다음 실행 시간 계산
- `lib/cron-handler.test.ts` - 단위 테스트
- `components/tools/CronExpressionGenerator.tsx` - UI 컴포넌트
- `components/tools/CronExpressionGenerator.test.tsx` - 컴포넌트 테스트

### 보안 & 유틸리티 도구 (URL, Redis)
- `lib/url-handler.ts` - URL Encode/Decode, 파라미터 파싱
- `lib/url-handler.test.ts` - 단위 테스트
- `components/tools/UrlEncoderDecoder.tsx` - UI 컴포넌트
- `components/tools/UrlEncoderDecoder.test.tsx` - 컴포넌트 테스트
- `lib/redis-handler.ts` - Redis 패턴 매칭, 명령어 생성
- `lib/redis-handler.test.ts` - 단위 테스트
- `components/tools/RedisKeyScanner.tsx` - UI 컴포넌트
- `components/tools/RedisKeyScanner.test.tsx` - 컴포넌트 테스트

### 사내 특화 도구 (에러 코드, RegEx)
- `lib/error-code-handler.ts` - 에러 코드 검색, 필터링
- `lib/error-code-handler.test.ts` - 단위 테스트
- `components/tools/ErrorCodeLookup.tsx` - UI 컴포넌트
- `components/tools/ErrorCodeLookup.test.tsx` - 컴포넌트 테스트
- `lib/regex-handler.ts` - RegEx 테스트, 설명 생성
- `lib/regex-handler.test.ts` - 단위 테스트
- `components/tools/RegexTester.tsx` - UI 컴포넌트
- `components/tools/RegexTester.test.tsx` - 컴포넌트 테스트

### 데이터 파일
- `lib/data/error-codes.json` - 에러 코드 라이브러리
- `lib/data/regex-patterns.json` - RegEx 패턴 라이브러리
- `lib/data/redis-patterns.json` - Redis 키 패턴 라이브러리

### Jasypt 암호화/복호화 도구 (Hybrid Architecture)
- `resources/jasypt/GenericJasypt.jar` - Java CLI 도구 (Jasypt + BouncyCastle)
- `resources/jasypt/pom.xml` - Maven 프로젝트 설정 파일
- `resources/jasypt/src/main/java/GenericJasypt.java` - Java 소스 코드
- `app/api/jasypt/route.ts` - Next.js API Route (child_process 사용)
- `app/api/jasypt/route.test.ts` - API Route 테스트 (선택)
- `lib/types.ts` - Jasypt 타입 추가 (JasyptEncryptionData, JasyptEncryptionResult)
- `components/tools/JasyptConverter.tsx` - UI 컴포넌트
- `components/tools/JasyptConverter.test.tsx` - 컴포넌트 테스트

### 문서
- `README.md` - 새로운 도구 사용법 추가
- `resources/jasypt/README.md` - Java CLI 도구 빌드 및 사용법

### Notes

- 모든 단위 테스트는 소스 파일과 같은 디렉토리에 위치 (예: `lib/timestamp-handler.ts` & `lib/timestamp-handler.test.ts`)
- Jest 테스트 실행: `npm test` 또는 `npx jest [optional/path/to/test/file]`
- 새 라이브러리 설치 필요:
  - `date-fns`, `date-fns-tz` (Timestamp 변환)
  - `js-yaml` (YAML 파싱)
  - `cron-parser` (Cron 파싱)

---

## 🎯 Tasks

### 1.0 기초 구조 확장 및 공통 컴포넌트 업데이트 ✅

- [x] 1.1 `lib/types.ts` 확장 - 새로운 handler 타입 정의 ✅
  - ✅ `JavaJsonConversionData` & `JavaJsonConversionResult` 타입 정의
  - ✅ `YamlPropertiesConversionData` & `YamlPropertiesConversionResult` 타입
  - ✅ `TimestampConversionData` & `TimestampConversionResult` 타입
  - ✅ `CronExpressionData` & `CronExpressionResult` 타입
  - ✅ `UrlEncodingData` & `UrlEncodingResult` 타입
  - ✅ `RedisKeyPattern`, `RedisCommandData` & `RedisCommandResult` 타입
  - ✅ `ErrorCode`, `ErrorCodeLookupData` & `ErrorCodeLookupResult` 타입
  - ✅ `RegexPattern`, `RegexTestData` & `RegexTestResult` 타입
  - ✅ 공통 `Result<T>` 패턴 일관성 유지

- [x] 1.2 `components/ToolsLayout.tsx` 탭 확장 ✅
  - ✅ 기존 3개 탭(JSON, JWT, SQL) 유지
  - ✅ 새로운 8개 탭 추가 (Java↔JSON, YAML↔Properties, Timestamp, Cron, URL, Redis, ErrorCode, RegEx)
  - ✅ `renderToolContent()` switch 문으로 탭 라우팅 로직 구현
  - ✅ `getToolTitle()`, `getToolDescription()` 함수로 동적 헤더 관리
  - ✅ ToolPlaceholder 컴포넌트로 임시 도구 표시
  - ✅ 모든 탭에서 동적으로 제목과 설명 표시

- [x] 1.3 `components/Sidebar.tsx` 메뉴 확장 ✅
  - ✅ 8개 도구 메뉴 항목 추가
  - ✅ 5개 섹션으로 그룹화 (기본 도구, 변환, 시간, 보안, 사내특화)
  - ✅ Lucide icons 추가 (FileJson, Lock, Database, ArrowRightLeft, Settings, Clock, Zap, Link2, Cpu, AlertCircle, FileText)
  - ✅ 섹션 제목과 아이콘으로 시각적 구분

- [x] 1.4 필요한 라이브러리 설치 ✅
  - ✅ `npm install date-fns date-fns-tz js-yaml cron-parser`
  - ✅ package.json에 4개 라이브러리 추가 완료

- [x] 1.5 통합 테스트 기초 준비 ✅
  - ✅ TypeScript 빌드 성공 (`npm run build`)
  - ✅ 타입 체크 통과 (`npx tsc --noEmit`)
  - ✅ ToolsLayout 탭 전환 로직 구현 완료
  - ✅ Sidebar 메뉴 네비게이션 구현 완료
  - ✅ 모든 새 타입 정의 및 컴포넌트 구조 준비 완료

---

### 2.0 변환 & 포맷팅 도구 구현 (Java↔JSON, YAML↔Properties)

#### 2.1 Java ↔ JSON 변환기

- [x] 2.1.1 `lib/java-json-handler.ts` 구현 ✅
  - ✅ `parseJavaClass(input: string)`: Java 클래스 문법 파싱
  - ✅ `generateJsonFromJava(javaClass: JavaClass, options)`: JSON 예시 생성
  - ✅ `parseJsonToJavaClass(json: string, options)`: JSON → Java DTO 생성
  - ✅ `convertCasing(text: string, from: 'camelCase' | 'snake_case', to: 'camelCase' | 'snake_case')`: 네이밍 변환
  - ✅ 타입별 기본값 생성 (String → "", int → 0 등)
  - ✅ Nested 클래스/배열 처리

- [x] 2.1.2 `lib/java-json-handler.test.ts` 단위 테스트 ✅
  - ✅ Java 파싱 테스트 (기본 타입, Nested, Generic)
  - ✅ JSON 생성 정확도 테스트
  - ✅ CamelCase ↔ snake_case 변환 테스트
  - ✅ 에러 처리 테스트 (문법 오류 감지)
  - ✅ 최소 30개 테스트 케이스 (35/35 passing)

- [x] 2.1.3 `components/tools/JavaJsonConverter.tsx` UI 구현 ✅
  - ✅ 탭 기반 레이아웃 (Java→JSON, JSON→Java)
  - ✅ 좌측: 입력 (Textarea), 우측: 출력 (Card)
  - ✅ 옵션 패널: 네이밍 방식 선택 (CamelCase/snake_case)
  - ✅ 버튼: "변환", "복사", "초기화"
  - ✅ 에러 표시 (Alert)
  - ✅ 실시간 또는 버튼 클릭 변환

- [x] 2.1.4 `components/tools/JavaJsonConverter.test.tsx` 컴포넌트 테스트 ✅
  - ✅ 컴포넌트 렌더링 테스트
  - ✅ 입력 → 변환 → 표시 흐름 테스트
  - ✅ 복사 버튼 클릭 테스트
  - ✅ 에러 메시지 표시 테스트
  - ✅ 옵션 변경 테스트

#### 2.2 YAML ↔ Properties 변환기

- [x] 2.2.1 `lib/yaml-properties-handler.ts` 구현 ✅
  - ✅ `parseYaml(input: string)`: YAML 파싱 (`js-yaml` 활용)
  - ✅ `yamlToProperties(yaml: string, options)`: YAML → Properties 변환
  - ✅ `parseProperties(input: string)`: Properties 파싱 (정규식)
  - ✅ `propertiesToYaml(props: string, options)`: Properties → YAML 변환
  - ✅ 네스팅 깊이 처리 (점으로 연결)
  - ✅ 배열/리스트 처리 ([0], [1] ↔ YAML 리스트)
  - ✅ 주석 제거 처리
  - ✅ 들여쓰기 설정 (2칸/4칸)

- [x] 2.2.2 `lib/yaml-properties-handler.test.ts` 단위 테스트 ✅
  - ✅ YAML 파싱 및 변환 테스트
  - ✅ Properties 파싱 및 변환 테스트
  - ✅ 중첩 구조 처리 테스트
  - ✅ 배열/리스트 변환 테스트
  - ✅ 주석 처리 테스트
  - ✅ 특수 문자 이스케이핑 테스트
  - ✅ 최소 40개 테스트 케이스 (32/32 passing)

- [x] 2.2.3 `components/tools/YamlPropertiesConverter.tsx` UI 구현 ✅
  - ✅ 탭 기반 레이아웃 (YAML→Properties, Properties→YAML)
  - ✅ 좌측: 입력, 우측: 출력
  - ✅ 옵션 패널: 들여쓰기 스타일 (2칸/4칸)
  - ✅ 버튼: "변환", "복사", "초기화", "예제 로드"
  - ✅ 버튼 클릭 변환
  - ✅ 에러 표시

- [x] 2.2.4 `components/tools/YamlPropertiesConverter.test.tsx` 컴포넌트 테스트 ✅
  - ✅ 컴포넌트 렌더링 및 탭 전환 테스트
  - ✅ 변환 흐름 테스트
  - ✅ 옵션 변경에 따른 출력 변화 테스트
  - ✅ 복사 및 초기화 버튼 테스트

#### 2.3 통합 테스트

- [x] 2.3.1 변환 도구 통합 테스트 ✅
  - ✅ 탭 전환 가능성 확인 (모든 모드에서 정상 동작)
  - ✅ 예제 데이터로 변환 테스트 (YAML→Properties, Properties→YAML 모두 성공)
  - ✅ 양방향 변환 일관성 확인 (들여쓰기 옵션 동작 확인)

---

### 3.0 시간 & 데이터 처리 도구 구현 (Timestamp, Cron)

#### 3.1 Epoch/Unix Timestamp 변환기

- [x] 3.1.1 `lib/timestamp-handler.ts` 구현 ✅
  - ✅ `detectTimestampUnit(input: string)`: 초/밀리초 자동 감지
  - ✅ `timestampToDate(timestamp: number, timezone: string)`: Timestamp → 날짜
  - ✅ `dateToTimestamp(date: Date, timezone: string, unit: 's' | 'ms')`: 날짜 → Timestamp
  - ✅ `getTimezoneOffset(timezone: string)`: 타임존 오프셋 계산
  - ✅ `formatToISO8601(date: Date)`: ISO 8601 형식으로 포맷
  - ✅ `getRelativeTime(date: Date)`: 상대 시간 표시 (예: "2시간 전")
  - ✅ `getDayOfWeek(date: Date)`: 요일 반환
  - ✅ `calculateTimeDifference(ts1: number, ts2: number)`: 시간 차이 계산
  - ✅ KST, UTC, JST, CST, EST, PST 기본 지원

- [x] 3.1.2 `lib/timestamp-handler.test.ts` 단위 테스트 ✅
  - ✅ Timestamp → Date 변환 테스트
  - ✅ Date → Timestamp 변환 테스트
  - ✅ 초/밀리초 단위 감지 테스트
  - ✅ 타임존 변환 테스트 (KST ↔ UTC)
  - ✅ 상대 시간 표시 테스트
  - ✅ 시간 차이 계산 테스트
  - ✅ 48개 테스트 케이스 (모두 통과)

- [x] 3.1.3 `components/tools/TimestampConverter.tsx` UI 구현 ✅
  - ✅ 탭 기반 레이아웃 (Timestamp→Date, Date→Timestamp)
  - ✅ Timestamp 입력 (Textarea)
  - ✅ 날짜/시간 선택 (Input type="datetime-local")
  - ✅ 옵션: 타임존 선택 (탭), 단위 선택 (탭)
  - ✅ 출력: UTC, KST, ISO 8601, 상대 시간, 요일
  - ✅ 버튼: "지금", "변환", "복사", "초기화"
  - ✅ 현재 시간 표시 섹션

- [x] 3.1.4 `components/tools/TimestampConverter.test.tsx` 컴포넌트 테스트 ✅
  - ✅ 컴포넌트 렌더링 테스트
  - ✅ Timestamp 입력 → 변환 테스트
  - ✅ 날짜 입력 → 변환 테스트
  - ✅ "지금" 버튼 기능 테스트
  - ✅ 타임존 선택 테스트
  - ✅ 29개 테스트 케이스 (모두 통과)

#### 3.2 Cron Expression 생성기/테스터

- [x] 3.2.1 `lib/cron-handler.ts` 구현 ✅
  - ✅ `buildCronExpression(config)`: GUI 선택값 → Cron 문자열 생성
  - ✅ `parseCronExpression(cronString: string)`: Cron 문자열 파싱
  - ✅ `describeCron(cronString: string)`: Cron 식 설명 생성 (한글)
  - ✅ `getNextExecutionTimes(cronString: string, count: number, baseDate?)`: 다음 N번 실행 시간
  - ✅ `validateCronExpression(cronString: string)`: Cron 형식 검증
  - ✅ Linux (5필드), Quartz (6필드+초) 지원
  - ✅ Timezone 지원 (Asia/Seoul)
  - ✅ CRON_PRESETS 사전 설정 (7개 패턴)

- [x] 3.2.2 `lib/cron-handler.test.ts` 단위 테스트 ✅
  - ✅ Cron 생성 테스트 (GUI 선택값 → 식)
  - ✅ Cron 파싱 테스트
  - ✅ 다음 실행 시간 계산 테스트
  - ✅ 설명 생성 테스트 (한글 요일/월 처리)
  - ✅ 형식 검증 테스트
  - ✅ 사전 설정(presets) 테스트
  - ✅ 45개 테스트 케이스 (모두 통과)

- [x] 3.2.3 `components/tools/CronExpressionGenerator.tsx` UI 구현 ✅
  - ✅ 탭 레이아웃: GUI 빌더 | 표현식 검증
  - ✅ **생성 패널**:
    - ✅ Input 필드: 분(0-59), 시(0-23), 일(1-31), 월(1-12), 요일(0-7), 초(옵션)
    - ✅ 사전 설정 버튼 7개 (매분, 매시간, 매일 자정, 평일, 주말 등)
    - ✅ 출력: Cron 문자열 + 설명 + 다음 10번 실행 시간
  - ✅ **테스터 패널**:
    - ✅ 입력: Cron 문자열 (Textarea)
    - ✅ 출력: 설명 + 다음 10번 실행 시간 (한글 날짜)
    - ✅ Timezone: Asia/Seoul 고정
  - ✅ 버튼: "생성 및 검증", "검증 및 테스트", "복사", "초기화"

- [x] 3.2.4 `components/tools/CronExpressionGenerator.test.tsx` 컴포넌트 테스트 ✅
  - ✅ 컴포넌트 렌더링 테스트
  - ✅ 필드 입력 → Cron 생성 테스트
  - ✅ Cron 입력 → 설명 및 실행 시간 표시 테스트
  - ✅ 사전 설정 버튼 테스트
  - ✅ 29개 테스트 케이스 (모두 통과)

#### 3.3 통합 테스트

- [x] 3.3.1 시간 도구 통합 테스트 ✅
  - ✅ Timestamp 변환 기능 브라우저 테스트 성공
  - ✅ Cron Expression 생성/검증 브라우저 테스트 성공
  - ✅ 프리셋 버튼 동작 확인 (평일 오전 9시 테스트)
  - ✅ 다음 실행 시간 정확성 검증 (5분마다 패턴 테스트)

---

### 4.0 보안 & 유틸리티 도구 구현 (URL, Redis)

#### 4.1 URL Encode/Decode

- [ ] 4.1.1 `lib/url-handler.ts` 구현
  - `encodeUrl(text: string, options)`: 텍스트 → URL Encode
    - 공백: %20 또는 +
    - 한글/이모지 UTF-8 인코딩
    - 특수 문자 처리
  - `decodeUrl(encoded: string)`: URL Decode
  - `parseQueryString(qs: string)`: 쿼리 파라미터 파싱
  - `encodeFormData(data: object)`: 폼 데이터 인코딩
  - 다양한 문자 집합 지원 (UTF-8, euc-kr)
  - 예약 문자 처리 옵션

- [ ] 4.1.2 `lib/url-handler.test.ts` 단위 테스트
  - URL Encode 테스트 (한글, 특수문자, 이모지)
  - URL Decode 테스트
  - 쿼리 파라미터 파싱 테스트
  - 공백 처리 테스트 (%20 vs +)
  - 오류 처리 테스트
  - 최소 30개 테스트 케이스

- [ ] 4.1.3 `components/tools/UrlEncoderDecoder.tsx` UI 구현
  - 3개 탭: Encode, Decode, Query Parser
  - **Encode 탭**: 텍스트 입력 → URL 인코딩 출력
  - **Decode 탭**: 인코딩된 URL → 텍스트 출력
  - **Query Parser 탭**: URL 또는 쿼리 스트링 → 파라미터 테이블
  - 옵션: 공백 처리 방식, 문자 집합
  - 버튼: "변환", "복사", "초기화"

- [ ] 4.1.4 `components/tools/UrlEncoderDecoder.test.tsx` 컴포넌트 테스트
  - 탭 전환 테스트
  - Encode/Decode 기능 테스트
  - Query Parser 기능 테스트
  - 복사 버튼 테스트

#### 4.2 Redis Key 패턴 스캐너

- [ ] 4.2.1 `lib/redis-patterns.json` 데이터 파일 생성
  - 사전 정의된 Redis Key 패턴 (10개 이상)
    - `user:{userId}:profile`
    - `session:{sessionId}:data`
    - `order:{orderId}:items`
    - `cache:products:list` 등
  - 각 패턴: 설명, 데이터 타입, 기본 TTL, 변수 정의

- [ ] 4.2.2 `lib/redis-handler.ts` 구현
  - `loadRedisPatterns()`: 패턴 라이브러리 로드
  - `matchKeyToPattern(key: string, pattern: string)`: Key를 패턴과 매칭
  - `extractVariables(pattern: string, key: string)`: 패턴에서 변수 추출
  - `generateRedisCommand(pattern, variables, command, options)`: Redis 명령어 생성
  - `validateKey(key: string)`: Key 검증
  - `describePattern(pattern: string)`: 패턴 설명

- [ ] 4.2.3 `lib/redis-handler.test.ts` 단위 테스트
  - 패턴 로드 테스트
  - Key 매칭 테스트
  - 변수 추출 테스트
  - 명령어 생성 테스트 (GET, SET, EXPIRE, DEL)
  - 최소 35개 테스트 케이스

- [ ] 4.2.4 `components/tools/RedisKeyScanner.tsx` UI 구현
  - 2열 레이아웃: 패턴 라이브러리(좌) | 명령어 생성기(우)
  - **라이브러리**:
    - 패턴 목록 (카드 또는 테이블)
    - 검색 및 필터 (카테고리별)
    - 클릭하면 오른쪽에 로드
  - **명령어 생성**:
    - 선택된 패턴 표시
    - 변수 입력 필드 (동적 생성)
    - 명령어 선택 버튼 (GET, SET, EXPIRE, DEL 등)
    - 결과: Redis 명령어 + Redis CLI 호출 예시
  - **Key 검증**:
    - Key 입력 → 패턴 매칭 → 검증 결과
  - 버튼: "복사", "초기화"

- [ ] 4.2.5 `components/tools/RedisKeyScanner.test.tsx` 컴포넌트 테스트
  - 컴포넌트 렌더링 테스트
  - 패턴 선택 테스트
  - 변수 입력 → 명령어 생성 테스트
  - Key 검증 테스트

#### 4.3 통합 테스트

- [ ] 4.3.1 보안/유틸리티 도구 통합 테스트
  - URL과 쿼리 파라미터 일관성 확인
  - Redis Key 패턴과 명령어의 정확성 검증

---

### 5.0 사내 특화 도구 구현 (에러 코드, RegEx)

#### 5.1 에러 코드 조회기

- [ ] 5.1.1 `lib/data/error-codes.json` 데이터 파일 생성
  - 커스텀 에러 코드 정의 (20개 이상)
    - `ERR_User_001`: 사용자를 찾을 수 없음
    - `ERR_Auth_001`: 인증 실패
    - `ERR_Payment_001`: 결제 실패 등
  - 각 코드: 카테고리, 심각도, HTTP 상태, 메시지, 원인, 해결책, 예제, 소스 위치

- [ ] 5.1.2 `lib/error-code-handler.ts` 구현
  - `loadErrorCodes()`: 에러 코드 라이브러리 로드
  - `searchErrorCodes(query: string, filters)`: 검색 및 필터링
  - `getErrorCodeDetails(code: string)`: 상세 정보 조회
  - `filterByCategory(category: string)`: 카테고리별 필터
  - `filterBySeverity(severity: string)`: 심각도별 필터
  - `getSeverityColor(severity: string)`: 심각도별 색상

- [ ] 5.1.3 `lib/error-code-handler.test.ts` 단위 테스트
  - 에러 코드 로드 테스트
  - 검색 기능 테스트 (코드, 메시지, 설명)
  - 필터링 테스트 (카테고리, 심각도)
  - 상세 정보 조회 테스트
  - 최소 30개 테스트 케이스

- [ ] 5.1.4 `components/tools/ErrorCodeLookup.tsx` UI 구현
  - 2열 레이아웃: 검색 결과(좌) | 상세 정보(우)
  - **검색 영역**:
    - 검색 입력 (코드, 메시지, 키워드)
    - 필터 버튼: 카테고리, 심각도, HTTP 상태
    - 정렬 옵션
  - **검색 결과**:
    - 에러 코드 리스트
    - 각 항목: 코드, 메시지, 카테고리 배지, 심각도 배지(색상)
  - **상세 정보**:
    - 코드, 메시지, 카테고리, 심각도, HTTP 상태
    - 원인, 해결책 (리스트)
    - 코드 예제 (언어별 탭)
  - 버튼: "복사"(코드), "복사"(메시지), "복사"(전체), "즐겨찾기"

- [ ] 5.1.5 `components/tools/ErrorCodeLookup.test.tsx` 컴포넌트 테스트
  - 컴포넌트 렌더링 테스트
  - 검색 및 필터링 기능 테스트
  - 상세 정보 표시 테스트
  - 복사 버튼 테스트

#### 5.2 RegEx 테스트 & 라이브러리

- [ ] 5.2.1 `lib/data/regex-patterns.json` 데이터 파일 생성
  - 사전 정의된 정규식 (20개 이상)
    - 이메일: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
    - 전화번호: `/^01[0-9]-\d{3,4}-\d{4}$/`
    - 비밀번호: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/` 등
  - 각 패턴: 설명, 예제(올바른/잘못된), 정규식

- [ ] 5.2.2 `lib/regex-handler.ts` 구현
  - `loadRegexPatterns()`: 정규식 라이브러리 로드
  - `testRegex(pattern: string, flags: string, testString: string)`: 정규식 테스트
  - `getMatchResults(pattern: string, flags: string, testString: string)`: 모든 매칭 결과
  - `describeRegex(pattern: string)`: 정규식 설명 생성 (각 요소 설명)
  - `highlightMatches(text: string, matches: any[])`: 매칭된 부분 하이라이팅
  - `validateRegexSyntax(pattern: string)`: 정규식 문법 검증

- [ ] 5.2.3 `lib/regex-handler.test.ts` 단위 테스트
  - 정규식 로드 테스트
  - 정규식 테스트 기능 테스트
  - 모든 매칭 결과 추출 테스트
  - 설명 생성 테스트
  - 문법 검증 테스트
  - 최소 35개 테스트 케이스

- [ ] 5.2.4 `components/tools/RegexTester.tsx` UI 구현
  - 3열 레이아웃: 라이브러리(좌) | 테스트(중) | 정보(우)
  - **라이브러리**:
    - 카테고리별 정규식 리스트
    - 검색 필터
    - 클릭 시 테스트 영역에 로드
  - **테스트**:
    - 정규식 입력 (직접 입력 또는 라이브러리에서 선택)
    - 플래그 선택 (g, i, m)
    - 테스트 문자열 입력
    - 결과: ✅ 매칭됨 / ❌ 미매칭
    - 매칭된 부분 하이라이팅
    - 캡처 그룹 정보
  - **정보**:
    - 패턴 설명 (각 요소 분석)
    - 사용 예제
  - 버튼: "테스트", "복사"(정규식), "복사"(코드), "초기화"

- [ ] 5.2.5 `components/tools/RegexTester.test.tsx` 컴포넌트 테스트
  - 컴포넌트 렌더링 테스트
  - 라이브러리 패턴 선택 테스트
  - 정규식 테스트 기능 테스트
  - 하이라이팅 테스트

#### 5.3 통합 테스트

- [ ] 5.3.1 사내 특화 도구 통합 테스트
  - 에러 코드 검색과 필터의 일관성 확인
  - RegEx 패턴과 테스트 결과의 정확성 검증
  - UI 반응성 및 데이터 로드 성능 확인

---

### 6.0 Jasypt 암호화/복호화 도구 구현 (Hybrid Architecture)

#### 6.1 Java CLI 도구 개발 (GenericJasypt.jar)

- [ ] 6.1.1 Maven 프로젝트 초기화
  - `resources/jasypt/` 디렉토리 생성
  - `pom.xml` 생성 및 의존성 추가:
    - `org.jasypt:jasypt:1.9.3`
    - `org.bouncycastle:bcprov-jdk15on:1.70`
  - 기본 프로젝트 구조 설정 (`src/main/java/`)

- [ ] 6.1.2 `GenericJasypt.java` 메인 클래스 구현
  - `main(String[] args)` 메서드 작성
  - 커맨드라인 인자 파싱:
    - `args[0]`: mode (encrypt | decrypt)
    - `args[1]`: text (입력 텍스트)
    - `args[2]`: password (Secret Key)
    - `args[3]`: algorithm (알고리즘)
    - `args[4]`: outputType (hexadecimal | base64)
    - `args[5]`: poolSize (1-10)
  - 인자 개수 검증 (최소 6개)

- [ ] 6.1.3 암호화/복호화 로직 구현
  - `PooledPBEStringEncryptor` 인스턴스 생성
  - Bouncy Castle Provider 설정
  - 알고리즘, 패스워드, 출력 타입, Pool Size 설정
  - `encrypt()` / `decrypt()` 메서드 호출
  - 결과를 stdout으로 출력, 에러를 stderr로 출력

- [ ] 6.1.4 에러 처리 구현
  - try-catch로 모든 예외 포착
  - 친절한 에러 메시지 출력:
    - "Error: Missing arguments"
    - "Error: Decryption failed - Invalid key or algorithm"
    - "Error: Invalid input format"
  - 비정상 종료 시 exit code 1 반환

- [ ] 6.1.5 Jar 파일 빌드 및 테스트
  - `mvn clean package` 실행
  - `target/GenericJasypt.jar` 생성 확인
  - 로컬 테스트:
    ```bash
    java -jar GenericJasypt.jar encrypt "myPassword" "mySecretKey" "PBEWithSHA256And128BitAES-CBC-BC" "hexadecimal" "1"
    ```
  - 암호화/복호화 정확성 검증

- [ ] 6.1.6 빌드된 Jar 파일 배치
  - `resources/jasypt/GenericJasypt.jar`로 복사
  - Next.js 프로젝트에서 접근 가능한 위치 확인
  - `.gitignore` 확인 (Jar 파일 제외 여부)

- [ ] 6.1.7 Java CLI 문서 작성
  - `resources/jasypt/README.md` 생성
  - 빌드 방법, 사용법, 예제 작성

#### 6.2 Next.js API Route 구현 (/api/jasypt)

- [ ] 6.2.1 `app/api/jasypt/route.ts` 파일 생성
  - TypeScript 기본 구조 작성
  - `export async function POST(request: Request)` 함수 정의

- [ ] 6.2.2 요청 본문 파싱
  - `await request.json()` 호출
  - 필드 추출: `mode, text, password, algorithm, outputType, poolSize`
  - 필수 필드 검증 (빈 값 체크)

- [ ] 6.2.3 `ENC()` 자동 제거 로직 구현
  - 정규식으로 `ENC(...)`에서 내용만 추출
  - `const cleanText = text.replace(/^ENC\((.*)\)$/, '$1')`
  - 양쪽 공백 제거 (`trim()`)

- [ ] 6.2.4 Java CLI 실행 로직 구현
  - `child_process`의 `exec` 함수 import
  - `util.promisify(exec)` 사용
  - Jar 파일 경로 계산: `path.join(process.cwd(), 'resources', 'jasypt', 'GenericJasypt.jar')`
  - 명령어 문자열 조립:
    ```typescript
    `java -jar "${jarPath}" ${mode} "${cleanText}" "${password}" "${algorithm}" "${outputType}" "${poolSize}"`
    ```
  - 큰따옴표 이스케이핑 처리

- [ ] 6.2.5 에러 처리 및 응답 포맷팅
  - `try-catch` 블록으로 감싸기
  - stderr 내용 확인하여 에러 분류:
    - "Invalid key" → "Secret Key가 일치하지 않습니다"
    - "Invalid algorithm" → "알고리즘이 일치하지 않습니다"
    - 기타 → "입력 형식이 올바르지 않습니다"
  - 성공 시: `NextResponse.json({ result: stdout.trim() })`
  - 실패 시: `NextResponse.json({ error: "에러 메시지" }, { status: 500 })`

- [ ] 6.2.6 보안 검증
  - 입력 문자열 sanitization (명령어 인젝션 방지)
  - Secret Key가 로그에 노출되지 않도록 확인
  - timeout 설정 (최대 10초)

- [ ] 6.2.7 API Route 테스트 (선택)
  - `app/api/jasypt/route.test.ts` 생성
  - Mock exec 함수로 단위 테스트
  - 성공/실패 케이스 테스트

#### 6.3 타입 정의 및 클라이언트 로직

- [ ] 6.3.1 `lib/types.ts` 확장
  - Jasypt 관련 타입 추가:
    ```typescript
    export interface JasyptEncryptionData {
      result: string;          // 암호화 또는 복호화된 텍스트
      mode: 'encrypt' | 'decrypt';
      original: string;        // 원본 입력
      algorithm: string;
      outputType: string;
    }

    export type JasyptEncryptionResult = Result<JasyptEncryptionData>;

    export interface JasyptApiRequest {
      mode: 'encrypt' | 'decrypt';
      text: string;
      password: string;
      algorithm: string;
      outputType: string;
      poolSize: string;
    }

    export interface JasyptApiResponse {
      result?: string;
      error?: string;
    }
    ```

- [ ] 6.3.2 클라이언트 유틸리티 함수 (선택)
  - `lib/jasypt-handler.ts` 생성 (필요시)
  - `removeEncWrapper(text: string)` - ENC() 제거
  - `addEncWrapper(text: string)` - ENC() 추가
  - `validateAlgorithm(algo: string)` - 알고리즘 검증

#### 6.4 React 컴포넌트 UI 구현

- [ ] 6.4.1 `components/tools/JasyptConverter.tsx` 파일 생성
  - "use client" 디렉티브 추가
  - 기본 import (React, useState, useEffect, Shadcn 컴포넌트)

- [ ] 6.4.2 상태 관리 설정
  - `useState`로 다음 상태 관리:
    - `key: string` (Secret Key)
    - `text: string` (입력 텍스트)
    - `result: string | null` (결과)
    - `error: string | null` (에러 메시지)
    - `algorithm: string` (기본: "PBEWithSHA256And128BitAES-CBC-BC")
    - `outputType: string` (기본: "hexadecimal")
    - `poolSize: string` (기본: "1")
    - `isOpen: boolean` (고급 설정 열림/닫힘)
    - `isLoading: boolean` (처리 중 상태)

- [ ] 6.4.3 LocalStorage 설정 저장/복원
  - `useEffect(() => { ... }, [])` 훅으로 페이지 로드 시 복원:
    - `localStorage.getItem("jasypt_algo")`
    - `localStorage.getItem("jasypt_key")` (선택)
    - `localStorage.getItem("jasypt_outputType")`
    - `localStorage.getItem("jasypt_poolSize")`
  - 처리 전 설정 저장:
    - `localStorage.setItem("jasypt_algo", algorithm)`

- [ ] 6.4.4 암호화/복호화 함수 구현
  - `handleProcess = async (mode: "encrypt" | "decrypt") => { ... }`
  - 입력 검증 (key, text 빈 값 체크)
  - `fetch("/api/jasypt", { method: "POST", body: JSON.stringify(...) })`
  - 응답 처리:
    - 성공: `setResult(data.result)`, `setError(null)`, `toast.success("처리 완료!")`
    - 실패: `setError(data.error)`, `setResult(null)`, `toast.error(...)`
  - 로딩 상태 관리 (`setIsLoading(true/false)`)

- [ ] 6.4.5 복사 버튼 구현
  - `navigator.clipboard.writeText(result)`
  - `toast.info("클립보드에 복사되었습니다")`

- [ ] 6.4.6 UI 레이아웃 구현
  - Card 컨테이너 (`max-w-xl mx-auto`)
  - CardHeader: "Jasypt Encryptor/Decryptor"
  - CardContent:
    - **Secret Key (Password)** Input (type="password")
    - **Target Text** Input (placeholder="ENC(...) or plain text")
    - **고급 설정** Collapsible:
      - Algorithm Select (3개 옵션)
      - Output Type Select (2개 옵션)
      - Pool Size Input (type="number", 1-10)
    - 버튼 그룹:
      - [Decrypt] Button (variant="default")
      - [Encrypt] Button (variant="secondary")
    - 결과 영역 (result가 있을 때만 표시):
      - Label: "Result (Click to copy)"
      - Code 블록 (클릭 시 복사)
      - [복사] Button
    - 에러 영역 (error가 있을 때만 표시):
      - Alert (variant="destructive")

- [ ] 6.4.7 로딩 상태 UI
  - 버튼에 `disabled={isLoading}` 추가
  - 로딩 중 Spinner 또는 텍스트 표시

- [ ] 6.4.8 스타일링 및 반응형
  - Shadcn UI 기본 스타일 적용
  - 모바일 반응형 확인 (입력 필드 너비 조정)
  - 다크 모드 호환성 확인

- [ ] 6.4.9 컴포넌트 테스트 작성 (선택)
  - `components/tools/JasyptConverter.test.tsx` 생성
  - React Testing Library 사용
  - 렌더링, 입력, 변환, 복사 테스트

#### 6.5 통합 및 최종 테스트

- [ ] 6.5.1 `components/ToolsLayout.tsx` 업데이트
  - `import { JasyptConverter } from "@/components/tools/JasyptConverter"`
  - `renderToolContent()` switch문에 케이스 추가:
    ```typescript
    case "jasypt":
      return <JasyptConverter />
    ```
  - `getToolTitle()`, `getToolDescription()` 함수 업데이트

- [ ] 6.5.2 `components/Sidebar.tsx` 업데이트
  - 메뉴 항목 추가 (보안 섹션):
    ```typescript
    { id: "jasypt", label: "Jasypt", icon: Lock, section: "보안" }
    ```
  - Lucide `Lock` 아이콘 import

- [ ] 6.5.3 타입 체크 및 빌드 테스트
  - `npx tsc --noEmit` 실행 (타입 에러 확인)
  - `npm run build` 실행 (빌드 성공 확인)
  - 경고 메시지 해결

- [ ] 6.5.4 브라우저 엔드-투-엔드 테스트
  - 개발 서버 실행: `npm run dev`
  - Jasypt 탭 이동 확인
  - **암호화 테스트**:
    - Secret Key 입력: "testKey"
    - 텍스트 입력: "myPassword123"
    - [Encrypt] 클릭 → 암호화된 문자열 출력 확인
  - **복호화 테스트**:
    - 위에서 생성된 암호화 문자열 입력
    - [Decrypt] 클릭 → "myPassword123" 복원 확인
  - **ENC() 자동 제거 테스트**:
    - 입력: `ENC(암호화된문자열)`
    - 자동으로 ENC() 제거되어 복호화 성공
  - **고급 설정 테스트**:
    - Algorithm 변경 → 복호화 실패 확인
    - Output Type 변경 (hex ↔ base64) 테스트
  - **LocalStorage 테스트**:
    - 설정 입력 → 페이지 새로고침 → 설정 복원 확인
  - **에러 처리 테스트**:
    - 잘못된 Secret Key → 에러 메시지 확인
    - 빈 입력 → 검증 에러 확인

- [ ] 6.5.5 성능 및 보안 검증
  - 암호화/복호화 처리 시간 측정 (목표: <5초)
  - 네트워크 탭에서 API 요청/응답 확인
  - Secret Key가 로그에 노출되지 않는지 확인
  - 브라우저 콘솔 에러 확인

- [ ] 6.5.6 문서 업데이트
  - `README.md` 업데이트:
    - Jasypt 도구 설명 추가
    - 사전 요구사항: Java 11+ 설치 필요
    - 사용 예제 추가
  - `resources/jasypt/README.md` 작성:
    - Java CLI 빌드 방법
    - 독립 실행 방법
    - Troubleshooting

---

### 7.0 최종 통합, 테스트 및 배포 준비

- [ ] 7.1 모든 도구 통합 테스트
  - ToolsLayout에서 모든 10개 탭 전환 가능성 확인 (Jasypt 포함)
  - 각 도구별 기본 기능 작동 확인
  - 예제 데이터로 엔드-투-엔드 테스트

- [ ] 7.2 UI/UX 최적화
  - 반응형 디자인 검증 (모바일, 태블릿, 데스크톱)
  - 다크 모드 적용 확인
  - 접근성 검증 (키보드 네비게이션, 색상 대비)
  - 로딩 상태 및 에러 메시지 UI 일관성

- [ ] 7.3 성능 최적화
  - 각 도구별 응답 속도 측정 (목표: <100ms)
  - 번들 크기 검증
  - 메모리 누수 확인

- [ ] 7.4 문서 업데이트
  - `README.md` 업데이트
    - 모든 도구 설명 및 사용법 추가
    - 설치, 실행, 테스트 명령어
    - 기술 스택 업데이트
  - 각 도구별 예제 및 팁 추가

- [ ] 7.5 최종 빌드 및 타입 검사
  - `npm run build` 실행 및 빌드 성공 확인
  - `npx tsc --noEmit` 타입 체크 성공 확인
  - 모든 테스트 통과 확인 (`npm test`)
  - Lint 확인 (`npm run lint`)

- [ ] 7.6 배포 준비
  - 환경 변수 확인
  - Vercel/Docker/Node.js 배포 옵션 검토
  - CI/CD 파이프라인 구성 (선택사항)
  - 배포 가능 상태 확인

---

## 📊 요약

**총 Task**: 7개 Parent Task + 90개+ Sub-tasks
**예상 구현 파일**: 50개+ (handlers, components, tests, data, Java CLI)
**예상 테스트**: 500+ 단위 테스트

**실행 순서**: 1.0 → 2.0 → 3.0 → 4.0 → 5.0 → 6.0 → 7.0
- **Task 6.0 (Jasypt)**은 4.0, 5.0과 병렬 처리 가능 (독립적 구조)
- **Task 7.0 (최종 통합)**은 모든 작업 완료 후 실행

**병렬 처리 가능**: 2.0, 3.0, 4.0, 5.0, 6.0의 일부 Sub-tasks는 병렬 가능

**특별 요구사항** (Task 6.0 - Jasypt):
- Java 11+ 설치 필요
- Maven 빌드 환경 필요
- Jasypt + Bouncy Castle 라이브러리

**문서 버전**: 2.0
**최종 업데이트**: 2025-11-21
**상태**: 준비 완료 (Jasypt 도구 추가)
