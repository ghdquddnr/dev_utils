import { RedisKeyPattern, RedisCommandResult, ErrorResponse } from "./types";

export const REDIS_PATTERNS: RedisKeyPattern[] = [
    {
        id: "user-profile",
        pattern: "user:{userId}:profile",
        description: "사용자 프로필 정보 (Hash)",
        dataType: "hash",
        category: "User",
        variables: [
            { name: "userId", type: "number", description: "사용자 ID" }
        ]
    },
    {
        id: "user-session",
        pattern: "session:{sessionId}",
        description: "사용자 세션 정보 (String)",
        dataType: "string",
        category: "Session",
        defaultTTL: 3600,
        variables: [
            { name: "sessionId", type: "string", description: "세션 ID (UUID)" }
        ]
    },
    {
        id: "product-details",
        pattern: "product:{productId}:details",
        description: "상품 상세 정보 (Hash)",
        dataType: "hash",
        category: "Product",
        variables: [
            { name: "productId", type: "number", description: "상품 ID" }
        ]
    },
    {
        id: "product-stock",
        pattern: "product:{productId}:stock",
        description: "상품 재고 수량 (String/Integer)",
        dataType: "string",
        category: "Product",
        variables: [
            { name: "productId", type: "number", description: "상품 ID" }
        ]
    },
    {
        id: "recent-views",
        pattern: "user:{userId}:recent_views",
        description: "최근 본 상품 목록 (Sorted Set - Timestamp score)",
        dataType: "zset",
        category: "User",
        variables: [
            { name: "userId", type: "number", description: "사용자 ID" }
        ]
    },
    {
        id: "cart-items",
        pattern: "cart:{cartId}:items",
        description: "장바구니 상품 목록 (Hash - productId:quantity)",
        dataType: "hash",
        category: "Cart",
        variables: [
            { name: "cartId", type: "string", description: "장바구니 ID" }
        ]
    }
];

export function validateVariables(pattern: RedisKeyPattern, variables: Record<string, string>): boolean {
    return pattern.variables.every(v => {
        const value = variables[v.name];
        if (!value) return false;
        if (v.type === "number" && isNaN(Number(value))) return false;
        return true;
    });
}

export function generateRedisCommand(
    pattern: RedisKeyPattern,
    variables: Record<string, string>
): RedisCommandResult {
    // 1. Validate variables
    if (!validateVariables(pattern, variables)) {
        return {
            success: false,
            error: "입력값이 유효하지 않습니다",
            details: "모든 변수를 올바른 형식으로 입력해주세요"
        } as ErrorResponse;
    }

    // 2. Generate Key
    let key = pattern.pattern;
    pattern.variables.forEach(v => {
        key = key.replace(`{${v.name}}`, variables[v.name]);
    });

    // 3. Generate Command based on DataType
    let command = "";
    switch (pattern.dataType) {
        case "string":
            command = `GET ${key}`;
            break;
        case "hash":
            command = `HGETALL ${key}`;
            break;
        case "list":
            command = `LRANGE ${key} 0 -1`;
            break;
        case "set":
            command = `SMEMBERS ${key}`;
            break;
        case "zset":
            command = `ZRANGE ${key} 0 -1 WITHSCORES`;
            break;
        default:
            command = `TYPE ${key}`;
    }

    return {
        success: true,
        data: {
            command,
            description: pattern.description,
            key,
            variables,
            matchedPattern: pattern.pattern
        }
    };
}
