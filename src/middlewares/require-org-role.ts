import type { Request, Response, NextFunction } from "express";

import type { OrgRole } from "../generated/prisma/enums.js";
import { prisma } from "../config/prisma.js";

type OrgIdResolver = (req: Request) => string | undefined;

export const requireOrgRole =
  (roles: OrgRole[], getOrgId: OrgIdResolver) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    const orgId = getOrgId(req);
    if (!orgId) {
      return res.status(400).json({ message: "Organization ID required" });
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
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
