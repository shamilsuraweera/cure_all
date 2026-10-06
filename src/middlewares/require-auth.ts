import type { Request, Response, NextFunction } from "express";

import { verifyAccessToken } from "../utils/jwt.js";
import { sendError } from "../utils/response.js";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const cookieToken = req.cookies?.access_token as string | undefined;
  const authHeader = req.headers.authorization;
  const bearerToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : undefined;
  const token = cookieToken ?? bearerToken;

  if (!token) {
    return sendError(res, 401, "Missing access token", "UNAUTHORIZED");
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    return next();
  } catch {
    return sendError(res, 401, "Invalid or expired token", "INVALID_TOKEN");
  }
};
