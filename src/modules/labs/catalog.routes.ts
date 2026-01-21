import { Router } from "express";

import { prisma } from "../../config/prisma.js";
import { requireAuth } from "../../middlewares/require-auth.js";
import { GlobalRole, OrgRole } from "../../generated/prisma/index.js";
import { sendError, sendSuccess } from "../../utils/response.js";

const router = Router();

const requireLabAccess = async (userId: string, globalRole?: GlobalRole) => {
  if (globalRole === GlobalRole.ROOT_ADMIN) {
    return true;
  }
  const membership = await prisma.orgMember.findFirst({
    where: { userId, role: OrgRole.LAB_TECH },
  });
  return Boolean(membership);
};

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const hasAccess = await requireLabAccess(req.user?.sub ?? "", req.user?.globalRole);
    if (!hasAccess) {
      return sendError(res, 403, "Forbidden", "FORBIDDEN");
    }

    const labTestTypes = await prisma.labTestType.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return sendSuccess(res, 200, { items: labTestTypes });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id/measures", requireAuth, async (req, res, next) => {
  try {
    const hasAccess = await requireLabAccess(req.user?.sub ?? "", req.user?.globalRole);
    if (!hasAccess) {
      return sendError(res, 403, "Forbidden", "FORBIDDEN");
    }

    const labTestTypeId = String(req.params.id);
    const measures = await prisma.labMeasureDef.findMany({
      where: { labTestTypeId, isActive: true },
      orderBy: { name: "asc" },
    });

    return sendSuccess(res, 200, { items: measures });
  } catch (error) {
    return next(error);
  }
});

export default router;
