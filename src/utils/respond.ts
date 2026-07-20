import { Response } from "express";
import { ApiMeta, ApiSuccess, ApiError } from "../types/api.type";

function withTimestamp(meta?: ApiMeta): ApiMeta {
  return { timestamp: new Date().toISOString(), ...meta };
}

export function sendOk<T>(res: Response, data: T, meta?: ApiMeta) {
  const body: ApiSuccess<T> = { ok: true, data, meta: withTimestamp({ ...meta, requestId: res.locals.requestId }) };
  return res.status(200).json(body);
}

export function sendCreated<T>(res: Response, data: T, meta?: ApiMeta) {
  const body: ApiSuccess<T> = { ok: true, data, meta: withTimestamp({ ...meta, requestId: res.locals.requestId }) };
  return res.status(201).json(body);
}

export function sendNoContent(res: Response) {
  return res.status(204).send();
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: NonNullable<ApiMeta["pagination"]>,
  meta?: Omit<ApiMeta, "pagination">
) {
  const body: ApiSuccess<T[]> = {
    ok: true,
    data,
    meta: withTimestamp({ ...meta, pagination, requestId: res.locals.requestId }),
  };
  return res.status(200).json(body);
}

export function sendError(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown,
  meta?: ApiMeta
) {
  const body: ApiError = {
    ok: false,
    error: { code, message, details },
    meta: withTimestamp({ ...meta, requestId: res.locals.requestId }),
  };
  return res.status(status).json(body);
}
