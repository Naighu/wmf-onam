"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = exports.ErrorCatalog = void 0;
// src/errors.ts
exports.ErrorCatalog = {
    VALIDATION_ERROR: { status: 400, message: "Invalid request" },
    AUTH_REQUIRED: { status: 401, message: "Authentication required" },
    FORBIDDEN: { status: 403, message: "Forbidden" },
    NOT_FOUND: { status: 404, message: "Resource not found" },
    USER_NOT_FOUND: { status: 404, message: "User not found" },
    DB_ERROR: { status: 500, message: "Database error" },
    INTERNAL: { status: 500, message: "Internal server error" },
};
class AppError extends Error {
    code;
    status;
    details;
    constructor(code, details, message) {
        const def = exports.ErrorCatalog[code];
        super(message ?? def.message);
        this.name = "AppError";
        this.code = code;
        this.status = def.status;
        this.details = details;
    }
    static from(code, details) {
        return new AppError(code, details);
    }
}
exports.AppError = AppError;
