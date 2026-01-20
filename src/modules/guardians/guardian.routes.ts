import crypto from "crypto";
import { Router } from "express";
import { z } from "zod";

import { prisma } from "../../config/prisma.js";
import { requireAuth } from "../../middlewares/require-auth.js";
import { GlobalRole } from "../../generated/prisma/enums.js";
import { hashPassword } from "../../utils/password.js";
import { sendError, sendSuccess } from "../../utils/response.js";

const router = Router();

const inviteGuardianSchema = z.object({
  email: z.string().email(),
});

const acceptGuardianSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

router.post(
  "/patients/:id/guardians/invite",
  requireAuth,
  async (req, res, next) => {
    try {
      const { email } = inviteGuardianSchema.parse(req.body);
      const { id: patientProfileId } = req.params;

      const patientProfile = await prisma.patientProfile.findUnique({
        where: { id: patientProfileId },
        include: { user: { select: { id: true, email: true } } },
      });

      if (!patientProfile) {
        return sendError(res, 404, "Patient not found", "PATIENT_NOT_FOUND");
      }

      const isRoot = req.user?.globalRole === GlobalRole.ROOT_ADMIN;
      const isPatient = req.user?.sub === patientProfile.userId;
      if (!isRoot && !isPatient) {
        return sendError(res, 403, "Forbidden", "FORBIDDEN");
      }

      if (email.toLowerCase() === patientProfile.user.email.toLowerCase()) {
        return sendError(res, 400, "Guardian cannot be the patient", "INVALID_GUARDIAN");
      }

      const guardianUser = await prisma.user.findUnique({ where: { email } });
      if (guardianUser) {
        const existingLink = await prisma.guardianLink.findUnique({
          where: {
            patientId_guardianId: {
              patientId: patientProfile.userId,
              guardianId: guardianUser.id,
            },
          },
        });

        if (existingLink) {
          return sendError(res, 409, "Guardian already linked", "GUARDIAN_LINK_EXISTS");
        }
      }

      const activeInvite = await prisma.guardianInvite.findFirst({
        where: {
          patientId: patientProfile.userId,
          email,
          status: "PENDING",
          expiresAt: { gt: new Date() },
        },
      });

      if (activeInvite) {
        return sendError(res, 409, "Invite already pending", "INVITE_EXISTS");
      }

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const token = crypto.randomUUID();

      const invite = await prisma.guardianInvite.create({
        data: {
          patientId: patientProfile.userId,
          email,
          token,
          expiresAt,
        },
      });

      return sendSuccess(res, 201, { invite });
    } catch (error) {
      return next(error);
    }
  },
);

router.post("/guardians/accept", async (req, res, next) => {
  try {
    const { token, password } = acceptGuardianSchema.parse(req.body);

    const invite = await prisma.guardianInvite.findUnique({ where: { token } });
    if (!invite) {
      return sendError(res, 404, "Invite not found", "INVITE_NOT_FOUND");
    }

    if (invite.status !== "PENDING") {
      return sendError(res, 400, "Invite is not active", "INVITE_NOT_ACTIVE");
    }

    if (invite.expiresAt.getTime() < Date.now()) {
      await prisma.guardianInvite.update({
        where: { id: invite.id },
        data: { status: "EXPIRED" },
      });
      return sendError(res, 400, "Invite expired", "INVITE_EXPIRED");
    }

    const result = await prisma.$transaction(async (tx) => {
      const patient = await tx.user.findUnique({
        where: { id: invite.patientId },
      });

      if (!patient) {
        throw new Error("Patient not found");
      }

      let guardian = await tx.user.findUnique({ where: { email: invite.email } });

      if (!guardian) {
        const passwordHash = await hashPassword(password);
        guardian = await tx.user.create({
          data: {
            email: invite.email,
            passwordHash,
            globalRole: "USER",
          },
        });
      }

      if (guardian.id === patient.id) {
        throw new Error("Guardian cannot be the patient");
      }

      const existingLink = await tx.guardianLink.findUnique({
        where: {
          patientId_guardianId: {
            patientId: patient.id,
            guardianId: guardian.id,
          },
        },
      });

      if (!existingLink) {
        await tx.guardianLink.create({
          data: {
            patientId: patient.id,
            guardianId: guardian.id,
            status: "ACTIVE",
          },
        });
      }

      await tx.guardianInvite.update({
        where: { id: invite.id },
        data: { status: "ACCEPTED" },
      });

      return { patientId: patient.id, guardianId: guardian.id };
    });

    return sendSuccess(res, 200, result);
  } catch (error) {
    return next(error);
  }
});

export default router;
