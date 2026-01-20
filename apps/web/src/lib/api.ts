const rawBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const API_BASE_URL = (rawBaseUrl && rawBaseUrl.length > 0
  ? rawBaseUrl
  : "http://localhost:3000"
).replace(/\/+$/, "");

export type ApiResult<T> = {
  ok: boolean;
  status: number;
  data?: T;
  error?: { message: string; code?: string; details?: unknown };
};

const buildUrl = (path: string) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

const parseResponse = async <T>(res: Response): Promise<ApiResult<T>> => {
  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: payload.error ?? { message: "Request failed" },
    };
  }

  return {
    ok: true,
    status: res.status,
    data: payload.data as T,
  };
};

export const apiPost = async <T, B = unknown>(path: string, body?: B) => {
  const res = await fetch(buildUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  return parseResponse<T>(res);
};

export const apiGet = async <T>(path: string) => {
  const res = await fetch(buildUrl(path), {
    method: "GET",
    credentials: "include",
  });

  return parseResponse<T>(res);
};
