import type { Request, Response, NextFunction } from "express";

import type { OrgRole } from "../generated/prisma/index.js";
import { prisma } from "../config/prisma.js";
import { sendError } from "../utils/response.js";

type OrgIdResolver = (req: Request) => string | undefined;

export const requireOrgRole =
  (roles: OrgRole[], getOrgId: OrgIdResolver) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthenticated", "UNAUTHORIZED");
    }

    const orgId = getOrgId(req);
    if (!orgId) {
      return sendError(res, 400, "Organization ID required", "ORG_ID_REQUIRED");
    }

    const membership = await prisma.orgMember.findUnique({
      where: {
        userId_orgId: {
          userId: req.user.sub,
          orgId,
        },
      },
    });

    if (!membership || !roles.includes(membership.role as OrgRole)) {
      return sendError(res, 403, "Forbidden", "FORBIDDEN");
    }

    return next();
  };
