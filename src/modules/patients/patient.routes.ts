import { Router } from "express";
import { z } from "zod";

import { prisma } from "../../config/prisma.js";
import { requireAuth } from "../../middlewares/require-auth.js";
import {
  GlobalRole,
  GuardianStatus,
  OrgRole,
  PrescriptionStatus,
} from "../../generated/prisma/enums.js";

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

router.post("/:id/prescriptions", requireAuth, async (req, res, next) => {
  try {
    const { id: patientProfileId } = req.params;
    const { notes, items } = createPrescriptionSchema.parse(req.body);

    const patient = await prisma.patientProfile.findUnique({
      where: { id: patientProfileId },
    });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    if (req.user?.globalRole !== GlobalRole.ROOT_ADMIN) {
      const doctorMembership = await prisma.orgMember.findFirst({
        where: {
          userId: req.user?.sub ?? "",
          role: OrgRole.DOCTOR,
        },
      });

      if (!doctorMembership) {
        return res.status(403).json({ message: "Forbidden" });
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
      return res.status(400).json({ message: "Invalid medicine selection" });
    }

    const prescription = await prisma.prescription.create({
      data: {
        patientId: patient.userId,
        doctorId: req.user?.sub ?? "",
        notes,
        status: PrescriptionStatus.ACTIVE,
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

    return res.status(201).json({ prescription });
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
      return res.status(404).json({ message: "Patient not found" });
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
        return res.status(403).json({ message: "Forbidden" });
      }
    }

    const prescriptions = await prisma.prescription.findMany({
      where: { patientId: patient.userId },
      include: {
        items: {
          include: {
            medicine: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ prescriptions });
  } catch (error) {
    return next(error);
  }
});

export default router;
