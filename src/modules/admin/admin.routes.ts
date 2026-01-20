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
} from "../../generated/prisma/enums.js";
import { hashPassword } from "../../utils/password.js";
import { isValidNic } from "../../utils/nic.js";

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

      return res.status(201).json({ org });
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
      const page = Number(req.query.page ?? "1");
      const pageSize = Number(req.query.pageSize ?? "20");

      const safePage = Number.isFinite(page) && page > 0 ? page : 1;
      const safePageSize =
        Number.isFinite(pageSize) && pageSize > 0 && pageSize <= 100
          ? pageSize
          : 20;

      const [items, total] = await Promise.all([
        prisma.organization.findMany({
          skip: (safePage - 1) * safePageSize,
          take: safePageSize,
          orderBy: { createdAt: "desc" },
        }),
        prisma.organization.count(),
      ]);

      return res.status(200).json({
        items,
        page: safePage,
        pageSize: safePageSize,
        total,
      });
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
      const { id } = req.params;

      const org = await prisma.organization.update({
        where: { id },
        data: { status },
      });

      return res.status(200).json({ org });
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

router.post(
  "/patients",
  requireAuth,
  requireGlobalRole([GlobalRole.ROOT_ADMIN]),
  async (req, res, next) => {
    try {
      const { email, password, nic, name, dob, location, guardianEmail } =
        createPatientSchema.parse(req.body);

      if (!isValidNic(nic)) {
        return res.status(400).json({ message: "Invalid NIC" });
      }

      if (guardianEmail && guardianEmail === email) {
        return res.status(400).json({ message: "Guardian cannot be the patient" });
      }

      const guardian = guardianEmail
        ? await prisma.user.findUnique({ where: { email: guardianEmail } })
        : null;

      if (guardianEmail && !guardian) {
        return res.status(404).json({ message: "Guardian user not found" });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        const existingProfile = await prisma.patientProfile.findUnique({
          where: { userId: existingUser.id },
        });
        if (existingProfile) {
          return res.status(409).json({ message: "Patient already exists" });
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

      return res.status(201).json({ patient: result });
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

      return res.status(201).json({ medicine });
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
      const { id: orgId } = req.params;

      const org = await prisma.organization.findUnique({ where: { id: orgId } });
      if (!org) {
        return res.status(404).json({ message: "Organization not found" });
      }

      if (org.domain) {
        const emailDomain = email.split("@")[1]?.toLowerCase();
        const orgDomain = org.domain.toLowerCase();

        if (!emailDomain || emailDomain !== orgDomain) {
          return res.status(400).json({ message: "Email domain not allowed" });
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

      return res.status(201).json({ invite });
    } catch (error) {
      return next(error);
    }
  },
);

export default router;
