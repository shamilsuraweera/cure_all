import type { Request, Response, NextFunction } from "express";

import type { GlobalRole } from "../generated/prisma/index.js";

export const requireGlobalRole =
  (roles: GlobalRole[]) => (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    if (!roles.includes(req.user.globalRole as GlobalRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
