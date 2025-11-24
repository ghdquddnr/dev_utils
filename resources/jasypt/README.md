# GenericJasypt - Jasypt CLI Tool

Jasypt 암호화/복호화를 위한 Java CLI 도구입니다. Bouncy Castle Provider를 사용하여 다양한 알고리즘을 지원합니다.

## 🔧 필수 요구사항

- **Java 11 이상** (Java 11, 17, 21 권장)
- **Maven 3.6 이상** (빌드용)

### Java 설치 확인

```bash
java -version
```

예상 출력:
```
java version "11.0.x" 또는 "17.0.x"
```

### Maven 설치 확인

```bash
mvn --version
```

예상 출력:
```
Apache Maven 3.x.x
```

### Maven 설치 (Windows)

1. **Chocolatey 사용** (권장):
   ```powershell
   choco install maven
   ```

2. **수동 설치**:
   - [Maven 다운로드](https://maven.apache.org/download.cgi)
   - 압축 해제 (예: `C:\Program Files\Apache\maven`)
   - 환경 변수 설정:
     - `MAVEN_HOME`: `C:\Program Files\Apache\maven`
     - `Path`에 `%MAVEN_HOME%\bin` 추가

## 📦 빌드 방법

### 1. 프로젝트 디렉토리로 이동

```bash
cd resources/jasypt
```

### 2. Maven 빌드 실행

```bash
mvn clean package
```

빌드 성공 시 다음 파일이 생성됩니다:
- `target/GenericJasypt.jar` (약 1.5MB, 의존성 포함)

### 3. JAR 파일 확인

```bash
ls -l target/GenericJasypt.jar
```

## 🚀 사용 방법

### 기본 문법

```bash
java -jar GenericJasypt.jar <mode> <text> <password> <algorithm> <outputType> <poolSize>
```

### 매개변수 설명

| 매개변수 | 설명 | 값 |
|---------|------|-----|
| `mode` | 암호화 또는 복호화 | `encrypt` \| `decrypt` |
| `text` | 입력 텍스트 | 평문 또는 암호화된 텍스트 |
| `password` | Secret Key (비밀번호) | 암호화/복호화에 사용할 키 |
| `algorithm` | 암호화 알고리즘 | 예: `PBEWithSHA256And128BitAES-CBC-BC` |
| `outputType` | 출력 형식 | `hexadecimal` \| `base64` |
| `poolSize` | Encryptor Pool 크기 | `1`~`10` (보통 `1` 사용) |

### 지원 알고리즘

#### 기본 알고리즘 (Bouncy Castle 필요)
- `PBEWithSHA256And128BitAES-CBC-BC` (권장)
- `PBEWithSHA256And256BitAES-CBC-BC`
- `PBEWithMD5AndTripleDES`

#### 표준 알고리즘 (JVM 기본 지원)
- `PBEWithMD5AndDES`
- `PBEWithHmacSHA256AndAES_256`

## 📝 사용 예제

### 1. 암호화 (Hexadecimal 출력)

```bash
java -jar target/GenericJasypt.jar encrypt "myPlainText" "mySecretKey" "PBEWithSHA256And128BitAES-CBC-BC" "hexadecimal" "1"
```

출력:
```
a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1
```

### 2. 복호화 (Hexadecimal 입력)

```bash
java -jar target/GenericJasypt.jar decrypt "a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1" "mySecretKey" "PBEWithSHA256And128BitAES-CBC-BC" "hexadecimal" "1"
```

출력:
```
myPlainText
```

### 3. ENC() 래퍼와 함께 복호화

```bash
java -jar target/GenericJasypt.jar decrypt "ENC(a3f8b2c1...)" "mySecretKey" "PBEWithSHA256And128BitAES-CBC-BC" "hexadecimal" "1"
```

출력:
```
myPlainText
```

> **참고**: `ENC()` 래퍼는 자동으로 제거됩니다.

### 4. Base64 출력 형식

```bash
java -jar target/GenericJasypt.jar encrypt "myPlainText" "mySecretKey" "PBEWithSHA256And128BitAES-CBC-BC" "base64" "1"
```

출력:
```
o/iy1E5f2qe4ydDh8qO0xdbn6Kmwwd4vSrbHyOnwGg==
```

## ⚠️ 에러 메시지

### "Error: Missing arguments"
- 필수 매개변수가 누락되었습니다.
- 6개의 매개변수를 모두 입력했는지 확인하세요.

### "Error: Decryption failed - Invalid key or algorithm"
- Secret Key가 일치하지 않거나 알고리즘이 잘못되었습니다.
- 암호화 시 사용한 Key와 알고리즘을 정확히 입력하세요.

### "Error: Invalid algorithm or configuration"
- 지원하지 않는 알고리즘이거나 JVM에서 사용할 수 없는 알고리즘입니다.
- Bouncy Castle이 필요한 알고리즘을 사용하고 있는지 확인하세요.

### "Error: Invalid poolSize"
- Pool Size는 1~10 사이의 숫자여야 합니다.

## 🔐 보안 고려사항

### 1. Secret Key 관리
- Secret Key를 코드에 하드코딩하지 마세요.
- 환경 변수 또는 설정 파일로 관리하세요.
- Secret Key를 버전 관리 시스템(Git)에 커밋하지 마세요.

### 2. 알고리즘 선택
- 프로덕션 환경에서는 `PBEWithSHA256And128BitAES-CBC-BC` 이상 사용 권장
- `PBEWithMD5AndDES`는 약한 알고리즘이므로 테스트 용도로만 사용

### 3. Output Type
- **Hexadecimal**: 더 긴 문자열이지만 표준 문자만 사용
- **Base64**: 더 짧지만 특수 문자 포함 (`+`, `/`, `=`)

## 🧪 테스트

### 암호화 후 복호화 검증

```bash
# 1. 암호화
ENCRYPTED=$(java -jar target/GenericJasypt.jar encrypt "testText" "testKey" "PBEWithSHA256And128BitAES-CBC-BC" "hexadecimal" "1")
echo "Encrypted: $ENCRYPTED"

# 2. 복호화
DECRYPTED=$(java -jar target/GenericJasypt.jar decrypt "$ENCRYPTED" "testKey" "PBEWithSHA256And128BitAES-CBC-BC" "hexadecimal" "1")
echo "Decrypted: $DECRYPTED"

# 3. 검증
if [ "$DECRYPTED" == "testText" ]; then
  echo "✅ Test passed"
else
  echo "❌ Test failed"
fi
```

## 📚 의존성

### Maven Dependencies

```xml
<dependency>
    <groupId>org.jasypt</groupId>
    <artifactId>jasypt</artifactId>
    <version>1.9.3</version>
</dependency>

<dependency>
    <groupId>org.bouncycastle</groupId>
    <artifactId>bcprov-jdk15on</artifactId>
    <version>1.70</version>
</dependency>
```

### JAR 파일 크기
- `GenericJasypt.jar`: 약 1.5MB (Jasypt + Bouncy Castle 포함)

## 🔄 Next.js 프로젝트 통합

이 JAR 파일은 Next.js API Route에서 `child_process`로 실행됩니다:

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

const jarPath = path.join(process.cwd(), 'resources', 'jasypt', 'GenericJasypt.jar');
const command = `java -jar "${jarPath}" ${mode} "${text}" "${password}" "${algorithm}" "${outputType}" "${poolSize}"`;

const { stdout, stderr } = await execAsync(command, { timeout: 10000 });
```

## 📖 참고 자료

- [Jasypt 공식 문서](http://www.jasypt.org/)
- [Bouncy Castle 문서](https://www.bouncycastle.org/)
- [Maven 설치 가이드](https://maven.apache.org/install.html)

## 🐛 문제 해결

### Maven 빌드 실패

```bash
# Maven 캐시 정리
mvn clean

# 의존성 다시 다운로드
mvn dependency:purge-local-repository

# 다시 빌드
mvn clean package
```

### Java 버전 오류

```bash
# Java 버전 확인
java -version

# JAVA_HOME 확인
echo $JAVA_HOME  # Linux/Mac
echo %JAVA_HOME%  # Windows
```

Java 11 이상이 설치되어 있는지 확인하세요.
