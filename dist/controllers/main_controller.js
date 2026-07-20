"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = getUser;
exports.getGalleryImages = getGalleryImages;
const respond_1 = require("../utils/respond");
const error_type_1 = require("../types/error.type");
const user_1 = __importDefault(require("../model/user"));
const gallery_1 = __importDefault(require("../model/gallery"));
async function getUser(req, res) {
    try {
        const id = req.query.id;
        if (id) {
            const user = await user_1.default.findById(id);
            return (0, respond_1.sendOk)(res, user);
        }
        const mobile = req.query.mobile;
        if (mobile) {
            const user = await user_1.default.findOne({ mobile: mobile });
            return (0, respond_1.sendOk)(res, user);
        }
        const email = req.query.email;
        const user = await user_1.default.findOne({ email: email });
        return (0, respond_1.sendOk)(res, user);
    }
    catch (err) {
        if (err instanceof error_type_1.AppError) {
            throw err;
        }
        else {
            throw new error_type_1.AppError("INTERNAL", err, undefined);
        }
    }
}
async function getGalleryImages(req, res) {
    try {
        const raw_page = req.query.page;
        let page = 1;
        if (!Number(raw_page)) {
            throw new error_type_1.AppError("VALIDATION_ERROR", "Provide valid page", undefined);
        }
        else {
            page = Number(raw_page);
        }
        const limit = 10;
        const gallery = await gallery_1.default.find().skip((page - 1) * limit).limit(limit).populate('user');
        return (0, respond_1.sendOk)(res, gallery);
    }
    catch (err) {
        if (err instanceof error_type_1.AppError) {
            throw err;
        }
        else {
            throw new error_type_1.AppError("INTERNAL", err, undefined);
        }
    }
}
