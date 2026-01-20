export type ApiSuccess<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiError = {
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type PageMeta = {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};
