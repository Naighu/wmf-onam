"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = notFound;
exports.errorHandler = errorHandler;
const error_type_1 = require("../types/error.type");
function notFound(_req, res) {
    throw error_type_1.AppError.from("NOT_FOUND");
}
function errorHandler(err, _req, res, _next) {
    const appErr = err instanceof error_type_1.AppError ? err : error_type_1.AppError.from("INTERNAL", process.env.NODE_ENV === "development" ? { err: String(err) } : undefined);
    return res.status(appErr.status).json({
        ok: false,
        error: { code: appErr.code, message: appErr.message, details: appErr.details },
        meta: { timestamp: new Date().toISOString(), requestId: res.locals.requestId },
    });
}
