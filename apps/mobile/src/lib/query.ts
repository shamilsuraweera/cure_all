type ApiResult<T> = {
  ok: boolean;
  status: number;
  data?: T;
  error?: { message: string };
};

/** Turns the api-client result envelope into data, throwing on failure (for react-query). */
export const unwrap = async <T>(request: Promise<ApiResult<T>>): Promise<T> => {
  const result = await request;
  if (!result.ok) {
    throw new Error(result.error?.message ?? "Request failed");
  }
  return result.data as T;
};

export const errorMessage = (error: unknown): string | null =>
  error instanceof Error
    ? error.message
    : error
      ? "Something went wrong"
      : null;

export const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";
