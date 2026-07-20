import { Router } from "express";
import { getGalleryImages, getUser } from "../controllers/main_controller";

const router = Router();


router.get("/user", getUser)
router.get("/gallery",getGalleryImages)

export default router;
