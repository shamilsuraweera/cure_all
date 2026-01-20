import { Router } from "express";
import { z } from "zod";

import { env } from "../../config/env.js";
import { prisma } from "../../config/prisma.js";
import {
  signAccessToken,
  signRefreshToken,
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

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: isProd,
      maxAge: accessCookieMaxAge,
      path: "/",
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: isProd,
      maxAge: refreshCookieMaxAge,
      path: "/auth/refresh",
    });

    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    return next(error);
  }
});

export default router;
