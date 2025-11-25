# Dev Utils 배포 가이드

## 📋 배포 정보

- **배포 서버**: 192.168.0.12
- **SSH 포트**: 22
- **배포 경로**: `/solomon_dev/docker/dev_utils_app`
- **외부 포트**: 3030
- **컨테이너 포트**: 3000

---

## 🚀 배포 방법

### 방법 1: 수동 배포 (권장)

#### 1단계: 프로젝트 파일 압축

Windows PowerShell:
```powershell
# node_modules, .next 등 제외하고 압축
Compress-Archive -Path * -DestinationPath dev_utils.zip -Force `
  -Exclude node_modules,.next,coverage,.git,.vscode,*.log
```

Linux/Mac:
```bash
zip -r dev_utils.zip . -x "node_modules/*" ".next/*" "coverage/*" ".git/*" ".vscode/*" "*.log"
```

#### 2단계: 서버로 파일 전송

WinSCP, FileZilla 등 SFTP 클라이언트 사용:
- 호스트: 192.168.0.12
- 포트: 22
- 사용자명: root (또는 적절한 사용자)
- 패스워드: 1
- 경로: `/solomon_dev/docker/dev_utils_app`

또는 명령줄 사용:
```bash
scp -P 22 dev_utils.zip root@192.168.0.12:/solomon_dev/docker/dev_utils_app/
```

#### 3단계: 서버에 SSH 접속

```bash
ssh -p 22 root@192.168.0.12
# 패스워드: 1
```

#### 4단계: 서버에서 배포 실행

```bash
# 배포 디렉토리로 이동
cd /solomon_dev/docker/dev_utils_app

# 압축 해제 (zip 파일을 전송한 경우)
unzip -o dev_utils.zip

# 기존 컨테이너 중지 및 제거
docker-compose down

# Docker 이미지 빌드
docker-compose build

# 컨테이너 실행 (백그라운드)
docker-compose up -d

# 컨테이너 상태 확인
docker-compose ps
```

---

### 방법 2: 배포 스크립트 사용 (rsync 필요)

Linux/Mac 또는 Git Bash 환경:

```bash
# 스크립트 실행 권한 부여
chmod +x deploy.sh

# 배포 실행
./deploy.sh
```

스크립트는 자동으로:
1. 서버 디렉토리 생성
2. 프로젝트 파일 전송 (rsync)
3. Docker 이미지 빌드
4. 컨테이너 실행

**주의**: SSH 키 기반 인증이 설정되어 있어야 합니다.

---

## 🔍 배포 후 확인

### 1. 애플리케이션 접속

브라우저에서 다음 URL로 접속:
```
http://192.168.0.12:3030
```

### 2. 컨테이너 상태 확인

```bash
ssh root@192.168.0.12
cd /solomon_dev/docker/dev_utils_app
docker-compose ps
```

예상 출력:
```
NAME            COMMAND                  SERVICE      STATUS       PORTS
dev-utils-app   "node server.js"         dev-utils    running      0.0.0.0:3030->3000/tcp
```

### 3. 로그 확인

```bash
# 실시간 로그 확인
docker-compose logs -f

# 최근 100줄 로그
docker-compose logs --tail=100
```

### 4. 헬스체크 확인

```bash
# 컨테이너 내부에서 헬스체크
docker exec dev-utils-app wget --no-verbose --tries=1 --spider http://localhost:3000

# 또는 서버에서 직접
curl http://localhost:3000
```

---

## 🛠️ 관리 명령어

### 컨테이너 중지

```bash
cd /solomon_dev/docker/dev_utils_app
docker-compose stop
```

### 컨테이너 재시작

```bash
cd /solomon_dev/docker/dev_utils_app
docker-compose restart
```

### 컨테이너 중지 및 제거

```bash
cd /solomon_dev/docker/dev_utils_app
docker-compose down
```

### 이미지 재빌드 (코드 변경 후)

```bash
cd /solomon_dev/docker/dev_utils_app
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 디스크 공간 정리

```bash
# 사용하지 않는 이미지 제거
docker image prune -a -f

# 전체 정리 (주의: 다른 컨테이너도 영향받음)
docker system prune -a -f
```

---

## 📊 리소스 모니터링

### 컨테이너 리소스 사용량

```bash
docker stats dev-utils-app
```

### 디스크 사용량

```bash
docker system df
```

---

## 🐛 문제 해결

### 1. 컨테이너가 시작되지 않음

```bash
# 로그 확인
docker-compose logs

# 빌드 캐시 제거 후 재빌드
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 2. 포트 3030이 이미 사용 중

```bash
# 포트 사용 프로세스 확인
netstat -tulpn | grep 3030

# 또는
lsof -i :3030

# 프로세스 종료 후 재시작
docker-compose restart
```

### 3. Java (Jasypt) 관련 오류

컨테이너에 Java가 설치되어 있는지 확인:
```bash
docker exec dev-utils-app java -version
```

Java가 없다면 Dockerfile에 추가 필요:
```dockerfile
# Dockerfile의 runner stage에 추가
RUN apk add --no-cache openjdk11-jre
```

### 4. 빌드 실패 (standalone 모드)

`next.config.ts`에 다음 설정이 있는지 확인:
```typescript
output: 'standalone',
```

---

## 🔐 보안 권장사항

1. **SSH 패스워드 변경**: 기본 패스워드(1) 변경 권장
2. **SSH 키 기반 인증**: 패스워드 대신 SSH 키 사용
3. **방화벽 설정**: 포트 3030만 외부에 노출
4. **HTTPS 설정**: Nginx 리버스 프록시로 SSL 인증서 적용

---

## 📝 환경 변수 설정 (선택사항)

필요시 `.env.production` 파일 생성:

```bash
# /solomon_dev/docker/dev_utils_app/.env.production
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=http://192.168.0.12:3030
```

`docker-compose.yml`에서 환경 변수 파일 로드:
```yaml
services:
  dev-utils:
    env_file:
      - .env.production
```

---

## 📚 참고 자료

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

## 📞 지원

문제 발생 시:
1. 로그 확인: `docker-compose logs -f`
2. 컨테이너 상태: `docker-compose ps`
3. 시스템 리소스: `docker stats`
