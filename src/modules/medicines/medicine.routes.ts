import { Router } from "express";

import { prisma } from "../../config/prisma.js";
import { requireAuth } from "../../middlewares/require-auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? "1");
    const pageSize = Number(req.query.pageSize ?? "20");
    const query = String(req.query.q ?? "").trim();

    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safePageSize =
      Number.isFinite(pageSize) && pageSize > 0 && pageSize <= 100
        ? pageSize
        : 20;

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
        skip: (safePage - 1) * safePageSize,
        take: safePageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.medicine.count({ where }),
    ]);

    return res.status(200).json({
      items,
      page: safePage,
      pageSize: safePageSize,
      total,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
