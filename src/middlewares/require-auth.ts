import type { Request, Response, NextFunction } from "express";

import { verifyAccessToken } from "../utils/jwt.js";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const cookieToken = req.cookies?.access_token as string | undefined;
  const authHeader = req.headers.authorization;
  const bearerToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : undefined;
  const token = cookieToken ?? bearerToken;

  if (!token) {
    return res.status(401).json({ message: "Missing access token" });
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
