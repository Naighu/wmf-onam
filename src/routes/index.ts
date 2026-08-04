import { Router } from "express";
import { createParticipant, getGalleryImages, getUser, getUsers, listParticipants, makeParticipantLive, previewScreen, updateLikesCount, updateParticipantMarks, uploadGallery } from "../controllers/main_controller";
import { isAdmin } from "../middlewares/is_admin";

const router = Router();


router.get("/user", getUser)
router.get("/users", getUsers)

router.post("/upload", uploadGallery)
router.get("/gallery",getGalleryImages)
router.post("/like", updateLikesCount)
router.post("/participant",isAdmin, createParticipant)
router.get("/participant",isAdmin, listParticipants)
router.post("/marks", updateParticipantMarks)
router.get("/make-live/:id",isAdmin,makeParticipantLive)
router.post("/preview-screen", isAdmin,previewScreen)


export default router;
