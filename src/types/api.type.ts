export type Pagination = {
  page?: number;
  pageSize?: number;
  total?: number;
  nextCursor?: string | null;
};

export type ApiMeta = {
  requestId?: string;
  timestamp?: string; // ISO
  pagination?: Pagination;
};

export type ApiSuccess<T> = {
  ok: true;
  data: T;
  meta?: ApiMeta;
};

export type ApiError = {
  ok: false;
  error: {
    code: string;            // e.g. "NOT_FOUND", "VALIDATION_ERROR"
    message: string;         // human-readable
    details?: unknown;       // optional extra context
  };
  meta?: ApiMeta;
};
