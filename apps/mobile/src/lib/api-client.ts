import { createApiClient } from "@cure-all/api-client";
import Constants from "expo-constants";

import { tokenStorage } from "./token-storage";

const extra = Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined;
const baseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  extra?.apiBaseUrl ??
  "http://10.0.2.2:3000";

export const apiClient = createApiClient({
  baseUrl,
  authMode: "bearer",
  tokenStorage,
  debug: process.env.NODE_ENV !== "production",
  defaultHeaders: { "x-client": "mobile" },
  logger: (message, meta) => {
    // eslint-disable-next-line no-console
    console.log(message, meta ?? "");
  },
});
