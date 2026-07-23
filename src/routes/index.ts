import { Router } from "express";
import { createParticipant, getGalleryImages, getUser, makeParticipantLive, updateLikesCount, updateParticipantMarks, uploadGallery } from "../controllers/main_controller";
import { isAdmin } from "../middlewares/is_admin";

const router = Router();


router.get("/user", getUser)
router.post("/upload", uploadGallery)
router.get("/gallery",getGalleryImages)
router.post("/like", updateLikesCount)
router.post("/participant",isAdmin, createParticipant)
router.post("/marks", updateParticipantMarks)
router.get("/make-live/:id",isAdmin,makeParticipantLive)


export default router;
