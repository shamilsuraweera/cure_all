import { Router } from "express";
import { z } from "zod";

import { prisma } from "../../config/prisma.js";
import { requireAuth } from "../../middlewares/require-auth.js";
import { sendSuccess } from "../../utils/response.js";

const router = Router();

const tokenSchema = z.object({
  token: z
    .string()
    .min(10)
    .max(200)
    .regex(/^(Exponent|Expo)PushToken\[[^\]]+\]$/, "Invalid Expo push token"),
});

const registerSchema = tokenSchema.extend({
  platform: z.enum(["ios", "android"]),
});

// A device token belongs to one user at a time: re-registering moves it.
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { token, platform } = registerSchema.parse(req.body);
    await prisma.deviceToken.upsert({
      where: { token },
      create: { token, platform, userId: req.user?.sub ?? "" },
      update: { platform, userId: req.user?.sub ?? "" },
    });
    return sendSuccess(res, 200, { registered: true });
  } catch (error) {
    return next(error);
  }
});

router.post("/unregister", requireAuth, async (req, res, next) => {
  try {
    const { token } = tokenSchema.parse(req.body);
    await prisma.deviceToken.deleteMany({
      where: { token, userId: req.user?.sub ?? "" },
    });
    return sendSuccess(res, 200, { registered: false });
  } catch (error) {
    return next(error);
  }
});

export default router;
