import { createApiClient } from "@cure-all/api-client";

const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:3000";

export const apiClient = createApiClient({
  baseUrl,
  authMode: "cookie",
  logger: (message, meta) => {
    if (import.meta.env.DEV) {
      console.info(message, meta ?? {});
    }
  },
  debug: import.meta.env.DEV,
});
