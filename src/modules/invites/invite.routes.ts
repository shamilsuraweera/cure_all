import { Router } from "express";
import { z } from "zod";

import { prisma } from "../../config/prisma.js";
import { hashPassword } from "../../utils/password.js";
import { sendError, sendSuccess } from "../../utils/response.js";

const router = Router();

const acceptInviteSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

router.post("/accept", async (req, res, next) => {
  try {
    const { token, password } = acceptInviteSchema.parse(req.body);

    const invite = await prisma.orgInvite.findUnique({ where: { token } });
    if (!invite) {
      return sendError(res, 404, "Invite not found", "INVITE_NOT_FOUND");
    }

    const org = await prisma.organization.findUnique({
      where: { id: invite.orgId },
      select: { domain: true },
    });
    if (!org) {
      return sendError(res, 404, "Organization not found", "ORG_NOT_FOUND");
    }

    if (org.domain) {
      const emailDomain = invite.email.split("@")[1]?.toLowerCase();
      const orgDomain = org.domain.toLowerCase();

      if (!emailDomain || emailDomain !== orgDomain) {
        return sendError(res, 400, "Email domain not allowed", "DOMAIN_NOT_ALLOWED");
      }
    }

    if (invite.status !== "PENDING") {
      return sendError(res, 400, "Invite is not active", "INVITE_NOT_ACTIVE");
    }

    if (invite.expiresAt.getTime() < Date.now()) {
      await prisma.orgInvite.update({
        where: { id: invite.id },
        data: { status: "EXPIRED" },
      });
      return sendError(res, 400, "Invite expired", "INVITE_EXPIRED");
    }

    const result = await prisma.$transaction(async (tx) => {
      let user = await tx.user.findUnique({ where: { email: invite.email } });

      if (!user) {
        const passwordHash = await hashPassword(password);
        user = await tx.user.create({
          data: {
            email: invite.email,
            passwordHash,
            globalRole: "USER",
          },
        });
      }

      const existingMember = await tx.orgMember.findUnique({
        where: {
          userId_orgId: {
            userId: user.id,
            orgId: invite.orgId,
          },
        },
      });

      if (!existingMember) {
        await tx.orgMember.create({
          data: {
            userId: user.id,
            orgId: invite.orgId,
            role: invite.role,
          },
        });
      }

      await tx.orgInvite.update({
        where: { id: invite.id },
        data: { status: "ACCEPTED" },
      });

      return user;
    });

    return sendSuccess(res, 200, { userId: result.id });
  } catch (error) {
    return next(error);
  }
});

export default router;
