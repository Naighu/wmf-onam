"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOk = sendOk;
exports.sendCreated = sendCreated;
exports.sendNoContent = sendNoContent;
exports.sendPaginated = sendPaginated;
exports.sendError = sendError;
function withTimestamp(meta) {
    return { timestamp: new Date().toISOString(), ...meta };
}
function sendOk(res, data, meta) {
    const body = { ok: true, data, meta: withTimestamp({ ...meta, requestId: res.locals.requestId }) };
    return res.status(200).json(body);
}
function sendCreated(res, data, meta) {
    const body = { ok: true, data, meta: withTimestamp({ ...meta, requestId: res.locals.requestId }) };
    return res.status(201).json(body);
}
function sendNoContent(res) {
    return res.status(204).send();
}
function sendPaginated(res, data, pagination, meta) {
    const body = {
        ok: true,
        data,
        meta: withTimestamp({ ...meta, pagination, requestId: res.locals.requestId }),
    };
    return res.status(200).json(body);
}
function sendError(res, status, code, message, details, meta) {
    const body = {
        ok: false,
        error: { code, message, details },
        meta: withTimestamp({ ...meta, requestId: res.locals.requestId }),
    };
    return res.status(status).json(body);
}
