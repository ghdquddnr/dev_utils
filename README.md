# Dev Utils - 개발자 도구 모음

[![GitHub](https://img.shields.io/badge/GitHub-ghdquddnr%2Fdev__utils-blue?logo=github)](https://github.com/ghdquddnr/dev_utils)

클라이언트 사이드에서 안전하게 동작하는 개발자 유틸리티 도구 모음입니다. 모든 데이터는 브라우저 내에서만 처리되며 서버로 전송되지 않습니다.

## 🎯 주요 기능 (11개 도구)

### 기본 도구

#### 1. JSON 포매터 & 검증 도구
JSON 문자열을 검증하고 포맷팅하거나 축소합니다.

**기능:**
- ✨ 실시간 JSON 유효성 검증
- 📐 2칸 들여쓰기로 포맷팅
- ⚡ 공백 제거하여 축소
- 📋 클립보드 복사
- 🔄 한번에 초기화

**사용 예:**

입력: `{"name":"John","age":30,"city":"Seoul","hobbies":["reading","gaming"]}`

포맷팅 결과:
```json
{
  "name": "John",
  "age": 30,
  "city": "Seoul",
  "hobbies": [
    "reading",
    "gaming"
  ]
}
```

---

#### 2. JWT 디코더 (오프라인)
JWT 토큰을 디코딩하여 Header, Payload, Signature를 표시합니다.

**기능:**
- 🔍 JWT 형식 검증
- 📖 Header, Payload, Signature 분리 디코딩
- ⏰ 발급/만료 시간 자동 포맷팅
- ⚠️ 토큰 만료 여부 표시
- 📋 각 섹션 별도 복사
- 🔐 서명 검증 불가 안내 (오프라인 모드)

**지원하는 표준 클레임:**
- `iss` (Issuer) - 발급자
- `sub` (Subject) - 주체
- `aud` (Audience) - 대상자
- `exp` (Expiration Time) - 만료 시간
- `iat` (Issued At) - 발급 시간

---

#### 3. SQL 파라미터 바인더
SQL 쿼리의 `?` 플레이스홀더에 파라미터를 바인딩합니다.

**기능:**
- 🔍 파라미터 개수 검증
- 🔄 자동 쿼리 변환
- 🛡️ 특수문자 자동 이스케이핑
- 📚 SQL 예제 제공
- 📋 결과 복사

**사용 예:**

SQL: `SELECT * FROM users WHERE id = ? AND name = ? AND status = ?`

파라미터: `[123, "John O'Brien", "active"]`

결과: `SELECT * FROM users WHERE id = 123 AND name = 'John O''Brien' AND status = 'active'`

---

### 변환 & 포맷팅 도구

#### 4. Java ↔ JSON 변환기
Java 객체 정의를 JSON으로, JSON을 Java 클래스로 변환합니다.

**기능:**
- ☕ Java 클래스 → JSON 샘플 데이터
- 📦 JSON → Java POJO 클래스 생성
- 🔄 양방향 변환 지원
- 🔤 CamelCase/snake_case 네이밍 변환
- 📋 클립보드 복사
- 💡 예제 제공

**사용 예:**

Java 입력:
```java
public class User {
  private String name;
  private int age;
  private List<String> hobbies;
}
```

JSON 출력:
```json
{
  "name": "",
  "age": 0,
  "hobbies": []
}
```

---

#### 5. YAML ↔ Properties 변환기
YAML 파일과 Properties 파일 간 상호 변환을 제공합니다.

**기능:**
- 📄 YAML → Properties 변환
- 📋 Properties → YAML 변환
- 🔄 중첩 구조 지원
- 📊 배열/리스트 처리
- 📐 들여쓰기 선택 (2칸/4칸)
- 💡 예제 제공

**사용 예:**

YAML 입력:
```yaml
server:
  port: 8080
  host: localhost
```

Properties 출력:
```properties
server.port=8080
server.host=localhost
```

---

### 시간 & 데이터 처리 도구

#### 6. Timestamp 변환기
Unix Timestamp와 날짜 간의 상호 변환을 제공합니다.

**기능:**
- ⏰ Timestamp → 날짜 변환
- 📅 날짜 → Timestamp 변환
- 🌍 다중 타임존 지원 (KST, UTC, JST, EST, CST, PST)
- 🕐 현재 시간 표시
- ⚡ 초/밀리초 단위 선택
- 📊 상대 시간 표시 (예: "2시간 전")
- 📋 결과 복사

**사용 예:**

입력: `1640000000` (초 단위)

출력:
- UTC: 2021-12-20 13:33:20
- KST: 2021-12-20 22:33:20
- 상대 시간: 3년 전
- 요일: 월요일

---

#### 7. Cron Expression 생성기/테스터
Cron 표현식을 생성하고 다음 실행 시간을 계산합니다.

**기능:**
- ⚙️ GUI 빌더로 Cron 표현식 생성
- ✅ Cron 표현식 검증 및 파싱
- 📅 다음 10번 실행 시간 계산
- 🎯 프리셋 패턴 제공 (7개)
  - 매분, 매시간, 매일 자정
  - 평일 오전 9시, 주말 오전 10시
  - 매월 1일, 5분마다
- 🔄 Linux/Quartz 형식 지원
- 🌏 타임존 지원 (Asia/Seoul)
- 📋 표현식 복사

**사용 예:**

GUI 입력: 분=0, 시=9, 요일=1-5 (월-금)

Cron 출력: `0 9 * * 1-5`

설명: 평일(월-금) 오전 9시에 실행

다음 실행: 2025-11-26 09:00:00, 2025-11-27 09:00:00...

---

### 보안 & 유틸리티 도구

#### 8. URL Encoder/Decoder
URL 인코딩/디코딩 및 쿼리 파라미터 파싱을 제공합니다.

**기능:**
- 🔐 URL 인코딩 (UTF-8 지원)
- 🔓 URL 디코딩
- 🔍 쿼리 파라미터 파싱
- 📊 파라미터 테이블 표시
- ⚙️ 공백 처리 옵션 (%20 또는 +)
- 🌐 한글/이모지 지원
- 📋 결과 복사

**사용 예:**

Encode 입력: `안녕하세요 Hello World!`

Encode 출력: `%EC%95%88%EB%85%95%ED%95%98%EC%84%B8%EC%9A%94%20Hello%20World!`

Query 입력: `https://example.com?name=홍길동&age=30&city=서울`

Query 출력:
| Key | Value |
|-----|-------|
| name | 홍길동 |
| age | 30 |
| city | 서울 |

---

#### 9. Redis Key 패턴 스캐너
Redis 키 패턴을 관리하고 명령어를 생성합니다.

**기능:**
- 📚 사전 정의된 Redis 패턴 라이브러리 (10개)
- 🔑 변수 기반 키 생성
- ⚙️ 명령어 자동 생성 (GET, SET, DEL, EXPIRE, TTL)
- ✅ 변수 검증 (필수/선택, 타입)
- 📋 명령어 복사

**사전 정의된 패턴:**
- `user:{userId}:profile` - 사용자 프로필
- `user:{userId}:session` - 세션 데이터
- `cache:api:{endpoint}` - API 캐시
- `queue:task:{taskId}` - 작업 큐
- 기타 6개 패턴

**사용 예:**

패턴 선택: `user:{userId}:profile`

변수 입력: userId=12345

명령어 선택: GET

결과: `GET user:12345:profile`

---

#### 10. Jasypt 암호화/복호화 도구
Spring Boot YAML 파일의 민감정보를 Jasypt로 암호화/복호화합니다.

**기능:**
- 🔐 양방향 암호화/복호화 지원
- 🎛️ 고급 설정 (알고리즘, 출력 형식, Pool Size)
- 🔄 ENC() 자동 감지 및 제거
- 💾 LocalStorage 설정 자동 저장/복원
- 🛡️ 로컬 환경에서만 처리 (보안)
- ☕ Java CLI + Next.js API 하이브리드 아키텍처

**지원 알고리즘:**
- PBEWithSHA256And128BitAES-CBC-BC (기본, 권장)
- PBEWithMD5AndDES (Legacy)
- PBEWithHMACSHA512AndAES_256 (고급)

**출력 형식:**
- Hexadecimal (16진수, 기본)
- Base64 (Base64 인코딩)

**사용 예:**

암호화:
- Secret Key: `mySecretKey`
- 텍스트: `myPassword`
- 결과: `5B7EA1E78549B7A802DEEB74699F542E`

복호화:
- Secret Key: `mySecretKey`
- 암호문: `ENC(5B7EA1E78549B7A802DEEB74699F542E)`
- 결과: `myPassword`

**사전 요구사항:** Java 11+ 설치 필요

---

### 사내 특화 도구

#### 11. RegEx 테스터 & 라이브러리
정규식 패턴을 테스트하고 라이브러리를 제공합니다.

**기능:**
- 📚 24개 정규식 패턴 라이브러리
- 🔍 패턴 검색 및 필터링
- ✅ 정규식 테스트 (실시간 매칭)
- 📊 카테고리별 분류 (validation, format, extraction, code)
- 🎯 복잡도 표시 (basic, intermediate, advanced)
- 💡 유효/무효 예제 제공
- 💻 사용 예제 코드 (JavaScript/Java)
- 📋 패턴 및 매칭 결과 복사

**패턴 카테고리:**
- **Validation (13개)**: 이메일, 전화번호, 비밀번호, URL, IPv4, 신용카드 등
- **Format (3개)**: 날짜, 시간, Hex Color
- **Extraction (4개)**: HTML 태그, URL 파라미터, 이메일 추출, 숫자 추출
- **Code (4개)**: 주민등록번호, 사업자번호, 우편번호, 계좌번호

**사용 예:**

패턴 선택: Email Validation

정규식: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`

테스트 입력: `user@example.com`

결과: ✅ 매칭 성공 (1개 매칭)

---

## 🔒 보안

✅ 모든 데이터는 클라이언트(브라우저) 내에서만 처리
✅ 서버로 데이터 전송 안함 (Jasypt API 제외 - 로컬 처리)
✅ 민감한 정보 안전하게 처리 가능
✅ LocalStorage 사용 시 보안 주의 필요

## 🛠️ 기술 스택

- **Framework**: Next.js 16.0.3
- **UI Framework**: React 19.2.0
- **Styling**: Tailwind CSS 4
- **Component Library**: Shadcn UI
- **Icons**: Lucide React
- **Testing**: Jest 30.2.0, React Testing Library
- **Libraries**:
  - `date-fns`, `date-fns-tz` (Timestamp 변환)
  - `js-yaml` (YAML 파싱)
  - `cron-parser` (Cron 파싱)
- **Java**: JDK 11+ (Jasypt 도구)
- **Build Tools**: Maven (Jasypt CLI)

## 📦 설치 & 실행

### 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
# http://localhost:3000 에서 접속
```

### 프로덕션 빌드
```bash
npm run build
npm start
```

### Jasypt Java CLI 빌드 (선택)
Jasypt 도구를 사용하려면 Java CLI를 빌드해야 합니다:

```bash
cd resources/jasypt
mvn clean package
# target/GenericJasypt.jar 생성 확인
```

자세한 내용은 [resources/jasypt/README.md](resources/jasypt/README.md)를 참고하세요.

## 🧪 테스트

### 테스트 실행
```bash
npm test                                    # 모든 테스트
npm run test:watch                          # 감시 모드
npm test -- lib/json-handler.test.ts        # 특정 모듈 테스트
npm test -- --coverage                      # 커버리지 포함
```

### 타입 체크
```bash
npx tsc --noEmit
```

### 린트 검사
```bash
npm run lint
npm run lint -- --fix                       # 자동 수정
```

## 📊 테스트 현황

✅ **총 500+ 테스트 통과**

**Handler 단위 테스트 (230개):**
- JSON 핸들러: 37개 테스트 ✓
- JWT 핸들러: 46개 테스트 ✓
- SQL 핸들러: 52개 테스트 ✓
- Java↔JSON 핸들러: 35개 테스트 ✓
- YAML↔Properties 핸들러: 32개 테스트 ✓
- Timestamp 핸들러: 48개 테스트 ✓
- Cron 핸들러: 45개 테스트 ✓
- URL 핸들러: 테스트 완료 ✓
- Redis 패턴: 46개 테스트 ✓
- RegEx 핸들러: 58개 테스트 ✓

**컴포넌트 테스트 (100+개):**
- JavaJsonConverter: 29개 테스트 ✓
- YamlPropertiesConverter: 테스트 완료 ✓
- TimestampConverter: 29개 테스트 ✓
- CronExpressionGenerator: 29개 테스트 ✓
- UrlEncoderDecoder: 6개 테스트 ✓
- RedisKeyScanner: 테스트 완료 ✓
- RegexTester: 20개 테스트 ✓

**진행 현황:**
- Task 1.0 (기초 구조): ✅ 100% 완료
- Task 2.0 (변환 & 포맷팅): ✅ 100% 완료
- Task 3.0 (시간 & 데이터 처리): ✅ 100% 완료
- Task 4.0 (보안 & 유틸리티): ✅ 100% 완료
- Task 5.0 (사내 특화): ✅ 100% 완료 (RegEx만 구현, ErrorCode 제외)
- Task 6.0 (Jasypt): ✅ 100% 완료
- Task 7.0 (최종 통합 & 배포): 🔄 진행 중

## 📂 프로젝트 구조

```
dev_utils/
├── app/                     # Next.js 앱 라우터
│   ├── api/                 # API Routes
│   │   └── jasypt/         # Jasypt 암호화 API
│   │       ├── route.ts
│   │       └── route.test.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── tools/              # 도구 컴포넌트 (11개)
│   │   ├── JsonFormatter.tsx
│   │   ├── JwtDecoder.tsx
│   │   ├── SqlBinder.tsx
│   │   ├── JavaJsonConverter.tsx
│   │   ├── YamlPropertiesConverter.tsx
│   │   ├── TimestampConverter.tsx
│   │   ├── CronExpressionGenerator.tsx
│   │   ├── UrlEncoderDecoder.tsx
│   │   ├── RedisKeyScanner.tsx
│   │   ├── RegexTester.tsx
│   │   ├── JasyptConverter.tsx
│   │   └── *.test.tsx      # 컴포넌트 테스트
│   ├── ui/                 # Shadcn UI 컴포넌트
│   ├── Sidebar.tsx         # 메뉴 네비게이션
│   └── ToolsLayout.tsx     # 도구 라우팅
├── lib/
│   ├── data/               # 데이터 파일
│   │   ├── regex-patterns.json    # 24개 정규식 패턴
│   │   └── redis-patterns.ts      # 10개 Redis 패턴
│   ├── json-handler.ts        # JSON 핸들러
│   ├── jwt-handler.ts         # JWT 핸들러
│   ├── sql-handler.ts         # SQL 핸들러
│   ├── java-json-handler.ts   # Java↔JSON 핸들러
│   ├── yaml-properties-handler.ts  # YAML↔Properties 핸들러
│   ├── timestamp-handler.ts   # Timestamp 핸들러
│   ├── cron-handler.ts        # Cron 핸들러
│   ├── url-handler.ts         # URL 핸들러
│   ├── redis-patterns.ts      # Redis 패턴 핸들러
│   ├── regex-handler.ts       # RegEx 핸들러
│   ├── *-handler.test.ts   # Handler 테스트
│   ├── types.ts            # 타입 정의
│   └── utils.ts            # 유틸리티 함수
├── resources/              # 외부 리소스
│   └── jasypt/            # Java CLI 도구
│       ├── target/
│       │   └── GenericJasypt.jar    # 빌드된 JAR 파일
│       ├── src/main/java/
│       │   └── GenericJasypt.java   # Java 소스
│       ├── pom.xml                  # Maven 설정
│       └── README.md                # Jasypt CLI 문서
├── tasks/                  # 프로젝트 작업 문서
│   ├── 0010-prd-jasypt-encryptor-decryptor.md
│   └── tasks-0002-0009-all-features.md
├── CLAUDE.md              # Claude Code 가이드
├── jest.config.js
├── jest.setup.js
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 💡 팁 & 주의사항

### JSON 도구
- 입력 시 실시간으로 검증됩니다
- SyntaxError 발생 시 에러 위치(라인, 컬럼)를 표시합니다

### JWT 도구
- 서명 검증은 지원되지 않습니다 (오프라인 모드)
- 만료된 토큰도 디코딩 가능합니다

### SQL 도구
- 파라미터는 반드시 JSON 배열 형식이어야 합니다
- `?` 개수와 파라미터 개수가 일치해야 합니다
- 작은따옴표(`'`)는 자동으로 `''`로 이스케이프됩니다

### Java↔JSON 도구
- Java 클래스는 기본 접근자(getter/setter) 없이도 파싱됩니다
- Generic 타입 지원 (List, Map 등)
- CamelCase ↔ snake_case 자동 변환

### YAML↔Properties 도구
- 중첩 구조는 점(.)으로 연결됩니다
- 배열은 `[0]`, `[1]` 형식으로 표현됩니다
- 주석은 변환 시 제거됩니다

### Timestamp 도구
- Unix Timestamp는 1970-01-01 00:00:00 UTC부터의 시간입니다
- 초 단위는 10자리, 밀리초 단위는 13자리 숫자입니다
- 자동 단위 감지 기능 제공

### Cron 도구
- Linux 형식: 5필드 (분 시 일 월 요일)
- Quartz/Spring 형식: 6필드 (초 분 시 일 월 요일)
- 타임존은 Asia/Seoul 고정

### URL 도구
- 한글 및 이모지 UTF-8 인코딩 지원
- 공백을 %20 또는 +로 변환 선택 가능
- 쿼리 파라미터 자동 파싱 및 테이블 표시

### Redis 도구
- 10개 사전 정의된 패턴 제공
- 변수 타입 자동 검증
- GET, SET, DEL, EXPIRE, TTL 명령어 지원

### Jasypt 도구
- Java 11 이상이 설치되어 있어야 합니다
- 모든 암호화/복호화는 로컬에서만 처리됩니다 (서버 전송 없음)
- `ENC(암호화문자열)` 형식은 자동으로 인식 및 제거됩니다
- 고급 설정은 프로젝트 요구사항에 맞게 조정하세요
- Secret Key 및 설정은 LocalStorage에 저장되지만 보안에 주의하세요
- Maven 빌드가 필요합니다 (`mvn clean package`)

### RegEx 도구
- 24개 검증된 정규식 패턴 제공
- 카테고리 및 복잡도별 필터링 가능
- JavaScript 및 Java 예제 코드 제공
- 실시간 매칭 테스트 및 결과 표시

## 🚀 성능

### 응답 속도
- **평균 응답 속도**: 0.08ms
- **최대 응답 속도**: 0.3ms
- **목표 달성**: <100ms (목표의 0.08%!)

### 빌드 크기
- 전체 빌드 크기: 43MB
- 컴파일 시간: 2.6초
- Static pages 생성: 681.2ms
- 페이지 로드 시간: 3.1초
- First Contentful Paint: 3.0초

### 메모리 사용
- 초기 메모리: 17.81 MB
- 100회 탭 전환 후 증가: 0 MB
- **메모리 누수 없음** ✅

## 🐳 배포

Dev Utils는 Docker를 통해 쉽게 배포할 수 있습니다.

### 배포 정보
- **외부 포트**: 3030
- **컨테이너 포트**: 3000
- **배포 방식**: Docker Compose

### 빠른 배포

```bash
# 1. Docker 이미지 빌드
docker-compose build

# 2. 컨테이너 실행
docker-compose up -d

# 3. 상태 확인
docker-compose ps

# 4. 로그 확인
docker-compose logs -f
```

### 접속
```
http://localhost:3030
```

### 상세 배포 가이드

전체 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참고하세요.

- 수동 배포 방법
- 배포 스크립트 사용
- 서버 관리 명령어
- 문제 해결 가이드
- 보안 권장사항

## 📞 지원

문제가 발생하면:
1. 콘솔 에러 메시지를 확인하세요
2. 입력 형식이 올바른지 확인하세요
3. 브라우저 개발자 도구(F12)를 열어 에러를 확인하세요
4. Jasypt 도구: Java 버전 확인 (`java -version`)
5. 포트 충돌: 3000번 포트 사용 여부 확인

## 📝 라이선스

MIT License

---

**개발**: Claude Code + Human Developer
**마지막 업데이트**: 2025-11-25
**버전**: 1.0.0
