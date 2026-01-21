import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "cureall.accessToken";
const REFRESH_TOKEN_KEY = "cureall.refreshToken";

const isWeb = Platform.OS === "web";
const secureStoreAvailable =
  !isWeb && typeof SecureStore.getItemAsync === "function";

const webGet = (key: string) =>
  typeof window === "undefined" ? null : window.localStorage.getItem(key);
const webSet = (key: string, value: string | null) => {
  if (typeof window === "undefined") return;
  if (value === null) {
    window.localStorage.removeItem(key);
  } else {
    window.localStorage.setItem(key, value);
  }
};

export const tokenStorage = {
  getAccessToken: () =>
    secureStoreAvailable ? SecureStore.getItemAsync(ACCESS_TOKEN_KEY) : webGet(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string | null) =>
    secureStoreAvailable
      ? token
        ? SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token)
        : SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY)
      : webSet(ACCESS_TOKEN_KEY, token),
  getRefreshToken: () =>
    secureStoreAvailable ? SecureStore.getItemAsync(REFRESH_TOKEN_KEY) : webGet(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string | null) =>
    secureStoreAvailable
      ? token
        ? SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token)
        : SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
      : webSet(REFRESH_TOKEN_KEY, token),
  clear: async () => {
    if (secureStoreAvailable) {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      return;
    }
    webSet(ACCESS_TOKEN_KEY, null);
    webSet(REFRESH_TOKEN_KEY, null);
  },
};
