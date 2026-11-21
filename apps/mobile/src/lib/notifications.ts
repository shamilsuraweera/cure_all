import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { apiClient } from "./api-client";

let registeredToken: string | null = null;

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

const getProjectId = () =>
  (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)
    ?.eas?.projectId ?? Constants.easConfig?.projectId;

/**
 * Asks for permission, fetches the Expo push token and registers it with the API.
 * Returns the token, or null when push is unavailable (simulator, Expo Go on
 * Android, permission denied, no EAS project id). Never throws.
 */
export const registerForPush = async (): Promise<string | null> => {
  if (Platform.OS === "web" || !Device.isDevice) return null;

  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Cure-All",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== "granted") {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== "granted") return null;

    const projectId = getProjectId();
    if (!projectId) return null;

    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    const result = await apiClient.post("/devices", {
      token,
      platform: Platform.OS === "ios" ? "ios" : "android",
    });
    if (!result.ok) return null;
    registeredToken = token;
    return token;
  } catch {
    return null;
  }
};

/** Removes this device from the signed-in account; call before clearing auth tokens. */
export const unregisterPush = async () => {
  if (!registeredToken) return;
  const token = registeredToken;
  registeredToken = null;
  try {
    await apiClient.post("/devices/unregister", { token });
  } catch {
    // Best effort: the server also prunes tokens Expo reports as invalid.
  }
};

export const notificationTarget = (data: unknown): string | null => {
  const payload = data as { type?: string; id?: string } | null;
  if (!payload?.id || !/^[A-Za-z0-9_-]{8,64}$/.test(payload.id)) return null;
  if (payload.type === "prescription") return `/prescriptions/${payload.id}`;
  if (payload.type === "lab") return `/labs/${payload.id}`;
  return null;
};
