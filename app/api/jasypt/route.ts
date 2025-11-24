import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

/**
 * Jasypt 암호화/복호화 API Route
 *
 * Java CLI 도구(GenericJasypt.jar)를 child_process로 실행하여
 * 암호화 및 복호화를 수행합니다.
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const body = await request.json();
    const { mode, text, password, algorithm, outputType, poolSize } = body;

    // 필수 필드 검증
    if (!mode || !text || !password || !algorithm || !outputType || !poolSize) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다" },
        { status: 400 }
      );
    }

    // 모드 검증
    if (mode !== "encrypt" && mode !== "decrypt") {
      return NextResponse.json(
        { error: "mode는 'encrypt' 또는 'decrypt'여야 합니다" },
        { status: 400 }
      );
    }

    // 빈 값 검증
    if (text.trim() === "") {
      return NextResponse.json(
        { error: "입력 텍스트가 비어있습니다" },
        { status: 400 }
      );
    }

    if (password.trim() === "") {
      return NextResponse.json(
        { error: "Secret Key가 비어있습니다" },
        { status: 400 }
      );
    }

    // ENC() 래퍼 자동 제거 (복호화 시)
    let cleanText = text.trim();
    if (mode === "decrypt") {
      const encMatch = cleanText.match(/^ENC\((.*)\)$/);
      if (encMatch) {
        cleanText = encMatch[1];
      }
    }

    // 명령어 인젝션 방지를 위한 입력 검증
    // 큰따옴표와 백슬래시를 이스케이핑
    const escapeShellArg = (arg: string): string => {
      return arg.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    };

    const escapedText = escapeShellArg(cleanText);
    const escapedPassword = escapeShellArg(password);
    const escapedAlgorithm = escapeShellArg(algorithm);
    const escapedOutputType = escapeShellArg(outputType);
    const escapedPoolSize = escapeShellArg(poolSize);

    // JAR 파일 경로 계산
    const jarPath = path.join(
      process.cwd(),
      "resources",
      "jasypt",
      "target",
      "GenericJasypt.jar"
    );

    // Java 명령어 조립
    const command = `java -jar "${jarPath}" ${mode} "${escapedText}" "${escapedPassword}" "${escapedAlgorithm}" "${escapedOutputType}" "${escapedPoolSize}"`;

    // Java CLI 실행 (timeout: 10초)
    const { stdout, stderr } = await execAsync(command, {
      timeout: 10000,
      maxBuffer: 1024 * 1024, // 1MB
    });

    // 에러 확인
    if (stderr && stderr.trim() !== "") {
      // stderr에서 에러 타입 분류
      const stderrLower = stderr.toLowerCase();

      if (stderrLower.includes("invalid key") || stderrLower.includes("decryption failed")) {
        return NextResponse.json(
          { error: "Secret Key가 일치하지 않거나 알고리즘이 올바르지 않습니다" },
          { status: 400 }
        );
      } else if (stderrLower.includes("invalid algorithm")) {
        return NextResponse.json(
          { error: "지원하지 않는 알고리즘입니다" },
          { status: 400 }
        );
      } else if (stderrLower.includes("invalid input")) {
        return NextResponse.json(
          { error: "입력 형식이 올바르지 않습니다" },
          { status: 400 }
        );
      } else {
        // 기타 에러
        return NextResponse.json(
          { error: "암호화/복호화 중 오류가 발생했습니다", details: stderr },
          { status: 500 }
        );
      }
    }

    // 성공 응답
    return NextResponse.json({
      result: stdout.trim(),
    });

  } catch (error: any) {
    // Timeout 에러
    if (error.killed && error.signal === "SIGTERM") {
      return NextResponse.json(
        { error: "처리 시간이 초과되었습니다 (10초)" },
        { status: 504 }
      );
    }

    // child_process 에러 (stderr 포함)
    if (error.stderr) {
      const stderrLower = error.stderr.toLowerCase();

      if (stderrLower.includes("invalid key") || stderrLower.includes("decryption failed")) {
        return NextResponse.json(
          { error: "Secret Key가 일치하지 않거나 알고리즘이 올바르지 않습니다" },
          { status: 400 }
        );
      } else if (stderrLower.includes("invalid algorithm")) {
        return NextResponse.json(
          { error: "지원하지 않는 알고리즘입니다" },
          { status: 400 }
        );
      }
    }

    // 기타 예외
    console.error("Jasypt API Error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다", details: error.message },
      { status: 500 }
    );
  }
}
