# Dev Utils 배포 체크리스트

배포 전 확인해야 할 항목들입니다.

## ✅ 배포 준비 완료 항목

### 1. Docker 설정 파일
- [x] **Dockerfile** - Next.js standalone 모드로 멀티 스테이지 빌드
- [x] **docker-compose.yml** - 포트 3030:3000 매핑, 헬스체크 설정
- [x] **.dockerignore** - 불필요한 파일 제외 (node_modules, .next 등)
- [x] **next.config.ts** - `output: 'standalone'` 설정 추가

### 2. 환경 변수
- [x] **.env.example** - 환경 변수 템플릿 작성
- [ ] **.env.production** - 프로덕션 환경 변수 (서버에서 설정)

### 3. 배포 스크립트
- [x] **deploy.sh** - Linux/Mac 배포 스크립트
- [x] **deploy.ps1** - Windows PowerShell 배포 스크립트

### 4. 문서
- [x] **DEPLOYMENT.md** - 상세 배포 가이드
- [x] **README.md** - 배포 섹션 추가
- [x] **DEPLOYMENT_CHECKLIST.md** - 이 체크리스트

## 🔍 배포 전 확인 사항

### 코드 품질
```bash
# TypeScript 타입 체크
npx tsc --noEmit

# 린트 검사
npm run lint

# 테스트 실행
npm test

# 프로덕션 빌드 테스트
npm run build
```

### Docker 빌드 테스트 (로컬 Docker 설치 시)
```bash
# 이미지 빌드
docker-compose build

# 컨테이너 실행
docker-compose up

# 브라우저에서 확인
http://localhost:3030

# 정리
docker-compose down
```

### 파일 크기 확인
```bash
# Windows PowerShell
Get-ChildItem -Recurse |
  Where-Object { $_.FullName -notmatch 'node_modules|\.next|\.git' } |
  Measure-Object -Property Length -Sum |
  Select-Object @{Name='Size(MB)';Expression={[math]::Round($_.Sum / 1MB, 2)}}, Count

# 예상 크기: ~50MB (node_modules, .next 제외)
```

## 📦 배포 파일 목록

서버로 전송해야 할 파일/디렉토리:

```
dev_utils/
├── app/                    # Next.js 앱 라우터
├── components/             # React 컴포넌트
├── lib/                    # 비즈니스 로직
├── public/                 # 정적 파일
├── resources/              # Jasypt JAR 등
├── Dockerfile              # Docker 빌드 설정
├── docker-compose.yml      # Docker Compose 설정
├── .dockerignore           # Docker 제외 파일
├── next.config.ts          # Next.js 설정
├── package.json            # 의존성 목록
├── package-lock.json       # 의존성 잠금
├── tsconfig.json           # TypeScript 설정
├── tailwind.config.ts      # Tailwind 설정
├── jest.config.js          # Jest 설정
└── jest.setup.js           # Jest 초기화
```

**제외할 디렉토리:**
- `node_modules/` (서버에서 새로 설치)
- `.next/` (서버에서 새로 빌드)
- `coverage/` (테스트 결과)
- `.git/` (버전 관리)
- `.vscode/` (IDE 설정)

## 🚀 배포 단계별 가이드

### 1단계: 로컬 검증
```bash
# 타입 체크
npx tsc --noEmit
# ✅ 에러 없어야 함

# 빌드 테스트
npm run build
# ✅ 빌드 성공 확인
```

### 2단계: 파일 압축 (선택)
```powershell
# PowerShell
Compress-Archive -Path * -DestinationPath dev_utils.zip -Force `
  -Exclude node_modules,.next,coverage,.git,.vscode,*.log
```

### 3단계: 서버 전송
```bash
# SCP 사용
scp -P 22 dev_utils.zip root@192.168.0.12:/solomon_dev/docker/dev_utils_app/

# 또는 WinSCP/FileZilla 사용
# - 호스트: 192.168.0.12
# - 포트: 22
# - 사용자: root
# - 패스워드: 1
# - 경로: /solomon_dev/docker/dev_utils_app
```

### 4단계: 서버에서 배포
```bash
# SSH 접속
ssh -p 22 root@192.168.0.12

# 디렉토리 이동
cd /solomon_dev/docker/dev_utils_app

# 압축 해제 (필요시)
unzip -o dev_utils.zip

# 기존 컨테이너 중지
docker-compose down

# 이미지 빌드
docker-compose build

# 컨테이너 실행
docker-compose up -d

# 상태 확인
docker-compose ps
```

### 5단계: 배포 검증
```bash
# 1. 컨테이너 상태 확인
docker-compose ps
# STATUS가 "running"이어야 함

# 2. 로그 확인
docker-compose logs -f
# 에러 없어야 함

# 3. 헬스체크 확인
docker inspect dev-utils-app | grep -A 5 Health
# healthy 상태 확인

# 4. 브라우저 접속
http://192.168.0.12:3030
# 정상 로딩 확인

# 5. 기능 테스트
# - JSON Formatter: JSON 입력 및 포맷팅
# - Jasypt: 암호화/복호화
# - 기타 도구들 동작 확인
```

## ⚠️ 문제 해결

### 빌드 실패
```bash
# 캐시 제거 후 재빌드
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 포트 충돌
```bash
# 포트 3030 사용 확인
netstat -tulpn | grep 3030

# 프로세스 종료 후 재시작
docker-compose restart
```

### Java 관련 오류 (Jasypt)
```bash
# 컨테이너에 Java 설치 확인
docker exec dev-utils-app java -version

# Java가 없다면 Dockerfile 수정 필요
```

## 📊 배포 후 모니터링

### 리소스 사용량
```bash
# CPU, 메모리 사용량
docker stats dev-utils-app

# 디스크 사용량
docker system df
```

### 로그 확인
```bash
# 실시간 로그
docker-compose logs -f

# 최근 100줄
docker-compose logs --tail=100

# 특정 시간 이후 로그
docker-compose logs --since 10m
```

## 🔐 보안 체크리스트

- [ ] SSH 기본 패스워드 변경 (현재: 1)
- [ ] SSH 키 기반 인증 설정
- [ ] 방화벽에서 포트 3030만 허용
- [ ] HTTPS 설정 (Nginx 리버스 프록시)
- [ ] 보안 헤더 설정
- [ ] Rate limiting 설정

## 📝 배포 완료 보고서 템플릿

```
배포 일시: 2025-11-XX XX:XX:XX
배포자: [이름]
배포 서버: 192.168.0.12:3030
빌드 버전: [git commit hash 또는 버전]

✅ 체크리스트:
- [ ] 타입 체크 통과
- [ ] 빌드 성공
- [ ] Docker 이미지 빌드 완료
- [ ] 컨테이너 정상 실행
- [ ] 헬스체크 통과
- [ ] 기능 테스트 완료

❌ 문제점:
- [발생한 문제 및 해결 방법 기술]

📝 비고:
- [추가 사항]
```

---

**다음 단계**: [DEPLOYMENT.md](./DEPLOYMENT.md) 참고
