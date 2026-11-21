import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";

import { useAuth } from "../auth/auth-context";
import { notificationTarget, registerForPush } from "../lib/notifications";

/** Registers the device for push after sign-in and routes notification taps. */
export const usePushNotifications = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) void registerForPush();
  }, [isAuthenticated]);

  useEffect(() => {
    const open = (data: unknown) => {
      const target = notificationTarget(data);
      if (target) router.push(target as never);
    };

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => open(response.notification.request.content.data),
    );
    // App launched by tapping a notification while closed.
    const last = Notifications.getLastNotificationResponse();
    if (last) open(last.notification.request.content.data);

    return () => subscription.remove();
  }, [router]);
};
