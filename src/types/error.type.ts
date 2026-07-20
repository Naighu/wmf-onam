// src/errors.ts
export const ErrorCatalog = {
  VALIDATION_ERROR: { status: 400, message: "Invalid request" },
  AUTH_REQUIRED:    { status: 401, message: "Authentication required" },
  FORBIDDEN:        { status: 403, message: "Forbidden" },
  NOT_FOUND:        { status: 404, message: "Resource not found" },

  USER_NOT_FOUND:   { status: 404, message: "User not found" },
  DB_ERROR:         { status: 500, message: "Database error" },
  INTERNAL:         { status: 500, message: "Internal server error" },
} as const;

export type ErrorCode = keyof typeof ErrorCatalog;

export class AppError extends Error {
  code: ErrorCode;
  status: number;
  details?: unknown;
  constructor(code: ErrorCode, details?: unknown, message?: string) {
    const def = ErrorCatalog[code];
    super(message ?? def.message);
    this.name = "AppError";
    this.code = code;
    this.status = def.status;
    this.details = details;
  }
  static from(code: ErrorCode, details?: unknown) {
    return new AppError(code, details);
  }
}
