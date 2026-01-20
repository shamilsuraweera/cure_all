import type { Response } from "express";

type ErrorPayload = {
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
};

export const sendSuccess = <T>(
  res: Response,
  status: number,
  data: T,
  meta?: Record<string, unknown>,
) => {
  if (meta) {
    return res.status(status).json({ data, meta });
  }

  return res.status(status).json({ data });
};

export const sendError = (
  res: Response<ErrorPayload>,
  status: number,
  message: string,
  code?: string,
  details?: unknown,
) =>
  res.status(status).json({
    error: {
      message,
      code,
      details,
    },
  });
