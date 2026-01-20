import { Router } from "express";
import { z } from "zod";

import { prisma } from "../../config/prisma.js";
import { requireAuth } from "../../middlewares/require-auth.js";
import { requireGlobalRole } from "../../middlewares/require-global-role.js";
import { GlobalRole, OrgType } from "../../generated/prisma/enums.js";

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

export default router;
