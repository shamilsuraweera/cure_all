import crypto from "crypto";
import { Router } from "express";
import { z } from "zod";

import { prisma } from "../../config/prisma.js";
import { requireAuth } from "../../middlewares/require-auth.js";
import { requireGlobalRole } from "../../middlewares/require-global-role.js";
import {
  GlobalRole,
  GuardianStatus,
  OrgRole,
  OrgStatus,
  OrgType,
} from "../../generated/prisma/index.js";
import { hashPassword } from "../../utils/password.js";
import { isValidNic } from "../../utils/nic.js";
import { buildPageMeta, getPagination } from "../../utils/pagination.js";
import { sendError, sendSuccess } from "../../utils/response.js";

const router = Router();

const createOrgSchema = z.object({
  name: z.string().min(1),
  type: z.nativeEnum(OrgType),
  domain: z.string().min(1).optional(),
});

router.post(
  "/orgs",
  requireAuth,
  requireGlobalRole([GlobalRole.ROOT_ADMIN]),
  async (req, res, next) => {
    try {
      const data = createOrgSchema.parse(req.body);

      const org = await prisma.organization.create({ data });

      return sendSuccess(res, 201, { org });
    } catch (error) {
      return next(error);
    }
  },
);

router.get(
  "/orgs",
  requireAuth,
  requireGlobalRole([GlobalRole.ROOT_ADMIN]),
  async (req, res, next) => {
    try {
      const { page, pageSize, skip, take } = getPagination(req.query);

      const [items, total] = await Promise.all([
        prisma.organization.findMany({
          skip,
          take,
          orderBy: { createdAt: "desc" },
        }),
        prisma.organization.count(),
      ]);

      return sendSuccess(res, 200, { items }, buildPageMeta(page, pageSize, total));
    } catch (error) {
      return next(error);
    }
  },
);

const updateOrgStatusSchema = z.object({
  status: z.nativeEnum(OrgStatus),
});

router.patch(
  "/orgs/:id",
  requireAuth,
  requireGlobalRole([GlobalRole.ROOT_ADMIN]),
  async (req, res, next) => {
    try {
      const { status } = updateOrgStatusSchema.parse(req.body);
      const id = String(req.params.id);

      const org = await prisma.organization.update({
        where: { id },
        data: { status },
      });

      return sendSuccess(res, 200, { org });
    } catch (error) {
      return next(error);
    }
  },
);

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(OrgRole),
});

const createPatientSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  nic: z.string().min(1),
  name: z.string().min(1).optional(),
  dob: z.coerce.date().optional(),
  location: z.string().min(1).optional(),
  guardianEmail: z.string().email().optional(),
});

const createMedicineSchema = z.object({
  name: z.string().min(1),
  genericName: z.string().min(1).optional(),
  strength: z.string().min(1).optional(),
  form: z.enum(["TABLET", "CAPSULE", "SYRUP", "INJECTION", "CREAM", "OTHER"]),
  manufacturer: z.string().min(1).optional(),
  notes: z.string().min(1).optional(),
});

const createLabTestTypeSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
});

const createLabMeasureSchema = z.object({
  name: z.string().min(1),
  unit: z.string().min(1).optional(),
  normalRangeMin: z.coerce.number().optional(),
  normalRangeMax: z.coerce.number().optional(),
});

router.post(
  "/patients",
  requireAuth,
  requireGlobalRole([GlobalRole.ROOT_ADMIN]),
  async (req, res, next) => {
    try {
      const { email, password, nic, name, dob, location, guardianEmail } =
        createPatientSchema.parse(req.body);

      if (!isValidNic(nic)) {
        return sendError(res, 400, "Invalid NIC", "INVALID_NIC");
      }

      if (guardianEmail && guardianEmail === email) {
        return sendError(res, 400, "Guardian cannot be the patient", "INVALID_GUARDIAN");
      }

      const guardian = guardianEmail
        ? await prisma.user.findUnique({ where: { email: guardianEmail } })
        : null;

      if (guardianEmail && !guardian) {
        return sendError(res, 404, "Guardian user not found", "GUARDIAN_NOT_FOUND");
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        const existingProfile = await prisma.patientProfile.findUnique({
          where: { userId: existingUser.id },
        });
        if (existingProfile) {
          return sendError(res, 409, "Patient already exists", "PATIENT_EXISTS");
        }
      }

      const result = await prisma.$transaction(async (tx) => {
        let user = await tx.user.findUnique({ where: { email } });

        if (!user) {
          const passwordHash = await hashPassword(password);
          user = await tx.user.create({
            data: {
              email,
              passwordHash,
              globalRole: "USER",
            },
          });
        }

        const patient = await tx.patientProfile.create({
          data: {
            userId: user.id,
            nic,
            name,
            dob,
            location,
          },
        });

        if (guardian) {
          const existingLink = await tx.guardianLink.findUnique({
            where: {
              patientId_guardianId: {
                patientId: user.id,
                guardianId: guardian.id,
              },
            },
          });

          if (existingLink) {
            return patient;
          }

          await tx.guardianLink.create({
            data: {
              patientId: user.id,
              guardianId: guardian.id,
              status: GuardianStatus.ACTIVE,
            },
          });
        }

        return patient;
      });

      return sendSuccess(res, 201, { patient: result });
    } catch (error) {
      return next(error);
    }
  },
);

router.post(
  "/medicines",
  requireAuth,
  requireGlobalRole([GlobalRole.ROOT_ADMIN]),
  async (req, res, next) => {
    try {
      const data = createMedicineSchema.parse(req.body);

      const medicine = await prisma.medicine.create({ data });

      return sendSuccess(res, 201, { medicine });
    } catch (error) {
      return next(error);
    }
  },
);

router.post(
  "/lab-test-types",
  requireAuth,
  requireGlobalRole([GlobalRole.ROOT_ADMIN]),
  async (req, res, next) => {
    try {
      const data = createLabTestTypeSchema.parse(req.body);

      const labTestType = await prisma.labTestType.create({ data });

      return sendSuccess(res, 201, { labTestType });
    } catch (error) {
      return next(error);
    }
  },
);

router.post(
  "/lab-test-types/:id/measures",
  requireAuth,
  requireGlobalRole([GlobalRole.ROOT_ADMIN]),
  async (req, res, next) => {
    try {
      const data = createLabMeasureSchema.parse(req.body);
      const labTestTypeId = String(req.params.id);

      const labTestType = await prisma.labTestType.findUnique({
        where: { id: labTestTypeId },
      });

      if (!labTestType) {
        return sendError(res, 404, "Lab test type not found", "LAB_TEST_NOT_FOUND");
      }

      const measure = await prisma.labMeasureDef.create({
        data: {
          labTestTypeId,
          name: data.name,
          unit: data.unit,
          normalRangeMin: data.normalRangeMin ?? null,
          normalRangeMax: data.normalRangeMax ?? null,
        },
      });

      return sendSuccess(res, 201, { measure });
    } catch (error) {
      return next(error);
    }
  },
);

router.post(
  "/orgs/:id/invite",
  requireAuth,
  requireGlobalRole([GlobalRole.ROOT_ADMIN]),
  async (req, res, next) => {
    try {
      const { email, role } = inviteSchema.parse(req.body);
      const orgId = String(req.params.id);

      const org = await prisma.organization.findUnique({ where: { id: orgId } });
      if (!org) {
        return sendError(res, 404, "Organization not found", "ORG_NOT_FOUND");
      }

      if (org.domain) {
        const emailDomain = email.split("@")[1]?.toLowerCase();
        const orgDomain = org.domain.toLowerCase();

        if (!emailDomain || emailDomain !== orgDomain) {
          return sendError(res, 400, "Email domain not allowed", "DOMAIN_NOT_ALLOWED");
        }
      }

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const token = crypto.randomUUID();

      const invite = await prisma.orgInvite.create({
        data: {
          orgId,
          email,
          role,
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

export default router;
