/**
 * 전역 타입 정의
 * 모든 도구에서 사용되는 공통 타입 및 인터페이스
 */

/**
 * 공통 에러 응답 인터페이스
 * 모든 도구의 에러 처리에 사용
 */
export interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
  line?: number;
  column?: number;
}

/**
 * 공통 성공 응답 인터페이스 (제너릭)
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * 공통 Result 타입 (성공 또는 에러)
 */
export type Result<T> = SuccessResponse<T> | ErrorResponse;

// ============================================
// JSON Formatter 관련 타입
// ============================================

/**
 * JSON 포맷팅 결과 데이터
 */
export interface JsonFormatterData {
  formatted: string; // 포맷팅된 JSON 문자열
  original: string; // 원본 JSON 문자열
  isValid: boolean; // 유효한 JSON 여부
}

/**
 * JSON 포맷팅 결과 (성공 또는 에러)
 */
export type JsonFormatterResult = Result<JsonFormatterData>;

// ============================================
// JWT Decoder 관련 타입
// ============================================

/**
 * JWT Header 데이터
 */
export interface JwtHeader {
  alg?: string; // 알고리즘 (예: HS256, RS256)
  typ?: string; // 타입 (보통 JWT)
  kid?: string; // Key ID (선택사항)
  [key: string]: any; // 추가 헤더 필드
}

/**
 * JWT Payload 데이터
 */
export interface JwtPayload {
  iss?: string; // Issuer
  sub?: string; // Subject
  aud?: string | string[]; // Audience
  exp?: number; // Expiration time (Unix timestamp)
  nbf?: number; // Not before (Unix timestamp)
  iat?: number; // Issued at (Unix timestamp)
  jti?: string; // JWT ID
  [key: string]: any; // 커스텀 클레임
}

/**
 * JWT 디코딩 결과 데이터
 */
export interface JwtDecodeData {
  header: JwtHeader; // 디코딩된 Header
  payload: JwtPayload; // 디코딩된 Payload
  signature: string; // 서명 (Base64URL 인코딩된 형태)
  isValid: boolean; // JWT 형식이 유효한지 여부
  message: string; // 상태 메시지
}

/**
 * JWT 디코딩 결과 (성공 또는 에러)
 */
export type JwtDecodeResult = Result<JwtDecodeData>;

// ============================================
// SQL Parameter Binding 관련 타입
// ============================================

/**
 * SQL 파라미터 타입
 */
export type SqlParameterType = string | number | null | undefined | boolean;

/**
 * SQL 파라미터 바인딩 결과 데이터
 */
export interface SqlBindingData {
  boundQuery: string; // 파라미터가 바인딩된 SQL 쿼리
  original: string; // 원본 SQL 쿼리
  parameterCount: number; // 바인딩된 파라미터 개수
  placeholderCount: number; // ? 개수
}

/**
 * SQL 파라미터 바인딩 결과 (성공 또는 에러)
 */
export type SqlBindingResult = Result<SqlBindingData>;

/**
 * SQL 검증 결과
 */
export interface SqlValidationResult {
  isValid: boolean;
  parameterCount: number;
  placeholderCount: number;
  message: string;
}

// ============================================
// 도구 실행 상태 관련 타입
// ============================================

/**
 * 도구 실행 상태
 */
export type ToolStatus = "idle" | "loading" | "success" | "error";

/**
 * 도구 UI 상태 (모든 도구에서 사용)
 */
export interface ToolUIState<T> {
  input: string; // 사용자 입력
  result: T | null; // 처리 결과
  error: string | null; // 에러 메시지
  status: ToolStatus; // 현재 상태
}

// ============================================
// Java ↔ JSON Converter 관련 타입
// ============================================

/**
 * Java ↔ JSON 변환 결과 데이터
 */
export interface JavaJsonConversionData {
  result: string; // 변환 결과 (Java 또는 JSON)
  type: 'java-to-json' | 'json-to-java'; // 변환 방향
  original: string; // 원본 입력
  casing?: 'camelCase' | 'snake_case'; // 적용된 네이밍 방식
}

/**
 * Java ↔ JSON 변환 결과 (성공 또는 에러)
 */
export type JavaJsonConversionResult = Result<JavaJsonConversionData>;

// ============================================
// YAML ↔ Properties Converter 관련 타입
// ============================================

/**
 * YAML ↔ Properties 변환 결과 데이터
 */
export interface YamlPropertiesConversionData {
  result: string; // 변환 결과 (YAML 또는 Properties)
  type: 'yaml-to-properties' | 'properties-to-yaml'; // 변환 방향
  original: string; // 원본 입력
  indentation?: 2 | 4; // 들여쓰기 (YAML인 경우)
}

/**
 * YAML ↔ Properties 변환 결과 (성공 또는 에러)
 */
export type YamlPropertiesConversionResult = Result<YamlPropertiesConversionData>;

// ============================================
// Timestamp Converter 관련 타입
// ============================================

/**
 * Timestamp 변환 결과 데이터
 */
export interface TimestampConversionData {
  type: 'timestamp-to-date' | 'date-to-timestamp'; // 변환 방향
  input: string | number; // 입력값
  utc: string; // UTC 시간 (ISO 8601)
  kst: string; // KST 시간
  iso8601: string; // ISO 8601 형식
  relativeTime?: string; // 상대 시간 (예: "2시간 전")
  dayOfWeek?: string; // 요일
  timestamp?: number; // Unix Timestamp (date-to-timestamp인 경우)
}

/**
 * Timestamp 변환 결과 (성공 또는 에러)
 */
export type TimestampConversionResult = Result<TimestampConversionData>;

// ============================================
// Cron Expression Generator 관련 타입
// ============================================

/**
 * Cron 표현식 결과 데이터
 */
export interface CronExpressionData {
  expression: string; // 생성된 또는 파싱된 Cron 표현식
  description: string; // 사람이 읽을 수 있는 설명
  nextExecutionTimes?: string[]; // 다음 실행 시간들 (최대 10개)
  isValid: boolean; // 유효한 Cron 형식인지
  type?: 'linux' | 'quartz' | 'spring'; // Cron 표기법
}

/**
 * Cron 표현식 결과 (성공 또는 에러)
 */
export type CronExpressionResult = Result<CronExpressionData>;

// ============================================
// URL Encoder/Decoder 관련 타입
// ============================================

/**
 * URL 인코딩/디코딩 결과 데이터
 */
export interface UrlEncodingData {
  type: 'encode' | 'decode' | 'parse'; // 작업 유형
  result: string; // 변환 결과
  original: string; // 원본 입력
  parameters?: Record<string, string>; // 파싱된 쿼리 파라미터 (parse인 경우)
}

/**
 * URL 인코딩/디코딩 결과 (성공 또는 에러)
 */
export type UrlEncodingResult = Result<UrlEncodingData>;

// ============================================
// Redis Key Pattern Scanner 관련 타입
// ============================================

/**
 * Redis Key 패턴 정의
 */
export interface RedisKeyPattern {
  id: string;
  pattern: string; // "user:{userId}:profile"
  description: string;
  dataType: 'string' | 'hash' | 'list' | 'set' | 'zset';
  defaultTTL?: number;
  category: string;
  variables: {
    name: string;
    type: string;
    description: string;
  }[];
}

/**
 * Redis 명령어 생성 결과 데이터
 */
export interface RedisCommandData {
  command: string; // 생성된 Redis 명령어
  description: string; // 설명
  key?: string; // 추출된 Key
  variables?: Record<string, string>; // 매핑된 변수
  matchedPattern?: string; // 매칭된 패턴
}

/**
 * Redis 명령어 생성 결과 (성공 또는 에러)
 */
export type RedisCommandResult = Result<RedisCommandData>;

// ============================================
// Error Code Lookup 관련 타입
// ============================================

/**
 * 에러 코드 정의
 */
export interface ErrorCode {
  id: string;
  category: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  httpStatus?: number;
  message: string;
  description: string;
  causes: string[];
  solutions: string[];
  examples?: {
    language: string;
    code: string;
  }[];
  relatedCodes?: string[];
}

/**
 * 에러 코드 조회 결과 데이터
 */
export interface ErrorCodeLookupData {
  errorCode: ErrorCode;
  searchQuery?: string;
  totalMatches?: number;
}

/**
 * 에러 코드 조회 결과 (성공 또는 에러)
 */
export type ErrorCodeLookupResult = Result<ErrorCodeLookupData>;

// ============================================
// RegEx Tester 관련 타입
// ============================================

/**
 * 정규식 패턴 정의
 */
export interface RegexPattern {
  id: string;
  name: string;
  pattern: string;
  flags?: string;
  description: string;
  category: string;
  examples: {
    valid: string[];
    invalid: string[];
  };
}

/**
 * RegEx 테스트 결과 데이터
 */
export interface RegexTestData {
  pattern: string;
  testString: string;
  matches: boolean;
  matchResults?: string[];
  captureGroups?: any[];
  highlightedText?: string;
}

/**
 * RegEx 테스트 결과 (성공 또는 에러)
 */
export type RegexTestResult = Result<RegexTestData>;
