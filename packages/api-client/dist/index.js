const normalizeError = (payload) => {
    if (payload && typeof payload === "object" && "error" in payload) {
        const err = payload.error;
        if (err?.message) {
            return err;
        }
    }
    return { message: "Request failed" };
};
const buildUrl = (baseUrl, path, query) => {
    const safeBase = baseUrl.replace(/\/+$/, "");
    const safePath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${safeBase}${safePath}`);
    if (query) {
        for (const [key, value] of Object.entries(query)) {
            if (value === undefined || value === null)
                continue;
            url.searchParams.set(key, String(value));
        }
    }
    return url.toString();
};
const logDebug = (logger, debug, message, meta) => {
    if (!debug)
        return;
    logger?.(message, meta);
};
export const createApiClient = (options) => {
    const fetcher = options.fetcher ?? fetch;
    const authMode = options.authMode ?? "cookie";
    const refreshPath = options.refreshPath ?? "/auth/refresh";
    const refreshSession = async () => {
        const url = buildUrl(options.baseUrl, refreshPath);
        const headers = {};
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
        return res.ok;
    };
    const request = async (method, path, body, requestOptions = {}, attempt = 0) => {
        const url = buildUrl(options.baseUrl, path, requestOptions.query);
        const headers = {
            "Content-Type": "application/json",
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
        const payload = (await res.json().catch(() => ({})));
        if (!res.ok) {
            if (res.status === 401 && attempt === 0) {
                const refreshed = await refreshSession();
                if (refreshed) {
                    return request(method, path, body, requestOptions, attempt + 1);
                }
            }
            return { ok: false, status: res.status, error: normalizeError(payload) };
        }
        return { ok: true, status: res.status, data: payload.data };
    };
    return {
        get: (path, requestOptions) => request("GET", path, undefined, requestOptions),
        post: (path, body, requestOptions) => request("POST", path, body, requestOptions),
        put: (path, body, requestOptions) => request("PUT", path, body, requestOptions),
        patch: (path, body, requestOptions) => request("PATCH", path, body, requestOptions),
        del: (path, requestOptions) => request("DELETE", path, undefined, requestOptions),
    };
};
