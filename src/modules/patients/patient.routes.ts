import { Router } from "express";
import { z } from "zod";

import { prisma } from "../../config/prisma.js";
import { requireAuth } from "../../middlewares/require-auth.js";
import { GlobalRole, GuardianStatus, OrgRole } from "../../generated/prisma/enums.js";
import { logAuditEvent } from "../../utils/audit.js";
import { buildPageMeta, getPagination } from "../../utils/pagination.js";
import { sendError, sendSuccess } from "../../utils/response.js";

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

const createPrescriptionSchema = z.object({
  notes: z.string().min(1).optional(),
  items: z
    .array(
      z.object({
        medicineId: z.string().min(1),
        dose: z.string().min(1),
        frequency: z.string().min(1),
        durationDays: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive(),
        instructions: z.string().min(1).optional(),
      }),
    )
    .min(1),
});

const createLabResultSchema = z.object({
  labTestTypeId: z.string().min(1),
  notes: z.string().min(1).optional(),
  measures: z
    .array(
      z.object({
        labMeasureDefId: z.string().min(1),
        value: z.string().min(1),
        unit: z.string().min(1).optional(),
      }),
    )
    .min(1),
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
      return sendError(res, 404, "Patient not found", "PATIENT_NOT_FOUND");
    }

    if (req.user?.globalRole === GlobalRole.ROOT_ADMIN) {
      return sendSuccess(res, 200, { patient });
    }

    if (req.user?.sub === patient.userId) {
      return sendSuccess(res, 200, { patient });
    }

    const hasAccess = await canAccessPatient(
      patient.userId,
      req.user?.sub ?? "",
    );

    if (!hasAccess) {
      return sendError(res, 403, "Forbidden", "FORBIDDEN");
    }

    return sendSuccess(res, 200, { patient });
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
      return sendError(res, 404, "Patient not found", "PATIENT_NOT_FOUND");
    }

    if (req.user?.globalRole !== GlobalRole.ROOT_ADMIN) {
      if (req.user?.sub !== patient.userId) {
        const hasAccess = await canAccessPatient(
          patient.userId,
          req.user?.sub ?? "",
        );
        if (!hasAccess) {
          return sendError(res, 403, "Forbidden", "FORBIDDEN");
        }
      }
    }

    const updated = await prisma.patientProfile.update({
      where: { id },
      data: updateData,
    });

    return sendSuccess(res, 200, { patient: updated });
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/prescriptions", requireAuth, async (req, res, next) => {
  try {
    const { id: patientProfileId } = req.params;
    const { notes, items } = createPrescriptionSchema.parse(req.body);

    const patient = await prisma.patientProfile.findUnique({
      where: { id: patientProfileId },
    });

    if (!patient) {
      return sendError(res, 404, "Patient not found", "PATIENT_NOT_FOUND");
    }

    if (req.user?.globalRole !== GlobalRole.ROOT_ADMIN) {
      const doctorMembership = await prisma.orgMember.findFirst({
        where: {
          userId: req.user?.sub ?? "",
          role: OrgRole.DOCTOR,
        },
      });

      if (!doctorMembership) {
        return sendError(res, 403, "Forbidden", "FORBIDDEN");
      }
    }

    const medicineIds = items.map((item) => item.medicineId);
    const medicines = await prisma.medicine.findMany({
      where: {
        id: { in: medicineIds },
        isActive: true,
      },
      select: { id: true },
    });

    if (medicines.length !== medicineIds.length) {
      return sendError(res, 400, "Invalid medicine selection", "INVALID_MEDICINE");
    }

    const prescription = await prisma.prescription.create({
      data: {
        patientId: patient.userId,
        doctorId: req.user?.sub ?? "",
        notes,
        status: "ACTIVE",
        items: {
          create: items.map((item) => ({
            medicineId: item.medicineId,
            dose: item.dose,
            frequency: item.frequency,
            durationDays: item.durationDays,
            quantity: item.quantity,
            instructions: item.instructions,
          })),
        },
      },
      include: { items: true },
    });

    await logAuditEvent({
      action: "prescription.create",
      actorUserId: req.user?.sub ?? null,
      targetType: "prescription",
      targetId: prescription.id,
      metadata: { patientId: patient.userId },
      req,
    });

    return sendSuccess(res, 201, { prescription });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id/prescriptions", requireAuth, async (req, res, next) => {
  try {
    const { id: patientProfileId } = req.params;

    const patient = await prisma.patientProfile.findUnique({
      where: { id: patientProfileId },
    });

    if (!patient) {
      return sendError(res, 404, "Patient not found", "PATIENT_NOT_FOUND");
    }

    if (req.user?.globalRole !== GlobalRole.ROOT_ADMIN) {
      const isPatient = req.user?.sub === patient.userId;
      const hasGuardianAccess = await canAccessPatient(
        patient.userId,
        req.user?.sub ?? "",
      );
      const isDoctor = await prisma.orgMember.findFirst({
        where: {
          userId: req.user?.sub ?? "",
          role: OrgRole.DOCTOR,
        },
      });

      if (!isPatient && !hasGuardianAccess && !isDoctor) {
        return sendError(res, 403, "Forbidden", "FORBIDDEN");
      }
    }

    const { page, pageSize, skip, take } = getPagination(req.query);

    const [prescriptions, total] = await Promise.all([
      prisma.prescription.findMany({
        where: { patientId: patient.userId },
        include: {
          items: {
            include: {
              medicine: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.prescription.count({ where: { patientId: patient.userId } }),
    ]);

    return sendSuccess(
      res,
      200,
      { prescriptions },
      buildPageMeta(page, pageSize, total),
    );
  } catch (error) {
    return next(error);
  }
});

router.get("/prescriptions/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            medicine: true,
          },
        },
      },
    });

    if (!prescription) {
      return sendError(res, 404, "Prescription not found", "PRESCRIPTION_NOT_FOUND");
    }

    if (req.user?.globalRole !== GlobalRole.ROOT_ADMIN) {
      const isPatient = req.user?.sub === prescription.patientId;
      const hasGuardianAccess = await canAccessPatient(
        prescription.patientId,
        req.user?.sub ?? "",
      );
      const isDoctor = await prisma.orgMember.findFirst({
        where: {
          userId: req.user?.sub ?? "",
          role: OrgRole.DOCTOR,
        },
      });

      if (!isPatient && !hasGuardianAccess && !isDoctor) {
        return sendError(res, 403, "Forbidden", "FORBIDDEN");
      }
    }

    return sendSuccess(res, 200, { prescription });
  } catch (error) {
    return next(error);
  }
});

router.all("/prescriptions/:id", requireAuth, (req, res) => {
  if (req.method !== "GET") {
    return sendError(res, 405, "Prescriptions are immutable", "METHOD_NOT_ALLOWED");
  }
  return sendError(res, 405, "Method not allowed", "METHOD_NOT_ALLOWED");
});

router.post("/:id/lab-results", requireAuth, async (req, res, next) => {
  try {
    const { id: patientProfileId } = req.params;
    const { labTestTypeId, notes, measures } = createLabResultSchema.parse(
      req.body,
    );

    const patient = await prisma.patientProfile.findUnique({
      where: { id: patientProfileId },
    });

    if (!patient) {
      return sendError(res, 404, "Patient not found", "PATIENT_NOT_FOUND");
    }

    if (req.user?.globalRole !== GlobalRole.ROOT_ADMIN) {
      const labMembership = await prisma.orgMember.findFirst({
        where: {
          userId: req.user?.sub ?? "",
          role: OrgRole.LAB_TECH,
        },
      });

      if (!labMembership) {
        return sendError(res, 403, "Forbidden", "FORBIDDEN");
      }
    }

    const labTestType = await prisma.labTestType.findUnique({
      where: { id: labTestTypeId },
    });

    if (!labTestType || !labTestType.isActive) {
      return sendError(res, 400, "Invalid lab test type", "INVALID_LAB_TEST");
    }

    const measureIds = measures.map((measure) => measure.labMeasureDefId);
    const measureDefs = await prisma.labMeasureDef.findMany({
      where: {
        id: { in: measureIds },
        labTestTypeId,
        isActive: true,
      },
      select: { id: true },
    });

    if (measureDefs.length !== measureIds.length) {
      return sendError(res, 400, "Invalid measure selection", "INVALID_MEASURE");
    }

    const labResult = await prisma.labResult.create({
      data: {
        patientId: patient.userId,
        labTestTypeId,
        performedById: req.user?.sub ?? "",
        notes,
        measures: {
          create: measures.map((measure) => ({
            labMeasureDefId: measure.labMeasureDefId,
            value: measure.value,
            unit: measure.unit,
          })),
        },
      },
      include: {
        measures: true,
      },
    });

    await logAuditEvent({
      action: "lab_result.create",
      actorUserId: req.user?.sub ?? null,
      targetType: "lab_result",
      targetId: labResult.id,
      metadata: { patientId: patient.userId, labTestTypeId },
      req,
    });

    return sendSuccess(res, 201, { labResult });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id/lab-results", requireAuth, async (req, res, next) => {
  try {
    const { id: patientProfileId } = req.params;

    const patient = await prisma.patientProfile.findUnique({
      where: { id: patientProfileId },
    });

    if (!patient) {
      return sendError(res, 404, "Patient not found", "PATIENT_NOT_FOUND");
    }

    if (req.user?.globalRole !== GlobalRole.ROOT_ADMIN) {
      const isPatient = req.user?.sub === patient.userId;
      const hasGuardianAccess = await canAccessPatient(
        patient.userId,
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

    const { page, pageSize, skip, take } = getPagination(req.query);

    const [labResults, total] = await Promise.all([
      prisma.labResult.findMany({
        where: { patientId: patient.userId },
        include: {
          labTestType: true,
          measures: {
            include: {
              labMeasureDef: true,
            },
          },
          attachments: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.labResult.count({ where: { patientId: patient.userId } }),
    ]);

    return sendSuccess(
      res,
      200,
      { labResults },
      buildPageMeta(page, pageSize, total),
    );
  } catch (error) {
    return next(error);
  }
});

export default router;
