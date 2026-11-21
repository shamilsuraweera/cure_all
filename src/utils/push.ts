import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

type PushMessage = {
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

type ExpoTicket = { status: "ok" | "error"; details?: { error?: string } };

/** Patient plus any active guardians: everyone who should hear about a record. */
export const getPatientAudience = async (patientUserId: string) => {
  const links = await prisma.guardianLink.findMany({
    where: { patientId: patientUserId, status: "ACTIVE" },
    select: { guardianId: true },
  });
  return [patientUserId, ...links.map((link) => link.guardianId)];
};

/**
 * Best-effort push delivery through the Expo push service. Never throws:
 * a notification failure must not fail the request that triggered it.
 */
export const sendPush = async (userIds: string[], message: PushMessage) => {
  if (env.NODE_ENV === "test" || userIds.length === 0) return;

  try {
    const devices = await prisma.deviceToken.findMany({
      where: { userId: { in: userIds } },
      select: { token: true },
    });
    if (devices.length === 0) return;

    const payload = devices.map((device) => ({
      to: device.token,
      sound: "default",
      title: message.title,
      body: message.body,
      data: message.data ?? {},
    }));

    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return;

    const json = (await response.json()) as { data?: ExpoTicket[] };
    const invalid = (json.data ?? [])
      .map((ticket, index) => ({ ticket, token: devices[index]?.token }))
      .filter(
        ({ ticket, token }) =>
          token && ticket.status === "error" && ticket.details?.error === "DeviceNotRegistered",
      )
      .map(({ token }) => token as string);

    if (invalid.length > 0) {
      await prisma.deviceToken.deleteMany({ where: { token: { in: invalid } } });
    }
  } catch (error) {
    console.error("Push delivery failed", error instanceof Error ? error.message : error);
  }
};
