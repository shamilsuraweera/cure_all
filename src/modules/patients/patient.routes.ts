import { Router } from "express";
import { z } from "zod";

import { prisma } from "../../config/prisma.js";
import { requireAuth } from "../../middlewares/require-auth.js";
import { GlobalRole, GuardianStatus } from "../../generated/prisma/enums.js";

const router = Router();

const canAccessPatient = async (patientUserId: string, userId: string) => {
  const guardianLink = await prisma.guardianLink.findUnique({
    where: {
      patientId_guardianId: {
        patientId: patientUserId,
        guardianId: userId,
      },
    },
  });

  return guardianLink?.status === GuardianStatus.ACTIVE;
};

const updatePatientSchema = z
  .object({
    name: z.string().min(1).optional(),
    dob: z.coerce.date().optional(),
    location: z.string().min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patientProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
    });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    if (req.user?.globalRole === GlobalRole.ROOT_ADMIN) {
      return res.status(200).json({ patient });
    }

    if (req.user?.sub === patient.userId) {
      return res.status(200).json({ patient });
    }

    const hasAccess = await canAccessPatient(
      patient.userId,
      req.user?.sub ?? "",
    );

    if (!hasAccess) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.status(200).json({ patient });
  } catch (error) {
    return next(error);
  }
});

router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = updatePatientSchema.parse(req.body);

    const patient = await prisma.patientProfile.findUnique({
      where: { id },
    });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    if (req.user?.globalRole !== GlobalRole.ROOT_ADMIN) {
      if (req.user?.sub !== patient.userId) {
        const hasAccess = await canAccessPatient(
          patient.userId,
          req.user?.sub ?? "",
        );
        if (!hasAccess) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
    }

    const updated = await prisma.patientProfile.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({ patient: updated });
  } catch (error) {
    return next(error);
  }
});

export default router;
