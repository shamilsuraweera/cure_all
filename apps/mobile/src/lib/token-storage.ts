import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "cureall.accessToken";
const REFRESH_TOKEN_KEY = "cureall.refreshToken";

export const tokenStorage = {
  getAccessToken: () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string | null) =>
    token
      ? SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token)
      : SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string | null) =>
    token
      ? SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token)
      : SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  clear: async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};
