import { Router } from "express";
import { z } from "zod";

import { prisma } from "../../config/prisma.js";
import { requireAuth } from "../../middlewares/require-auth.js";
import { GlobalRole, GuardianStatus, OrgRole } from "../../generated/prisma/enums.js";
import { logAuditEvent } from "../../utils/audit.js";
import { sendError, sendSuccess } from "../../utils/response.js";

const router = Router();

const createAttachmentSchema = z.object({
  fileName: z.string().min(1),
  url: z.string().url(),
  mimeType: z.string().min(1).optional(),
  sizeBytes: z.coerce.number().int().positive().optional(),
});

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
        attachments: true,
      },
    });

    if (!labResult) {
      return sendError(res, 404, "Lab result not found", "LAB_RESULT_NOT_FOUND");
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
        return sendError(res, 403, "Forbidden", "FORBIDDEN");
      }
    }

    return sendSuccess(res, 200, { labResult });
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/attachments", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = createAttachmentSchema.parse(req.body);

    const labResult = await prisma.labResult.findUnique({
      where: { id },
    });

    if (!labResult) {
      return sendError(res, 404, "Lab result not found", "LAB_RESULT_NOT_FOUND");
    }

    if (req.user?.globalRole !== GlobalRole.ROOT_ADMIN) {
      const isLabTech = await prisma.orgMember.findFirst({
        where: {
          userId: req.user?.sub ?? "",
          role: OrgRole.LAB_TECH,
        },
      });

      if (!isLabTech) {
        return sendError(res, 403, "Forbidden", "FORBIDDEN");
      }
    }

    const attachment = await prisma.labAttachment.create({
      data: {
        labResultId: labResult.id,
        fileName: data.fileName,
        url: data.url,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
      },
    });

    await logAuditEvent({
      action: "lab_attachment.create",
      actorUserId: req.user?.sub ?? null,
      targetType: "lab_attachment",
      targetId: attachment.id,
      metadata: { labResultId: labResult.id },
      req,
    });

    return sendSuccess(res, 201, { attachment });
  } catch (error) {
    return next(error);
  }
});

export default router;
