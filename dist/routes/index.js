"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const main_controller_1 = require("../controllers/main_controller");
const router = (0, express_1.Router)();
router.get("/user", main_controller_1.getUser);
router.get("/gallery", main_controller_1.getGalleryImages);
exports.default = router;
