# PRD: Cron Expression 생성기/테스터

**작성일**: 2025-11-21
**상태**: 준비 완료

---

## 📋 개요

Spring Scheduler, Quartz, Linux Cron, Python Celery Beat 등에서 사용하는 Cron 표현식을 GUI로 쉽게 생성하고 테스트하는 도구입니다. 복잡한 Cron 문법(`0 0/5 * * * ?`)을 직관적인 인터페이스로 변환할 수 있으며, 다음 실행 예정 시간을 미리 확인할 수 있습니다.

---

## 🎯 목표

1. GUI 선택으로 Cron Expression 자동 생성
2. Cron 표현식을 사람이 읽을 수 있는 형식으로 설명
3. 다음 10개 실행 예정 시간 표시
4. 다양한 Cron 표기법 지원 (Linux, Quartz, Spring)
5. 자동으로 서버 시간대 반영

---

## 👥 사용자 스토리

**AS A** Spring Boot 개발자
**I WANT TO** GUI로 스케줄을 선택해 Cron 표현식 자동 생성
**SO THAT** 복잡한 Cron 문법을 외우지 않아도 됩니다.

**AS A** DevOps 엔지니어
**I WANT TO** Cron 표현식의 다음 실행 시간을 확인
**SO THAT** 스케줄링 설정이 올바른지 검증할 수 있습니다.

**AS A** 팀 리더
**I WANT TO** 팀원들이 Cron 표현식을 쉽게 이해하도록 도움
**SO THAT** 스케줄 설정 실수를 줄일 수 있습니다.

---

## ✅ 기능 요구사항

### 5.1 GUI Cron 생성기

1. **선택 인터페이스**:
   - **분 (Minute)**: 0-59 드롭다운 또는 매 N분
   - **시 (Hour)**: 0-23 드롭다운 또는 매 N시간
   - **일 (Day of Month)**: 1-31 드롭다운 또는 매 N일
   - **월 (Month)**: JAN-DEC 또는 숫자 드롭다운
   - **요일 (Day of Week)**: MON-SUN 드롭다운
   - **초 (Second)** - Spring Quartz용 (선택사항)

2. **사전 설정 (Quick Presets)**:
   ```
   - 매 분 (매 1분)
   - 매 시간 (정각)
   - 매일 자정
   - 매일 오전 6시
   - 매주 월요일 9시
   - 매월 1일 0시
   - 평일(월-금) 18시
   - 업무 시간마다 (9-17시)
   ```

3. **표현식 생성**:
   - 선택사항 → Cron 문자열 자동 생성
   - 예: `0 */5 * * * ?` (매 5분마다)
   - 예: `0 0 9 * * MON-FRI` (평일 9시)

### 5.2 Cron 표현식 해석

1. **입력**: Cron 표현식 (텍스트 입력)
2. **파싱**: 표현식 검증 및 파싱
3. **설명**: 사람이 읽을 수 있는 설명
   ```
   입력: 0 */30 * * * ?
   설명: 매 30분마다 실행 (매시간 0분, 30분)

   입력: 0 0 9 * * MON-FRI
   설명: 평일(월요일-금요일) 오전 9시에 실행
   ```

### 5.3 다음 실행 시간 예측

1. **입력**: Cron 표현식
2. **현재 시간**: 서버 시간 기준 (또는 사용자 지정)
3. **출력**: 다음 10번의 실행 예정 시간
   ```
   입력: 0 */5 * * * ?
   현재: 2025-11-21 14:27:00

   다음 실행 시간:
   1. 2025-11-21 14:30:00 (3분 후)
   2. 2025-11-21 14:35:00 (8분 후)
   3. 2025-11-21 14:40:00 (13분 후)
   ... (이하 7개)
   ```

### 5.4 Cron 표기법 지원

#### Linux Cron (5필드)
```
분 시 일 월 요일
0 0 * * *
```

#### Quartz (6필드 + 초)
```
초 분 시 일 월 요일
0 0 0 * * ?
```

#### Spring (6필드)
```
초 분 시 일 월 요일
0 0 9 * * ?
```

**옵션**: 표기법 선택 (드롭다운)

### 5.5 시간대 설정

- **기본**: 서버 시간대 (시스템 시간대)
- **옵션**: KST, UTC, 기타 시간대 선택
- **표시**: 선택된 시간대로 다음 실행 시간 표시

### 5.6 UI/UX

#### 왼쪽: Cron 생성 패널
- **드롭다운/슬라이더**:
  - 분: `0` / `매 N분`
  - 시: `0-23` / `매 N시간`
  - 일: `*` (매일) / `1-31`
  - 월: `*` (매월) / `JAN-DEC`
  - 요일: `?` (무시) / `MON-SUN`

- **사전 설정 버튼**:
  - "매분", "매시간", "매일 자정", "매주 월요일" 등

- **출력 표현식**:
  - 자동 생성된 Cron 문자열 표시
  - 복사 버튼

#### 오른쪽: 표현식 입력 & 분석 패널
- **입력 필드**: Cron 표현식 (Textarea)
- **설명**: "매 30분마다 실행합니다"
- **유효성**: ✅ Valid 또는 ❌ Invalid
- **다음 실행 시간**: 테이블 형식으로 표시

- **옵션**:
  - Cron 표기법 선택
  - 시간대 선택
  - 기준 시간 변경

#### 버튼
- "표현식 검증"
- "복사"
- "초기화"
- "예제 로드"

#### 에러 표시
- 문법 오류 메시지
- 지원하지 않는 필드 경고

---

## 📌 비포함 항목 (Out of Scope)

- 실제 스케줄 실행 (스케줄러 엔진 아님)
- 시간대 자동 감지 (수동 선택만)
- 음력 기반 스케줄링
- 특정 일자 제외 (공휴일 등)
- 스케줄 저장 및 공유

---

## 🎨 디자인 고려사항

- 2열 레이아웃: 생성기 | 해석 & 검증
- Shadcn Dropdown, Select로 선택 UI 구성
- 사전 설정 버튼으로 빠른 선택
- 테이블로 다음 실행 시간 표시 (명확하고 읽기 쉽게)
- 반응형 (모바일에서는 1열)

---

## 🔧 기술 고려사항

### 구현 라이브러리

1. **Cron 파싱 & 검증**: `cron-parser` 라이브러리
   ```js
   import parser from 'cron-parser';
   const interval = parser.parseExpression('0 */5 * * * ?');
   const nextDate = interval.next(); // 다음 실행 시간
   ```

2. **시간 처리**: `date-fns` 또는 `dayjs`
   ```js
   import { format } from 'date-fns';
   const nextTimes = [];
   for (let i = 0; i < 10; i++) {
     nextTimes.push(interval.next().toDate());
   }
   ```

3. **시간대 지원**: `date-fns-tz` 또는 `dayjs-timezone`

### Cron 필드 매핑

```typescript
// GUI 선택값 → Cron 문자열
function buildCronExpression(config: {
  second?: string | number;
  minute: string | number;
  hour: string | number;
  dayOfMonth: string | number;
  month: string | number;
  dayOfWeek: string | number;
  type: 'linux' | 'quartz' | 'spring';
}): string {
  // 조건에 맞게 Cron 문자열 생성
  // 예: "0 */5 * * * ?" (매 5분)
}

// Cron 문자열 → 설명
function describeCron(expression: string): string {
  // 각 필드 파싱 후 설명 생성
}
```

### 다음 실행 시간 계산

```typescript
function getNextExecutionTimes(
  expression: string,
  count: number = 10,
  baseDate?: Date
): Date[] {
  const interval = parser.parseExpression(expression);
  if (baseDate) interval.reset(baseDate);

  const times: Date[] = [];
  for (let i = 0; i < count; i++) {
    times.push(interval.next().toDate());
  }
  return times;
}
```

### 클라이언트 사이드 처리

- 모든 파싱 및 계산은 브라우저에서 실행

---

## 📊 성공 메트릭

1. **표현식 생성**: GUI → Cron 100% 정확
2. **표현식 해석**: 일반적인 Cron 식 95% 이상 설명 가능
3. **다음 시간 예측**: 정확도 100%
4. **표기법 지원**: Linux, Quartz, Spring 모두 지원
5. **에러 처리**: 잘못된 표현식에 대한 명확한 오류 메시지

---

## 🤔 미해결 질문

1. 윤초(Leap Second) 고려할까?
2. 과거 날짜 기준으로 다음 실행 시간 계산할 수 있을까?
3. 사용자 커스텀 Cron 문법 지원할까?
4. 표현식 저장 및 공유 기능 필요할까?

---

**문서 버전**: 1.0
**마지막 수정**: 2025-11-21
