import { ErrorResponse, UrlEncodingResult } from "./types";

/**
 * 텍스트를 URL 인코딩합니다.
 * @param text - 인코딩할 텍스트
 * @param options - 인코딩 옵션 (spaceAsPlus: 공백을 +로 변환 여부)
 * @returns 인코딩 결과
 */
export function encodeUrl(
    text: string,
    options: { spaceAsPlus?: boolean } = {}
): UrlEncodingResult {
    if (!text) {
        return {
            success: false,
            error: "입력값이 비어있습니다",
            details: "인코딩할 텍스트를 입력해주세요",
        } as ErrorResponse;
    }

    try {
        let encoded = encodeURIComponent(text);

        if (options.spaceAsPlus) {
            encoded = encoded.replace(/%20/g, "+");
        }

        return {
            success: true,
            data: {
                type: "encode",
                result: encoded,
                original: text,
            },
        };
    } catch (error) {
        return {
            success: false,
            error: "인코딩 중 오류가 발생했습니다",
            details: error instanceof Error ? error.message : String(error),
        } as ErrorResponse;
    }
}

/**
 * URL 인코딩된 문자열을 디코딩합니다.
 * @param encoded - 디코딩할 문자열
 * @returns 디코딩 결과
 */
export function decodeUrl(encoded: string): UrlEncodingResult {
    if (!encoded) {
        return {
            success: false,
            error: "입력값이 비어있습니다",
            details: "디코딩할 텍스트를 입력해주세요",
        } as ErrorResponse;
    }

    try {
        // + 기호를 공백으로 변환 (decodeURIComponent는 +를 공백으로 변환하지 않음)
        const input = encoded.replace(/\+/g, " ");
        const decoded = decodeURIComponent(input);

        return {
            success: true,
            data: {
                type: "decode",
                result: decoded,
                original: encoded,
            },
        };
    } catch (error) {
        return {
            success: false,
            error: "디코딩 실패",
            details: "올바르지 않은 URL 인코딩 형식입니다",
        } as ErrorResponse;
    }
}

/**
 * URL 쿼리 스트링을 파싱합니다.
 * @param qs - 파싱할 쿼리 스트링 또는 전체 URL
 * @returns 파싱 결과 (키-값 쌍)
 */
export function parseQueryString(qs: string): UrlEncodingResult {
    if (!qs) {
        return {
            success: false,
            error: "입력값이 비어있습니다",
            details: "파싱할 URL 또는 쿼리 스트링을 입력해주세요",
        } as ErrorResponse;
    }

    try {
        let queryString = qs;

        // 전체 URL인 경우 ? 뒷부분만 추출
        if (qs.includes("?")) {
            queryString = qs.split("?")[1];
        } else if (qs.match(/^https?:\/\//)) {
            // URL이지만 쿼리 스트링이 없는 경우
            return {
                success: true,
                data: {
                    type: "parse",
                    result: "{}",
                    original: qs,
                    parameters: {},
                },
            };
        }

        // 해시(#) 제거
        if (queryString.includes("#")) {
            queryString = queryString.split("#")[0];
        }

        if (!queryString) {
            return {
                success: true,
                data: {
                    type: "parse",
                    result: "{}",
                    original: qs,
                    parameters: {},
                },
            };
        }

        const params = new URLSearchParams(queryString);
        const result: Record<string, string> = {};

        params.forEach((value, key) => {
            result[key] = value;
        });

        return {
            success: true,
            data: {
                type: "parse",
                result: JSON.stringify(result, null, 2),
                original: qs,
                parameters: result,
            },
        };
    } catch (error) {
        return {
            success: false,
            error: "파싱 중 오류가 발생했습니다",
            details: error instanceof Error ? error.message : String(error),
        } as ErrorResponse;
    }
}
