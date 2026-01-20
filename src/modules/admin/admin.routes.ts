import { Router } from "express";
import { z } from "zod";

import { prisma } from "../../config/prisma.js";
import { requireAuth } from "../../middlewares/require-auth.js";
import { requireGlobalRole } from "../../middlewares/require-global-role.js";
import { GlobalRole, OrgStatus, OrgType } from "../../generated/prisma/enums.js";

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

export default router;
