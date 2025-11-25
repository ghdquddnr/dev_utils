# Dev Utils - 개발 서버 배포 스크립트 (PowerShell)

# 배포 서버 정보
$SERVER_HOST = "192.168.0.12"
$SERVER_PORT = "22"
$SERVER_USER = "user"  # 사용자 이름 (필요시 변경)
$SERVER_PATH = "/solomon_dev/docker/dev_utils_app"

Write-Host "======================================"
Write-Host "Dev Utils 배포 스크립트"
Write-Host "======================================"
Write-Host "대상 서버: ${SERVER_USER}@${SERVER_HOST}:${SERVER_PORT}"
Write-Host "배포 경로: ${SERVER_PATH}"
Write-Host "======================================"

# SCP를 사용한 파일 전송 (Windows에서 OpenSSH 필요)
Write-Host "[1/3] 프로젝트 파일 압축 중..."
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$archiveName = "dev_utils_${timestamp}.zip"

# 압축 제외 항목
$excludeDirs = @("node_modules", ".next", "coverage", ".git", ".vscode")

# 압축 파일 생성 (7-Zip 또는 PowerShell Compress-Archive 사용)
if (Get-Command 7z -ErrorAction SilentlyContinue) {
    7z a -tzip $archiveName . -xr!node_modules -xr!.next -xr!coverage -xr!.git -xr!.vscode -xr!*.log
} else {
    # PowerShell 기본 압축 (느림)
    Get-ChildItem -Path . -Exclude @("node_modules", ".next", "coverage", ".git", ".vscode") |
        Compress-Archive -DestinationPath $archiveName -Force
}

Write-Host "[2/3] 서버로 파일 전송 중..."
Write-Host "파일 크기: $((Get-Item $archiveName).Length / 1MB) MB"

# SCP 명령어 출력 (수동 실행 필요)
Write-Host ""
Write-Host "다음 명령어를 실행하여 파일을 전송하세요:"
Write-Host "scp -P ${SERVER_PORT} ${archiveName} ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/"
Write-Host ""
Write-Host "[3/3] 서버에서 다음 명령어를 실행하세요:"
Write-Host ""
Write-Host "ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST}"
Write-Host "cd ${SERVER_PATH}"
Write-Host "unzip ${archiveName}"
Write-Host "docker-compose down"
Write-Host "docker-compose build"
Write-Host "docker-compose up -d"
Write-Host "docker-compose ps"
Write-Host ""
Write-Host "======================================"
Write-Host "배포 파일 준비 완료: ${archiveName}"
Write-Host "======================================"
