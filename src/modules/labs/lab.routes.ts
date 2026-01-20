import { Router } from "express";

import { prisma } from "../../config/prisma.js";
import { requireAuth } from "../../middlewares/require-auth.js";
import { GlobalRole, GuardianStatus, OrgRole } from "../../generated/prisma/enums.js";

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

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const labResult = await prisma.labResult.findUnique({
      where: { id },
      include: {
        labTestType: true,
        measures: {
          include: {
            labMeasureDef: true,
          },
        },
      },
    });

    if (!labResult) {
      return res.status(404).json({ message: "Lab result not found" });
    }

    if (req.user?.globalRole !== GlobalRole.ROOT_ADMIN) {
      const isPatient = req.user?.sub === labResult.patientId;
      const hasGuardianAccess = await canAccessPatient(
        labResult.patientId,
        req.user?.sub ?? "",
      );
      const isLabTech = await prisma.orgMember.findFirst({
        where: {
          userId: req.user?.sub ?? "",
          role: OrgRole.LAB_TECH,
        },
      });

      if (!isPatient && !hasGuardianAccess && !isLabTech) {
        return res.status(403).json({ message: "Forbidden" });
      }
    }

    return res.status(200).json({ labResult });
  } catch (error) {
    return next(error);
  }
});

export default router;
