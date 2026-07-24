"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = isAdmin;
const error_type_1 = require("../types/error.type");
function isAdmin(req, res, _next) {
    if (req.headers.authorization === process.env.ADMIN_PASSWORD) {
        _next();
    }
    else {
        throw new error_type_1.AppError("FORBIDDEN", "Not Authorized to perform this task", undefined);
    }
}
