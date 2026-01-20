import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { env } from "../config/env.js";
import { sendError } from "../utils/response.js";

type ErrorResponse = {
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction,
) => {
  if (env.NODE_ENV !== "production") {
    // Helps diagnose test/dev failures without leaking in prod responses.
    console.error(err);
  }

  if (err instanceof z.ZodError) {
    return sendError(
      res,
      400,
      "Validation failed",
      "VALIDATION_ERROR",
      env.NODE_ENV === "production" ? undefined : err.flatten(),
    );
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  const code = err instanceof Error ? err.name : "INTERNAL_ERROR";
  const details =
    env.NODE_ENV === "production"
      ? undefined
      : err instanceof Error
        ? err.stack
        : err;

  return sendError(res, 500, message, code, details);
};
