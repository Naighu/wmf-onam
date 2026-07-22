import { Router } from "express";
import { getGalleryImages, getUser, updateLikesCount, uploadGallery } from "../controllers/main_controller";

const router = Router();


router.get("/user", getUser)
router.post("/upload", uploadGallery)
router.get("/gallery",getGalleryImages)
router.post("/like", updateLikesCount)

export default router;
