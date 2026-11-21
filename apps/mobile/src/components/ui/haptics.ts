import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const enabled = Platform.OS !== "web";

export const haptic = {
  tap: () => {
    if (enabled) void Haptics.selectionAsync();
  },
  success: () => {
    if (enabled)
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
  error: () => {
    if (enabled)
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },
};
