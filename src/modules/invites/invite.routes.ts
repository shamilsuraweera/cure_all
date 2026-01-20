import { Router } from "express";
import { z } from "zod";

import { prisma } from "../../config/prisma.js";
import { hashPassword } from "../../utils/password.js";

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
      return res.status(404).json({ message: "Invite not found" });
    }

    if (invite.status !== "PENDING") {
      return res.status(400).json({ message: "Invite is not active" });
    }

    if (invite.expiresAt.getTime() < Date.now()) {
      await prisma.orgInvite.update({
        where: { id: invite.id },
        data: { status: "EXPIRED" },
      });
      return res.status(400).json({ message: "Invite expired" });
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

    return res.status(200).json({ userId: result.id });
  } catch (error) {
    return next(error);
  }
});

export default router;
