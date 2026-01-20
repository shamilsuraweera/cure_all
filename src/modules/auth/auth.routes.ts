import { Router } from "express";
import { z } from "zod";

import { env } from "../../config/env.js";
import { prisma } from "../../config/prisma.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  type JwtPayload,
} from "../../utils/jwt.js";
import { verifyPassword } from "../../utils/password.js";
import { durationToMs } from "../../utils/time.js";

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
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordOk = await verifyPassword(user.passwordHash, password);
    if (!passwordOk) {
      return res.status(401).json({ message: "Invalid credentials" });
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

    return res.status(200).json({ message: "Login successful" });
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

    if (!token) {
      return res.status(401).json({ message: "Missing refresh token" });
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
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
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

    return res.status(200).json({ message: "Token refreshed" });
  } catch (error) {
    return next(error);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/auth/refresh" });

  return res.status(200).json({ message: "Logged out" });
});

export default router;
