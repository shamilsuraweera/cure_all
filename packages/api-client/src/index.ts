export type ApiError = {
  message: string;
  code?: string;
  details?: unknown;
};

export type ApiSuccess<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiEnvelope<T> = ApiSuccess<T> | { error: ApiError };

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
  defaultHeaders?: Record<string, string>;
};

type RequestOptions = {
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined | null>;
};

const normalizeError = (payload: unknown): ApiError => {
  if (payload && typeof payload === "object" && "error" in payload) {
    const err = (payload as { error?: ApiError }).error;
    if (err?.message) {
      return err;
    }
  }

  return { message: "Request failed" };
};

const buildUrl = (baseUrl: string, path: string, query?: RequestOptions["query"]) => {
  const safeBase = baseUrl.replace(/\/+$/, "");
  const safePath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${safeBase}${safePath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
};

const logDebug = (
  logger: ApiClientOptions["logger"],
  debug: boolean | undefined,
  message: string,
  meta?: Record<string, unknown>,
) => {
  if (!debug) return;
  logger?.(message, meta);
};

export const createApiClient = (options: ApiClientOptions) => {
  const fetcher = options.fetcher ?? fetch;
  const authMode = options.authMode ?? "cookie";
  const refreshPath = options.refreshPath ?? "/auth/refresh";

  const refreshSession = async () => {
    const url = buildUrl(options.baseUrl, refreshPath);
    const headers: Record<string, string> = {
      ...options.defaultHeaders,
    };

    if (authMode === "bearer" && options.tokenStorage) {
      const refreshToken = await options.tokenStorage.getRefreshToken();
      if (refreshToken) {
        headers.Authorization = `Bearer ${refreshToken}`;
      }
    }

    const res = await fetcher(url, {
      method: "POST",
      headers,
      credentials: authMode === "cookie" ? "include" : "omit",
    });

    if (authMode === "bearer" && options.tokenStorage && res.ok) {
      const payload = (await res.json().catch(() => ({}))) as ApiEnvelope<{
        accessToken?: string;
        refreshToken?: string;
      }>;
      const data = (payload as ApiSuccess<{
        accessToken?: string;
        refreshToken?: string;
      }>).data;
      if (data?.accessToken) {
        await options.tokenStorage.setAccessToken(data.accessToken);
      }
      if (data?.refreshToken) {
        await options.tokenStorage.setRefreshToken(data.refreshToken);
      }
      return true;
    }

    return res.ok;
  };

  const request = async <T>(
    method: string,
    path: string,
    body?: unknown,
    requestOptions: RequestOptions = {},
    attempt = 0,
  ): Promise<{ ok: boolean; status: number; data?: T; error?: ApiError }> => {
    const url = buildUrl(options.baseUrl, path, requestOptions.query);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.defaultHeaders,
      ...requestOptions.headers,
    };

    if (authMode === "bearer" && options.tokenStorage) {
      const token = await options.tokenStorage.getAccessToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    logDebug(options.logger, options.debug, "api.request", { method, url });

    const res = await fetcher(url, {
      method,
      headers,
      credentials: authMode === "cookie" ? "include" : "omit",
      body: body ? JSON.stringify(body) : undefined,
    });

    const payload = (await res.json().catch(() => ({}))) as ApiEnvelope<T>;

    if (!res.ok) {
      if (res.status === 401 && attempt === 0) {
        const refreshed = await refreshSession();
        if (refreshed) {
          return request<T>(method, path, body, requestOptions, attempt + 1);
        }
      }

      return { ok: false, status: res.status, error: normalizeError(payload) };
    }

    return { ok: true, status: res.status, data: (payload as ApiSuccess<T>).data };
  };

  return {
    get: <T>(path: string, requestOptions?: RequestOptions) =>
      request<T>("GET", path, undefined, requestOptions),
    post: <T, B = unknown>(path: string, body?: B, requestOptions?: RequestOptions) =>
      request<T>("POST", path, body, requestOptions),
    put: <T, B = unknown>(path: string, body?: B, requestOptions?: RequestOptions) =>
      request<T>("PUT", path, body, requestOptions),
    patch: <T, B = unknown>(path: string, body?: B, requestOptions?: RequestOptions) =>
      request<T>("PATCH", path, body, requestOptions),
    del: <T>(path: string, requestOptions?: RequestOptions) =>
      request<T>("DELETE", path, undefined, requestOptions),
  };
};
