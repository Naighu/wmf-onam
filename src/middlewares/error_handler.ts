import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/respond";
import { AppError } from "../types/error.type";

export function notFound(_req: Request, res: Response) {
throw AppError.from("NOT_FOUND");
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const appErr = err instanceof AppError ? err : AppError.from("INTERNAL", process.env.NODE_ENV==="development" ? { err: String(err) } : undefined);
  return res.status(appErr.status).json({
    ok: false,
    error: { code: appErr.code, message: appErr.message, details: appErr.details },
    meta: { timestamp: new Date().toISOString(), requestId: res.locals.requestId },
  });
}
