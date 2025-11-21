# PRD: Jasypt 암호화/복호화 도구

## 1. Introduction/Overview

Spring Boot 프로젝트에서 `application.yml` 파일에 저장된 민감정보(데이터베이스 비밀번호, API 키 등)는 Jasypt 라이브러리를 사용하여 암호화됩니다. 개발자들은 로컬 환경 설정 시 암호화된 값을 복호화하거나, 새로운 민감정보를 암호화해야 하는 경우가 빈번합니다.

현재는 외부 웹사이트를 사용하거나 별도의 Java 코드를 실행해야 하는데, 이는 다음과 같은 문제가 있습니다:
- **보안 위험**: 사내 민감정보를 외부 사이트에 입력하는 것은 보안 정책 위반
- **생산성 저하**: 매번 Java 코드를 작성하거나 실행하는 번거로움
- **일관성 부족**: 팀원마다 다른 방법 사용으로 혼란 발생

본 도구는 브라우저 기반 웹 애플리케이션으로, 팀 전체가 안전하고 편리하게 Jasypt 암호화/복호화를 수행할 수 있도록 지원합니다.

## 2. Goals

1. **보안 강화**: 민감정보를 외부 네트워크에 노출하지 않고 로컬에서 안전하게 처리
2. **생산성 향상**: 클릭 몇 번으로 암호화/복호화 수행, 평균 처리 시간 5초 이내
3. **팀 표준화**: 모든 팀원(Backend, Frontend, DevOps)이 동일한 도구 사용
4. **사용 편의성**: 기술적 배경이 없는 팀원도 쉽게 사용 가능한 직관적인 UI
5. **설정 유연성**: 프로젝트별로 다른 암호화 설정을 지원

## 3. User Stories

### 우선순위 1: 복호화 (최우선)
- **US-01**: Backend 개발자로서, `application.yml`에 있는 `ENC(암호화된텍스트)`를 복호화하여 실제 데이터베이스 비밀번호를 확인하고 싶다.
- **US-02**: DevOps 엔지니어로서, 운영 서버 설정 파일의 암호화된 API 키를 복호화하여 외부 서비스 연동 문제를 디버깅하고 싶다.
- **US-03**: 신입 개발자로서, 로컬 개발 환경 설정 시 암호화된 Redis 비밀번호를 복호화하여 설정하고 싶다.

### 우선순위 2: 암호화
- **US-04**: Backend 개발자로서, 새로운 데이터베이스 비밀번호를 Jasypt로 암호화하여 `application.yml`에 안전하게 저장하고 싶다.
- **US-05**: 보안 담당자로서, 기존 평문 비밀번호를 암호화된 형태로 교체하여 보안 정책을 준수하고 싶다.

### 우선순위 3: 고급 설정
- **US-06**: 시니어 개발자로서, 프로젝트마다 다른 암호화 알고리즘(AES-256-CBC, HMACSHA512 등)을 선택하여 사용하고 싶다.
- **US-07**: Backend 개발자로서, 출력 형식(Hexadecimal/Base64)을 변경하여 프로젝트 요구사항에 맞게 암호화하고 싶다.

### 우선순위 4: 프로젝트 프리셋 (향후 고려)
- **US-08**: 여러 프로젝트를 담당하는 개발자로서, 프로젝트별 설정을 저장해두고 빠르게 전환하고 싶다.

## 4. Functional Requirements

### 4.1 핵심 기능 (Phase 1)

**FR-01**: 시스템은 사용자로부터 다음 입력을 받아야 한다:
- Secret Key (Password) - 필수
- Target Text (암호화/복호화 대상 텍스트) - 필수

**FR-02**: 시스템은 [Decrypt] 버튼 클릭 시 입력된 암호화 텍스트를 복호화하여 원문을 표시해야 한다.

**FR-03**: 시스템은 [Encrypt] 버튼 클릭 시 입력된 원문 텍스트를 암호화하여 암호화된 문자열을 표시해야 한다.

**FR-04**: 시스템은 `ENC(암호화된텍스트)` 형식의 입력을 자동으로 감지하여 `ENC()` 부분을 제거하고 순수 암호화 문자열만 처리해야 한다.

**FR-05**: 시스템은 결과 영역에 [복사] 버튼을 제공하여 클릭 시 결과를 클립보드에 복사해야 한다.

### 4.2 고급 설정 (Collapsible)

**FR-06**: 시스템은 "고급 설정" 영역을 접이식(Collapsible)으로 제공하여 기본적으로 숨겨두고 필요시 펼칠 수 있어야 한다.

**FR-07**: 시스템은 다음 고급 설정 항목을 제공해야 한다:
- **Algorithm** (Select):
  - `PBEWithSHA256And128BitAES-CBC-BC` (기본값)
  - `PBEWithMD5AndDES` (Legacy)
  - `PBEWithHMACSHA512AndAES_256`
- **Output Type** (Select):
  - `hexadecimal` (기본값)
  - `base64`
- **Pool Size** (Input):
  - 기본값: 1
  - 범위: 1-10
- **Provider** (Select):
  - `BouncyCastle` (기본값)
  - `SunJCE`

**FR-08**: 고급 설정의 기본값은 사내에서 가장 많이 사용하는 설정으로 지정되어야 한다.

### 4.3 설정 저장 및 복원

**FR-09**: 시스템은 사용자가 입력한 설정(Secret Key, Algorithm, Output Type, Pool Size)을 브라우저의 LocalStorage에 자동 저장해야 한다.

**FR-10**: 시스템은 페이지 로드 시 LocalStorage에서 저장된 설정을 자동으로 불러와 입력 필드에 복원해야 한다.

**FR-11**: 시스템은 보안을 위해 Secret Key 저장 여부를 사용자가 선택할 수 있어야 한다 (선택 사항: 보안 정책에 따라 저장하지 않을 수도 있음).

### 4.4 에러 처리

**FR-12**: 시스템은 필수 입력 항목(Secret Key, Target Text)이 비어있을 경우 "입력값을 확인해주세요" 에러 메시지를 표시해야 한다.

**FR-13**: 시스템은 복호화 실패 시 다음과 같은 상세 에러 메시지를 표시해야 한다:
- "복호화 실패: Secret Key가 일치하지 않습니다"
- "복호화 실패: 알고리즘이 일치하지 않습니다"
- "복호화 실패: 입력 형식이 올바르지 않습니다"

**FR-14**: 시스템은 암호화 실패 시 "암호화 중 오류가 발생했습니다. 입력값을 확인해주세요" 메시지를 표시해야 한다.

**FR-15**: 시스템은 에러 발생 시 Toast 알림으로 사용자에게 즉각적인 피드백을 제공해야 한다.

### 4.5 사용자 경험

**FR-16**: 시스템은 암호화/복호화 성공 시 "처리 완료!" Toast 알림을 표시해야 한다.

**FR-17**: 시스템은 복사 버튼 클릭 시 "클립보드에 복사되었습니다" Toast 알림을 표시해야 한다.

**FR-18**: 시스템은 처리 중(Java CLI 실행 중) 로딩 인디케이터를 표시하여 진행 상황을 알려야 한다.

**FR-19**: 시스템은 Shadcn UI 컴포넌트를 사용하여 일관된 디자인을 유지해야 한다.

## 5. Non-Goals (Out of Scope)

**NG-01**: 프로젝트 프리셋 기능 (여러 프로젝트 설정 저장/불러오기) - Phase 2에서 고려

**NG-02**: JDBC URL 자동 조립 기능 - 향후 추가 고려

**NG-03**: 배치 처리 (여러 개의 텍스트를 한 번에 암호화/복호화)

**NG-04**: 암호화 이력 관리 (과거 암호화/복호화 기록 저장)

**NG-05**: 팀원 간 설정 공유 기능 (클라우드 동기화)

**NG-06**: 다른 암호화 라이브러리 지원 (현재는 Jasypt만 지원)

**NG-07**: 파일 업로드를 통한 `application.yml` 직접 처리

## 6. Design Considerations

### 6.1 UI 구조

```
┌─────────────────────────────────────────┐
│  Jasypt Encryptor/Decryptor             │
├─────────────────────────────────────────┤
│  [Secret Key (Password)]                │
│  **********************                  │
│                                          │
│  [Target Text]                           │
│  ENC(A1B2C3...) or Plain Text           │
│                                          │
│  ▼ 고급 설정 (Algorithm, PoolSize 등)   │
│  ├─ [Algorithm: AES-256-CBC (BC)]       │
│  ├─ [Output Type: Hexadecimal]          │
│  └─ [Pool Size: 1]                      │
│                                          │
│  [Decrypt]  [Encrypt]                   │
│                                          │
│  ┌─ Result (Click to copy) ────────┐   │
│  │  복호화된텍스트 또는 암호화텍스트 │   │
│  │  [복사]                            │   │
│  └────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 6.2 컴포넌트 사용

- **Card**: 전체 도구를 감싸는 컨테이너
- **Input**: Secret Key, Target Text, Pool Size 입력
- **Select**: Algorithm, Output Type, Provider 선택
- **Collapsible**: 고급 설정 접기/펼치기
- **Button**: Decrypt, Encrypt, 복사 버튼
- **Alert**: 에러 메시지 표시
- **Toast** (Sonner): 성공/실패 알림

### 6.3 반응형 디자인

- 최대 너비: `max-w-xl` (640px)
- 모바일에서도 사용 가능하도록 터치 친화적 버튼 크기
- 고급 설정은 2열 그리드 (모바일에서는 1열)

## 7. Technical Considerations

### 7.1 아키텍처

**Hybrid Approach**: 브라우저 UI + Node.js API + Java CLI

```
[React Component]
       ↓
[Next.js API Route (/api/jasypt)]
       ↓
[child_process → GenericJasypt.jar]
       ↓
[Jasypt Library + BouncyCastle]
```

**이유**:
- Jasypt의 특정 알고리즘(PBEWithSHA256And128BitAES-CBC-BC)을 순수 JavaScript로 구현하기 어려움
- Salt 생성, Iteration, Padding 등의 세부 구현이 Java 라이브러리와 정확히 일치해야 함
- 기존 Spring Boot 프로젝트의 Java 환경을 재사용하는 것이 가장 안정적

### 7.2 Java CLI 도구

**파일**: `resources/GenericJasypt.jar`

**입력**:
```
java -jar GenericJasypt.jar [mode] [text] [password] [algorithm] [outputType] [poolSize]
```

**출력**:
- 성공: 복호화된 텍스트 또는 암호화된 텍스트 (stdout)
- 실패: 에러 메시지 (stderr)

### 7.3 API Route

**엔드포인트**: `POST /api/jasypt`

**요청 본문**:
```json
{
  "mode": "encrypt" | "decrypt",
  "text": "입력 텍스트",
  "password": "Secret Key",
  "algorithm": "PBEWithSHA256And128BitAES-CBC-BC",
  "outputType": "hexadecimal",
  "poolSize": "1"
}
```

**응답**:
- 성공 (200):
  ```json
  {
    "result": "처리된 텍스트"
  }
  ```
- 실패 (500):
  ```json
  {
    "error": "에러 메시지"
  }
  ```

### 7.4 보안 고려사항

**SEC-01**: 모든 암호화/복호화 처리는 사용자의 로컬 환경에서만 수행되어야 한다.

**SEC-02**: Secret Key는 API 요청 시에만 전달되고 서버에 저장되지 않아야 한다.

**SEC-03**: LocalStorage에 Secret Key를 저장할 경우 사용자에게 보안 위험을 경고해야 한다 (선택 사항).

**SEC-04**: HTTPS 환경에서만 사용하도록 권장한다 (프로덕션 배포 시).

### 7.5 의존성

**Frontend**:
- React 19.2.0
- Next.js 16.0.3
- Shadcn UI
- Sonner (Toast)
- Lucide React (아이콘: Settings2, ChevronDown)

**Backend**:
- Node.js (child_process)

**Java**:
- Jasypt 1.9.3+
- Bouncy Castle Provider

## 8. Success Metrics

**SM-01**: 팀원들의 "비밀번호 뭐였죠?" 질문 횟수가 월 평균 50% 이상 감소

**SM-02**: 로컬 환경 설정 시간이 평균 10분에서 5분 이하로 단축

**SM-03**: 도구 사용률 - 팀원의 80% 이상이 주 1회 이상 사용

**SM-04**: 복호화 성공률 - 95% 이상 (올바른 Secret Key 입력 시)

**SM-05**: 사용자 만족도 - 설문조사 기준 5점 만점에 4점 이상

**SM-06**: 외부 사이트(jwt.io 등) 사용 건수 0건 (보안 정책 준수율 100%)

## 9. Open Questions

**OQ-01**: Secret Key의 LocalStorage 저장 정책은 보안팀 승인이 필요한가?
- **제안**: 기본적으로 저장하되, 사용자가 "저장 안 함" 옵션 선택 가능

**OQ-02**: 사내에서 가장 많이 사용하는 Jasypt 알고리즘은 무엇인가?
- **현재 가정**: `PBEWithSHA256And128BitAES-CBC-BC` (ext_spec.md 기준)
- **조치 필요**: 실제 프로젝트 조사 후 기본값 확정

**OQ-03**: Java CLI 도구(GenericJasypt.jar)는 누가 개발하고 유지보수하나?
- **제안**: Backend 팀과 협업하여 개발, 프로젝트 리포지토리에 포함

**OQ-04**: 프로젝트 프리셋 기능의 우선순위는 언제 재평가하나?
- **제안**: Phase 1 완료 후 사용자 피드백을 바탕으로 Phase 2 계획

**OQ-05**: 여러 팀이 사용할 경우 팀별 설정 분리가 필요한가?
- **현재**: 개인별 LocalStorage 사용 (팀 공유 기능 없음)
- **향후**: 필요시 팀 프리셋 공유 기능 검토

**OQ-06**: Java가 설치되지 않은 환경(순수 프론트엔드 개발자)에서는 어떻게 사용하나?
- **제안**: 사전 요구사항 문서 제공, 또는 Docker 컨테이너 제공 고려

---

## Appendix: 구현 체크리스트

### Phase 1: 핵심 기능 (2주)
- [ ] Java CLI 도구 개발 (GenericJasypt.jar)
- [ ] Next.js API Route 구현 (/api/jasypt)
- [ ] React 컴포넌트 UI 구현
  - [ ] 기본 입력 폼 (Secret Key, Target Text)
  - [ ] 고급 설정 (Collapsible)
  - [ ] 결과 표시 및 복사 기능
- [ ] LocalStorage 설정 저장/복원
- [ ] 에러 처리 및 Toast 알림
- [ ] 단위 테스트 작성
- [ ] 브라우저 테스트 (Chrome, Edge, Firefox)

### Phase 2: 향후 개선 (검토 필요)
- [ ] 프로젝트 프리셋 기능
- [ ] JDBC URL 자동 조립
- [ ] 배치 처리
- [ ] 암호화 이력 관리

---

**문서 버전**: 1.0
**작성일**: 2025-11-21
**작성자**: Claude (AI Assistant)
**승인 대기**: Product Owner, Backend Lead, Security Team
