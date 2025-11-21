# PRD: YAML ↔ Properties 변환기

**작성일**: 2025-11-21
**상태**: 준비 완료

---

## 📋 개요

Spring Boot의 설정 파일 형식인 `application.yml`과 `application.properties` 사이를 양방향으로 변환하는 도구입니다. Spring Boot 개발 시 설정 파일 형식을 자주 변경해야 할 때, 온라인 도구를 쓰지 않고 로컬에서 보안을 유지하며 변환할 수 있습니다.

---

## 🎯 목표

1. YAML 형식을 Properties 형식으로 변환
2. Properties 형식을 YAML로 변환
3. 네스팅된 구조 정확하게 변환 (`spring.datasource.url` ↔ YAML 계층)
4. 환경변수, 주석, 특수문자 올바르게 처리
5. 민감한 설정정보(비밀번호, API 키)를 브라우저에서만 처리

---

## 👥 사용자 스토리

**AS A** Spring Boot 개발자
**I WANT TO** `application.yml`을 `application.properties`로 변환
**SO THAT** 팀의 설정 파일 형식을 통일하거나 쉽게 마이그레이션할 수 있습니다.

**AS A** DevOps 엔지니어
**I WANT TO** 프로덕션 설정을 보안을 유지한 채 로컬에서 변환
**SO THAT** 민감한 정보를 외부 웹사이트에 노출하지 않을 수 있습니다.

**AS A** 팀 리더
**I WANT TO** YAML과 Properties 형식을 자동으로 동기화
**SO THAT** 양쪽 파일이 항상 같은 설정값을 반영합니다.

---

## ✅ 기능 요구사항

### 3.1 YAML → Properties 변환

1. **입력**: YAML 형식 설정 파일
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/mydb
       username: root
       password: secret123
     jpa:
       hibernate:
         ddl-auto: update
       show-sql: true
   logging:
     level:
       root: INFO
       com.example: DEBUG
   ```

2. **기능**:
   - 계층 구조를 점(`.`)으로 연결된 키로 변환
   - 리스트/배열 처리: `[0]`, `[1]` 인덱싱
   - 주석 보존 (또는 제거 옵션)
   - 빈 값 처리
   - 특수 문자 이스케이핑

3. **출력**: Properties 형식
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/mydb
   spring.datasource.username=root
   spring.datasource.password=secret123
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true
   logging.level.root=INFO
   logging.level.com.example=DEBUG
   ```

### 3.2 Properties → YAML 변환

1. **입력**: Properties 형식 설정 파일
   ```properties
   server.port=8080
   server.servlet.context-path=/api
   spring.datasource.url=jdbc:mysql://localhost/db
   ```

2. **기능**:
   - 점(`.`)으로 분리된 키를 YAML 계층으로 변환
   - 인덱싱된 배열을 리스트로 변환
   - 주석 보존
   - 들여쓰기 스타일 설정 가능 (2칸 또는 4칸)

3. **출력**: YAML 형식
   ```yaml
   server:
     port: 8080
     servlet:
       context-path: /api
   spring:
     datasource:
       url: jdbc:mysql://localhost/db
   ```

### 3.3 특수 처리

#### 리스트/배열 처리

**YAML** (여러 형식 지원):
```yaml
items:
  - item1
  - item2
# 또는
items: [item1, item2]
```

**Properties**:
```properties
items[0]=item1
items[1]=item2
```

변환 규칙:
- YAML의 `-` 리스트 → `[n]` 인덱싱
- Properties의 `[n]` → YAML의 `-` 리스트

#### 특수 문자 처리
- 따옴표로 감싼 문자열 보존
- 이스케이프 문자 (`\n`, `\t` 등) 유지
- URL, 경로에서 특수문자 올바르게 처리

#### 주석 처리
- YAML: `#` 주석 보존 (옵션)
- Properties: `#` 또는 `!` 주석 보존 (옵션)

### 3.4 UI/UX

- **좌측 입력**: YAML 또는 Properties (Textarea)
- **우측 출력**: 변환된 형식 (Card)
- **탭 전환**: YAML→Properties, Properties→YAML
- **옵션 패널**:
  - ☐ 주석 포함
  - ☐ 들여쓰기 스타일 (2칸 vs 4칸)
  - ☐ 정렬 (알파벳 순)

- **버튼**:
  - "변환" (자동 또는 클릭)
  - "복사"
  - "초기화"
  - "예제 로드" (Spring Boot 기본 설정)

- **에러 표시**:
  - YAML 문법 오류
  - 중복 키 감지
  - 변환 불가능한 구조 경고

---

## 📌 비포함 항목 (Out of Scope)

- Spring Boot 프로파일 전환 (application-dev.yml 등)
- 환경변수 주입 (${...} 평가 안함)
- 암호화된 설정값 복호화
- 설정값 유효성 검증 (Spring Boot 검증 엔진)
- YAML 1.2 고급 기능 (마크 앵커, 별칭 등)

---

## 🎨 디자인 고려사항

- Shadcn Tabs로 양방향 변환 탭 구분
- 문법 강조 (Syntax Highlighting) - YAML/Properties 구분
- 계층 구조 시각화 (트리 뷰) - 선택사항
- 반응형 레이아웃

---

## 🔧 기술 고려사항

### 구현 라이브러리

1. **YAML 파싱**: `js-yaml` 라이브러리
   ```js
   import YAML from 'js-yaml';
   const data = YAML.load(yamlString);
   ```

2. **Properties 파싱**: 정규식 기반 커스텀 파서
   ```js
   // key=value 형식 파싱
   const regex = /^([^=]+)=(.*)$/
   ```

3. **데이터 변환**:
   - YAML → Plain Object (js-yaml)
   - Object → Properties (커스텀 함수)
   - Properties → Object (정규식 파싱)
   - Object → YAML (js-yaml dump)

### 변환 알고리즘

```typescript
// Properties → YAML
function propertiesToYaml(props: string): string {
  const obj = {};
  props.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    const parts = key.split('.');
    setNestedValue(obj, parts, value);
  });
  return YAML.dump(obj);
}

// YAML → Properties
function yamlToProperties(yaml: string): string {
  const obj = YAML.load(yaml);
  return flattenObject(obj)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
}
```

### 클라이언트 사이드 처리

- 모든 변환은 브라우저에서만 실행
- 서버 통신 없음
- `"use client"` 지시어 필수

---

## 📊 성공 메트릭

1. **변환 정확도**: Spring Boot 표준 설정 95% 이상 정확
2. **기능 완성도**: 양방향 변환 모두 동작
3. **특수 케이스 처리**: 리스트, 주석, 특수문자 올바르게 처리
4. **에러 메시지**: 변환 실패 시 구체적 원인 안내
5. **성능**: 1000줄 이상 설정도 1초 이내 변환

---

## 🤔 미해결 질문

1. 환경변수 참조 (`${...}`) 어떻게 처리할까?
2. 다중 프로파일 설정 (application-{profile}.yml) 지원할까?
3. YAML Anchor와 Alias 지원 수준은?
4. 숫자값의 타입 추론 (int vs string) 어떻게 처리할까?

---

**문서 버전**: 1.0
**마지막 수정**: 2025-11-21
