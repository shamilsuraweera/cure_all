export type ApiError = {
    message: string;
    code?: string;
    details?: unknown;
};
export type ApiSuccess<T> = {
    data: T;
    meta?: Record<string, unknown>;
};
export type ApiEnvelope<T> = ApiSuccess<T> | {
    error: ApiError;
};
export type TokenStorage = {
    getAccessToken: () => Promise<string | null> | string | null;
    setAccessToken: (token: string | null) => Promise<void> | void;
    getRefreshToken: () => Promise<string | null> | string | null;
    setRefreshToken: (token: string | null) => Promise<void> | void;
    clear: () => Promise<void> | void;
};
export type ApiClientOptions = {
    baseUrl: string;
    authMode?: "cookie" | "bearer";
    tokenStorage?: TokenStorage;
    fetcher?: typeof fetch;
    refreshPath?: string;
    logger?: (message: string, meta?: Record<string, unknown>) => void;
    debug?: boolean;
};
type RequestOptions = {
    headers?: Record<string, string>;
    query?: Record<string, string | number | boolean | undefined | null>;
};
export declare const createApiClient: (options: ApiClientOptions) => {
    get: <T>(path: string, requestOptions?: RequestOptions) => Promise<{
        ok: boolean;
        status: number;
        data?: T | undefined;
        error?: ApiError;
    }>;
    post: <T, B = unknown>(path: string, body?: B, requestOptions?: RequestOptions) => Promise<{
        ok: boolean;
        status: number;
        data?: T | undefined;
        error?: ApiError;
    }>;
    put: <T, B = unknown>(path: string, body?: B, requestOptions?: RequestOptions) => Promise<{
        ok: boolean;
        status: number;
        data?: T | undefined;
        error?: ApiError;
    }>;
    patch: <T, B = unknown>(path: string, body?: B, requestOptions?: RequestOptions) => Promise<{
        ok: boolean;
        status: number;
        data?: T | undefined;
        error?: ApiError;
    }>;
    del: <T>(path: string, requestOptions?: RequestOptions) => Promise<{
        ok: boolean;
        status: number;
        data?: T | undefined;
        error?: ApiError;
    }>;
};
export {};
