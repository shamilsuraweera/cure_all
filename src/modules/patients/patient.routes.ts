import { Router } from "express";

import { prisma } from "../../config/prisma.js";
import { requireAuth } from "../../middlewares/require-auth.js";
import { GlobalRole, GuardianStatus } from "../../generated/prisma/enums.js";

const router = Router();

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

    const guardianLink = await prisma.guardianLink.findUnique({
      where: {
        patientId_guardianId: {
          patientId: patient.userId,
          guardianId: req.user?.sub ?? "",
        },
      },
    });

    if (!guardianLink || guardianLink.status !== GuardianStatus.ACTIVE) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.status(200).json({ patient });
  } catch (error) {
    return next(error);
  }
});

export default router;
