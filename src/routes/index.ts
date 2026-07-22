import { Router } from "express";
import { getGalleryImages, getUser, updateLikesCount } from "../controllers/main_controller";

const router = Router();


router.get("/user", getUser)
router.get("/gallery",getGalleryImages)
router.post("/like", updateLikesCount)

export default router;
