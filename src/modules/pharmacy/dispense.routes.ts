import { Router } from "express";
import { z } from "zod";

import { prisma } from "../../config/prisma.js";
import { requireAuth } from "../../middlewares/require-auth.js";
import { logAuditEvent } from "../../utils/audit.js";
import { sendError, sendSuccess } from "../../utils/response.js";
import { buildPageMeta, getPagination } from "../../utils/pagination.js";
import {
  DispenseStatus,
  GlobalRole,
  GuardianStatus,
  OrgRole,
  OrgType,
  PrescriptionStatus,
} from "../../generated/prisma/index.js";

const router = Router();

const dispenseSchema = z.object({
  notes: z.string().min(1).optional(),
  items: z
    .array(
      z.object({
        prescriptionItemId: z.string().min(1),
        quantity: z.coerce.number().int().positive(),
      }),
    )
    .min(1),
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

const getPharmacyMembership = (userId: string) =>
  prisma.orgMember.findFirst({
    where: {
      userId,
      role: OrgRole.PHARMACIST,
      org: { type: OrgType.PHARMACY },
    },
    include: { org: true },
  });

const getDispensedTotals = (prescriptionId: string) =>
  prisma.dispenseItem.groupBy({
    by: ["prescriptionItemId"],
    _sum: { quantity: true },
    where: { dispenseRecord: { prescriptionId } },
  });

const getRemainingByItem = (
  items: { id: string; quantity: number }[],
  totals: { prescriptionItemId: string; _sum: { quantity: number | null } }[],
) => {
  const dispensedByItem = new Map(
    totals.map((row) => [row.prescriptionItemId, row._sum.quantity ?? 0]),
  );

  return items.map((item) => {
    const dispensed = dispensedByItem.get(item.id) ?? 0;
    return {
      prescriptionItemId: item.id,
      prescribedQuantity: item.quantity,
      dispensedQuantity: dispensed,
      remainingQuantity: Math.max(item.quantity - dispensed, 0),
    };
  });
};

router.post("/:id/verify", requireAuth, async (req, res, next) => {
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

    if (
      prescription.status === PrescriptionStatus.CANCELLED ||
      prescription.status === PrescriptionStatus.DISPENSED
    ) {
      return sendError(res, 400, "Prescription is not active", "PRESCRIPTION_INACTIVE");
    }

    if (req.user?.globalRole !== GlobalRole.ROOT_ADMIN) {
      const membership = await getPharmacyMembership(req.user?.sub ?? "");
      if (!membership) {
        return sendError(res, 403, "Forbidden", "FORBIDDEN");
      }
    }

    const totals = await getDispensedTotals(prescription.id);
    const remainingItems = getRemainingByItem(prescription.items, totals);

    return sendSuccess(res, 200, { prescription, remainingItems });
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/dispense", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { items, notes } = dispenseSchema.parse(req.body);

    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!prescription) {
      return sendError(res, 404, "Prescription not found", "PRESCRIPTION_NOT_FOUND");
    }

    if (
      prescription.status === PrescriptionStatus.CANCELLED ||
      prescription.status === PrescriptionStatus.DISPENSED
    ) {
      return sendError(res, 400, "Prescription is not active", "PRESCRIPTION_INACTIVE");
    }

    const membership = await getPharmacyMembership(req.user?.sub ?? "");

    if (!membership) {
      return sendError(res, 403, "Forbidden", "FORBIDDEN");
    }

    const itemIds = new Set(prescription.items.map((item) => item.id));
    if (!items.every((item) => itemIds.has(item.prescriptionItemId))) {
      return sendError(res, 400, "Invalid prescription items", "INVALID_PRESCRIPTION_ITEMS");
    }

    const result = await prisma.$transaction(async (tx) => {
      const totals = await tx.dispenseItem.groupBy({
        by: ["prescriptionItemId"],
        _sum: { quantity: true },
        where: { dispenseRecord: { prescriptionId: prescription.id } },
      });

      const remainingItems = getRemainingByItem(prescription.items, totals);
      const remainingById = new Map(
        remainingItems.map((item) => [item.prescriptionItemId, item]),
      );

      for (const item of items) {
        const remaining = remainingById.get(item.prescriptionItemId);
        if (!remaining || item.quantity > remaining.remainingQuantity) {
          throw new Error("Requested quantity exceeds remaining amount");
        }
      }

      const isFullyDispensed = prescription.items.every((item) => {
        const remaining = remainingById.get(item.id);
        const dispensedNow =
          items.find((entry) => entry.prescriptionItemId === item.id)?.quantity ?? 0;
        return (remaining?.remainingQuantity ?? 0) - dispensedNow === 0;
      });

      const dispenseRecord = await tx.dispenseRecord.create({
        data: {
          prescriptionId: prescription.id,
          dispensedById: req.user?.sub ?? "",
          pharmacyOrgId: membership.orgId,
          status: isFullyDispensed ? DispenseStatus.FULL : DispenseStatus.PARTIAL,
          notes,
          items: {
            create: items.map((item) => ({
              prescriptionItemId: item.prescriptionItemId,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      const newStatus = isFullyDispensed
        ? PrescriptionStatus.DISPENSED
        : PrescriptionStatus.PARTIALLY_DISPENSED;

      await tx.prescription.update({
        where: { id: prescription.id },
        data: { status: newStatus },
      });

      return dispenseRecord;
    });

    await logAuditEvent({
      action: "prescription.dispense",
      actorUserId: req.user?.sub ?? null,
      targetType: "dispense_record",
      targetId: result.id,
      orgId: membership.orgId,
      metadata: { prescriptionId: prescription.id },
      req,
    });

    return sendSuccess(res, 201, { dispenseRecord: result });
  } catch (error) {
    if (error instanceof Error && error.message.includes("remaining amount")) {
      return sendError(res, 400, "Over-dispensing is not allowed", "OVER_DISPENSE");
    }
    return next(error);
  }
});

router.get("/:id/dispenses", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!prescription) {
      return sendError(res, 404, "Prescription not found", "PRESCRIPTION_NOT_FOUND");
    }

    if (req.user?.globalRole !== GlobalRole.ROOT_ADMIN) {
      const isPatient = req.user?.sub === prescription.patientId;
      const isDoctor = req.user?.sub === prescription.doctorId;
      const hasGuardianAccess = await canAccessPatient(
        prescription.patientId,
        req.user?.sub ?? "",
      );
      const isPharmacist = await getPharmacyMembership(req.user?.sub ?? "");

      if (!isPatient && !hasGuardianAccess && !isDoctor && !isPharmacist) {
        return sendError(res, 403, "Forbidden", "FORBIDDEN");
      }
    }

    const { page, pageSize, skip, take } = getPagination(req.query);

    const [dispenseRecords, total] = await Promise.all([
      prisma.dispenseRecord.findMany({
        where: { prescriptionId: prescription.id },
        include: {
          items: {
            include: {
              prescriptionItem: {
                include: {
                  medicine: true,
                },
              },
            },
          },
          pharmacyOrg: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.dispenseRecord.count({ where: { prescriptionId: prescription.id } }),
    ]);

    return sendSuccess(
      res,
      200,
      { dispenseRecords },
      buildPageMeta(page, pageSize, total),
    );
  } catch (error) {
    return next(error);
  }
});

export default router;
