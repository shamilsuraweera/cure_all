import type { Request } from "express";

import { prisma } from "../config/prisma.js";

type AuditInput = {
  action: string;
  actorUserId?: string | null;
  targetType: string;
  targetId?: string | null;
  orgId?: string | null;
  metadata?: Record<string, unknown> | null;
  req?: Request;
};

export const logAuditEvent = async ({
  action,
  actorUserId,
  targetType,
  targetId,
  orgId,
  metadata,
  req,
}: AuditInput) => {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        actorUserId: actorUserId ?? null,
        targetType,
        targetId: targetId ?? null,
        orgId: orgId ?? null,
        ip: req?.ip ?? null,
        userAgent: req?.get("user-agent") ?? null,
        metadata: metadata ?? null,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Audit log failed", error);
    }
  }
};
