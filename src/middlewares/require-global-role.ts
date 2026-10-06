import type { Request, Response, NextFunction } from "express";

import type { GlobalRole } from "../generated/prisma/index.js";
import { sendError } from "../utils/response.js";

export const requireGlobalRole =
  (roles: GlobalRole[]) => (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthenticated", "UNAUTHORIZED");
    }

    if (!roles.includes(req.user.globalRole as GlobalRole)) {
      return sendError(res, 403, "Forbidden", "FORBIDDEN");
    }

    return next();
  };
