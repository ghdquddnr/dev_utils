# PRD: Java Class ↔ JSON 변환기

**작성일**: 2025-11-21
**상태**: 준비 완료

---

## 📋 개요

Java의 Class/DTO 정의와 JSON 표현 사이를 양방향으로 변환하는 도구입니다. 프론트엔드 개발자가 백엔드 API 스펙을 이해하거나, 백엔드 개발자가 프론트엔드 요청을 분석할 때 유용합니다. 특히 `CamelCase`(Java)와 `snake_case`(JSON/DB) 간 자동 변환 옵션이 핵심 기능입니다.

---

## 🎯 목표

1. Java Class 정의를 보고 JSON 예시 데이터 자동 생성
2. JSON 데이터를 분석하여 Java Class/DTO 구조 자동 생성
3. CamelCase ↔ snake_case 자동 변환으로 네이밍 컨벤션 일치
4. 모든 변환이 클라이언트 사이드에서만 처리 (보안)
5. 복사 기능으로 개발 생산성 향상

---

## 👥 사용자 스토리

**AS A** 프론트엔드 개발자
**I WANT TO** 백엔드 API 응답 형식을 빠르게 이해하기 위해 Java DTO를 JSON으로 변환
**SO THAT** 더 빠르게 API 연동을 시작할 수 있습니다.

**AS A** 백엔드 개발자
**I WANT TO** 프론트엔드로부터 받은 JSON 샘플을 보고 Java DTO를 자동 생성
**SO THAT** 반복적인 보일러플레이트 코드를 줄일 수 있습니다.

**AS A** 팀 리더
**I WANT TO** Java CamelCase와 JSON snake_case 간의 변환을 자동화
**SO THAT** 팀 내 네이밍 컨벤션 불일치로 인한 버그를 줄일 수 있습니다.

---

## ✅ 기능 요구사항

### 2.1 Java Class → JSON 변환

1. **입력**: Java Class 정의 (타입 명시)
   ```java
   public class User {
       private String userName;
       private int userAge;
       private boolean isActive;
       private LocalDateTime createdAt;
   }
   ```

2. **기능**:
   - Java 클래스 문법 파싱
   - 타입별 기본값 예시 생성 (String → "", int → 0, boolean → false 등)
   - Nested 클래스/배열 처리
   - 네이밍 변환 옵션:
     - CamelCase 유지 (그대로)
     - snake_case로 변환 (user_name)

3. **출력**: 예시 JSON 데이터
   ```json
   {
     "userName": "John Doe",
     "userAge": 30,
     "isActive": true,
     "createdAt": "2025-11-21T10:30:00"
   }
   ```
   또는 (snake_case 옵션)
   ```json
   {
     "user_name": "John Doe",
     "user_age": 30,
     "is_active": true,
     "created_at": "2025-11-21T10:30:00"
   }
   ```

### 2.2 JSON → Java Class 변환

1. **입력**: JSON 샘플 데이터
   ```json
   {
     "userId": 123,
     "userName": "alice",
     "tags": ["admin", "user"]
   }
   ```

2. **기능**:
   - JSON 구조 분석
   - 타입 자동 추론 (string, number, boolean, array, object)
   - Nested 객체를 inner class로 변환 (선택)
   - 네이밍 변환 옵션:
     - 그대로 사용
     - CamelCase로 변환 (user_id → userId)

3. **출력**: Java DTO 클래스 템플릿
   ```java
   public class Data {
       private int userId;
       private String userName;
       private List<String> tags;

       // Getters/Setters (또는 @Getter @Setter Lombok)
   }
   ```

### 2.3 옵션 및 설정

- **네이밍 변환**:
  - ☐ CamelCase 유지
  - ☐ snake_case로 변환
  - ☐ 양방향 동시 표시

- **Java 프레임워크 지원** (선택사항):
  - Jackson 어노테이션 (@JsonProperty)
  - Lombok 어노테이션 (@Getter, @Setter, @Data)
  - Plain POJO

- **Array/Collection 처리**:
  - List<String> vs String[]
  - Set<T>, Map<K,V> 등

### 2.4 UI/UX

- **좌측**: Java Class 입력 (Textarea)
- **우측**: JSON 출력 (Card)
- **탭 전환**: Java→JSON, JSON→Java
- **버튼**:
  - "변환" 또는 자동 실시간 변환
  - "복사"
  - "초기화"
  - "예제 로드"

- **에러 표시**:
  - 문법 오류 (Java/JSON)
  - 타입 추론 실패
  - 지원하지 않는 타입

---

## 📌 비포함 항목 (Out of Scope)

- 실제 Java 컴파일 또는 검증
- 서명 검증 (serialVersionUID 등)
- Generic 타입의 완전한 지원 (제한적 지원)
- Spring/JPA 어노테이션 완전 변환
- 상속 구조 (extends/implements)
- Maven/Gradle 설정 생성

---

## 🎨 디자인 고려사항

- Shadcn Tabs로 Java→JSON, JSON→Java 탭 구분
- Card 컴포넌트로 결과 표시
- 문법 강조 (Syntax Highlighting) - 선택사항
- 반응형 레이아웃 (모바일 대응)

---

## 🔧 기술 고려사항

### 구현 방식

1. **파싱 라이브러리**:
   - Java 클래스: 정규식 기반 문법 파싱
   - JSON: 기본 JSON.parse() 활용

2. **타입 매핑**:
   ```
   Java → JSON:
   - String → string
   - int/Integer/long/Long → number
   - boolean → boolean
   - LocalDateTime/Date → string (ISO 8601)
   - List<T>/T[] → array
   - Map<K,V> → object

   JSON → Java:
   - string → String
   - number → int, long, double 중 최적 선택
   - boolean → boolean
   - array → List<T>
   - object → class
   ```

3. **네이밍 변환 알고리즘**:
   - CamelCase → snake_case: `userName` → `user_name`
   - snake_case → CamelCase: `user_name` → `userName`

4. **클라이언트 사이드 처리**:
   - 모든 로직은 브라우저에서 실행
   - 서버로 데이터 전송 금지
   - `"use client"` 지시어 필수

5. **의존성**:
   - 추가 라이브러리 최소화
   - 필요시: `lodash` (카멜케이스 변환)

---

## 📊 성공 메트릭

1. **기능 완성도**: Java/JSON 양방향 변환 100% 동작
2. **정확도**: 일반적인 DTO 구조 95% 이상 정확하게 변환
3. **사용성**: 예제 3개 이상 포함, 1분 내 첫 변환 가능
4. **네이밍 변환**: CamelCase ↔ snake_case 100% 정확한 변환
5. **에러 처리**: 문법 오류 시 구체적 메시지 표시

---

## 🤔 미해결 질문

1. Generic 타입 (List<Map<String, List<User>>>) 지원 깊이는?
2. Spring @Entity, @JsonProperty 같은 어노테이션 자동 인식할까?
3. Nested DTO를 별도 파일로 분리할까, 아니면 inner class로?
4. 변수명 자동 추론 시 예시값 커스터마이징 가능할까?

---

**문서 버전**: 1.0
**마지막 수정**: 2025-11-21
