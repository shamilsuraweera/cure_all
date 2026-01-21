import { Router } from "express";
import { z } from "zod";

import { env } from "../../config/env.js";
import { prisma } from "../../config/prisma.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  type JwtPayload,
} from "../../utils/jwt.js";
import { requireAuth } from "../../middlewares/require-auth.js";
import { verifyPassword } from "../../utils/password.js";
import { durationToMs } from "../../utils/time.js";
import { logAuditEvent } from "../../utils/audit.js";
import { sendError, sendSuccess } from "../../utils/response.js";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const isProd = env.NODE_ENV === "production";

const accessCookieMaxAge = durationToMs(env.ACCESS_TOKEN_TTL);
const refreshCookieMaxAge = durationToMs(env.REFRESH_TOKEN_TTL);

const buildCookieOptions = (maxAge: number, path: string) => ({
  httpOnly: true,
  sameSite: "strict" as const,
  secure: isProd,
  maxAge,
  path,
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return sendError(res, 401, "Invalid credentials", "INVALID_CREDENTIALS");
    }

    const passwordOk = await verifyPassword(user.passwordHash, password);
    if (!passwordOk) {
      return sendError(res, 401, "Invalid credentials", "INVALID_CREDENTIALS");
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      globalRole: user.globalRole,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.cookie(
      "access_token",
      accessToken,
      buildCookieOptions(accessCookieMaxAge, "/"),
    );
    res.cookie(
      "refresh_token",
      refreshToken,
      buildCookieOptions(refreshCookieMaxAge, "/auth/refresh"),
    );

    await logAuditEvent({
      action: "auth.login",
      actorUserId: user.id,
      targetType: "user",
      targetId: user.id,
      req,
    });

    return sendSuccess(res, 200, {
      message: "Login successful",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    let token = req.cookies?.refresh_token as string | undefined;

    if (!token && req.headers.cookie) {
      token = req.headers.cookie
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith("refresh_token="))
        ?.split("=")[1];
    }

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.slice("Bearer ".length);
    }

    if (!token) {
      return sendError(res, 401, "Missing refresh token", "MISSING_REFRESH_TOKEN");
    }

    let payload: JwtPayload;
    try {
      payload = verifyRefreshToken(token);
    } catch (error) {
      if (env.NODE_ENV !== "production") {
        console.error("Refresh token verify failed", {
          error: error instanceof Error ? error.message : error,
          hasToken: Boolean(token),
        });
      }
      return sendError(res, 401, "Invalid refresh token", "INVALID_REFRESH_TOKEN");
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return sendError(res, 401, "Invalid refresh token", "INVALID_REFRESH_TOKEN");
    }

    const newPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      globalRole: user.globalRole,
    };

    const accessToken = signAccessToken(newPayload);
    const refreshToken = signRefreshToken(newPayload);

    res.cookie(
      "access_token",
      accessToken,
      buildCookieOptions(accessCookieMaxAge, "/"),
    );
    res.cookie(
      "refresh_token",
      refreshToken,
      buildCookieOptions(refreshCookieMaxAge, "/auth/refresh"),
    );

    await logAuditEvent({
      action: "auth.refresh",
      actorUserId: user.id,
      targetType: "user",
      targetId: user.id,
      req,
    });

    return sendSuccess(res, 200, {
      message: "Token refreshed",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/logout", async (req, res) => {
  let actorUserId: string | null = null;
  const accessToken = req.cookies?.access_token as string | undefined;

  const bearerToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice("Bearer ".length)
    : undefined;
  const token = accessToken ?? bearerToken;

  if (token) {
    try {
      const payload = verifyAccessToken(token);
      actorUserId = payload.sub;
    } catch (error) {
      actorUserId = null;
    }
  }

  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/auth/refresh" });

  await logAuditEvent({
    action: "auth.logout",
    actorUserId,
    targetType: "user",
    targetId: actorUserId,
    req,
  });

  return sendSuccess(res, 200, { message: "Logged out" });
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.sub ?? "" },
      select: {
        id: true,
        email: true,
        globalRole: true,
        orgMemberships: {
          select: {
            role: true,
            org: {
              select: { id: true, type: true, name: true },
            },
          },
        },
      },
    });

    if (!user) {
      return sendError(res, 404, "User not found", "USER_NOT_FOUND");
    }

    return sendSuccess(res, 200, { user });
  } catch (error) {
    return next(error);
  }
});

export default router;
