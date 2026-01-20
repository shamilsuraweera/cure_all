import { Router } from "express";

import { prisma } from "../../config/prisma.js";
import { requireAuth } from "../../middlewares/require-auth.js";
import { buildPageMeta, getPagination } from "../../utils/pagination.js";
import { sendSuccess } from "../../utils/response.js";

const router = Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { page, pageSize, skip, take } = getPagination(req.query);
    const query = String(req.query.q ?? "").trim();

    const where = query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { genericName: { contains: query, mode: "insensitive" } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.medicine.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.medicine.count({ where }),
    ]);

    return sendSuccess(res, 200, { items }, buildPageMeta(page, pageSize, total));
  } catch (error) {
    return next(error);
  }
});

export default router;
