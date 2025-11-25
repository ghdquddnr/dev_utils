#!/bin/bash
# Dev Utils - 개발 서버 배포 스크립트

# 배포 서버 정보
SERVER_HOST="192.168.0.12"
SERVER_PORT="22"
SERVER_USER="root"  # 사용자 이름 (필요시 변경)
SERVER_PATH="/solomon_dev/docker/dev_utils_app"

echo "======================================"
echo "Dev Utils 배포 스크립트"
echo "======================================"
echo "대상 서버: ${SERVER_USER}@${SERVER_HOST}:${SERVER_PORT}"
echo "배포 경로: ${SERVER_PATH}"
echo "======================================"

# 1. 서버에 디렉토리 생성
echo "[1/4] 서버 디렉토리 생성 중..."
ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${SERVER_PATH}"

# 2. 전체 프로젝트 파일 전송 (rsync 사용)
echo "[2/4] 프로젝트 파일 전송 중..."
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude 'coverage' \
  --exclude '.git' \
  --exclude '.vscode' \
  --exclude '*.log' \
  -e "ssh -p ${SERVER_PORT}" \
  ./ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

# 3. 서버에서 Docker 이미지 빌드
echo "[3/4] Docker 이미지 빌드 중..."
ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST} << 'EOF'
cd /solomon_dev/docker/dev_utils_app
docker-compose down
docker-compose build
EOF

# 4. 서버에서 컨테이너 실행
echo "[4/4] Docker 컨테이너 실행 중..."
ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST} << 'EOF'
cd /solomon_dev/docker/dev_utils_app
docker-compose up -d
docker-compose ps
EOF

echo "======================================"
echo "배포 완료!"
echo "애플리케이션 URL: http://${SERVER_HOST}:3030"
echo "======================================"
echo ""
echo "로그 확인: ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST} 'cd ${SERVER_PATH} && docker-compose logs -f'"
echo "중지: ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST} 'cd ${SERVER_PATH} && docker-compose down'"
