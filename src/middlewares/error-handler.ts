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
      env.NODE_ENV === "production" ? undefined : z.flattenError(err),
    );
  }

  // body-parser / http-errors style client errors (413, malformed JSON, ...).
  const status = (err as { status?: unknown } | null)?.status;
  if (typeof status === "number" && status >= 400 && status < 500) {
    return sendError(
      res,
      status,
      status === 413 ? "Payload too large" : "Bad request",
      "BAD_REQUEST",
    );
  }

  if (env.NODE_ENV === "production") {
    // Never leak internal error messages, names or stacks to clients.
    console.error(err instanceof Error ? err.message : "Unknown error");
    return sendError(res, 500, "Internal server error", "INTERNAL_ERROR");
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  const code = err instanceof Error ? err.name : "INTERNAL_ERROR";
  const details = err instanceof Error ? err.stack : err;

  return sendError(res, 500, message, code, details);
};
