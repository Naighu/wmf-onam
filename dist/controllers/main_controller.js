"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = getUser;
exports.getGalleryImages = getGalleryImages;
exports.updateLikesCount = updateLikesCount;
exports.uploadGallery = uploadGallery;
exports.createParticipant = createParticipant;
exports.updateParticipantMarks = updateParticipantMarks;
exports.listParticipants = listParticipants;
exports.makeParticipantLive = makeParticipantLive;
exports.previewScreen = previewScreen;
const multiparty = require('multiparty');
const respond_1 = require("../utils/respond");
const error_type_1 = require("../types/error.type");
const user_1 = __importDefault(require("../model/user"));
const gallery_1 = __importDefault(require("../model/gallery"));
const rabbitmq_1 = require("../services/rabbitmq");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const participant_1 = __importDefault(require("../model/participant"));
async function getUser(req, res) {
    try {
        const id = req.query.id;
        if (id) {
            const user = await user_1.default.findById(id);
            if (!user) {
                throw new error_type_1.AppError("NOT_FOUND", "Could not find the user", undefined);
            }
            const gallery = await gallery_1.default.findOne({ user: user._id });
            return (0, respond_1.sendOk)(res, {
                user: user,
                gallery: gallery
            });
        }
        const mobile = req.query.mobile;
        if (mobile) {
            const user = await user_1.default.findOne({ mobile: mobile });
            if (!user) {
                throw new error_type_1.AppError("NOT_FOUND", "Could not find the user", undefined);
            }
            const gallery = await gallery_1.default.findOne({ user: user._id });
            return (0, respond_1.sendOk)(res, {
                user: user,
                gallery: gallery
            });
        }
        const email = req.query.email;
        const user = await user_1.default.findOne({ email: email });
        if (!user) {
            throw new error_type_1.AppError("NOT_FOUND", "Could not find the user", undefined);
        }
        const gallery = await gallery_1.default.findOne({ user: user._id });
        return (0, respond_1.sendOk)(res, {
            user: user,
            gallery: gallery
        });
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
async function updateLikesCount(req, res) {
    try {
        const liked = req.body.liked ?? false;
        const token_id = req.body.token;
        const gallery_id = req.body.gallery;
        const gallery = await gallery_1.default.findById(gallery_id);
        if (!gallery) {
            throw new error_type_1.AppError("NOT_FOUND", "Could not find the gallery", undefined);
        }
        const alreadyLiked = gallery.liked.includes(token_id);
        if (alreadyLiked && !liked) {
            await gallery_1.default.updateOne({ _id: gallery_id }, {
                $inc: {
                    likes: -1
                },
                $pull: {
                    liked: token_id
                }
            });
        }
        else if (!alreadyLiked && liked) {
            await gallery_1.default.updateOne({ _id: gallery_id }, {
                $inc: {
                    likes: 1
                },
                $push: {
                    liked: token_id
                }
            });
        }
        return (0, respond_1.sendOk)(res, "Done");
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
async function uploadGallery(req, res) {
    try {
        const form = new multiparty.Form();
        form.parse(req, async (error, fields, files) => {
            const first_name = fields.first_name?.[0];
            const last_name = fields.last_name?.[0];
            const suburb = fields.suburb?.[0];
            const email = fields.email?.[0];
            const mobile = fields.mobile?.[0];
            const paths = [];
            let user = await user_1.default.findOne({
                email, mobile
            });
            if (!user) {
                user = await user_1.default.create({
                    first_name,
                    last_name,
                    suburb,
                    email,
                    mobile
                });
            }
            const uploadDir = path_1.default.join(process.cwd(), "uploads");
            await fs_1.default.promises.mkdir(uploadDir, { recursive: true });
            for (const file of files.files) {
                const destination = path_1.default.join(uploadDir, (0, crypto_1.randomUUID)() + "." + `${file.originalFilename.split(".").pop()}`);
                await fs_1.default.promises.copyFile(file.path, destination);
                paths.push(destination);
            }
            const data = {
                user_id: user._id,
                paths: paths
            };
            console.log(data);
            await (0, rabbitmq_1.produceMessageToQueue)("upload-s3", JSON.stringify(data));
            return (0, respond_1.sendOk)(res, "Added to Queue");
        });
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
async function createParticipant(req, res) {
    try {
        const { mobile, category, thumbnail, name } = req.body;
        const user = await user_1.default.findOne({ mobile: mobile });
        if (!user) {
            throw new error_type_1.AppError("NOT_FOUND", "Could not find the user", undefined);
        }
        const participant = await participant_1.default.create({
            user: user._id,
            name: name,
            category: category,
            thumbnail: thumbnail
        });
        return (0, respond_1.sendOk)(res, participant);
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
async function updateParticipantMarks(req, res) {
    try {
        const marks = req.body.marks;
        const token = req.body.token;
        const participant_id = req.body.participant_id;
        const participant = await participant_1.default.findById(participant_id);
        if (!participant) {
            throw new error_type_1.AppError("NOT_FOUND", "Could not find the participant", undefined);
        }
        const alreadyMarked = participant.marked_by.includes(token);
        if (alreadyMarked) {
            throw new error_type_1.AppError("VALIDATION_ERROR", "Already Marked", undefined);
        }
        else {
            await participant_1.default.updateOne({ _id: participant_id }, {
                $inc: {
                    total_marks: marks
                },
                $push: {
                    marked_by: token
                }
            });
            await (0, rabbitmq_1.produceMessageToQueue)("preview-screen", JSON.stringify({
                type: "mark",
                mark: marks
            }));
        }
        return (0, respond_1.sendOk)(res, "Successfully marked the participant");
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
async function listParticipants(req, res) {
    try {
        const participants = await participant_1.default.find({});
        return (0, respond_1.sendOk)(res, participants);
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
async function makeParticipantLive(req, res) {
    try {
        const participant_id = req.params.id;
        const live = req.query.live === "true";
        const participant = await participant_1.default.findById(participant_id);
        if (!participant) {
            throw new error_type_1.AppError("NOT_FOUND", "Could not find the participant", undefined);
        }
        participant.is_live = live;
        if (participant.is_live) {
            await (0, rabbitmq_1.produceMessageToQueue)("competition-live", JSON.stringify([participant]));
        }
        await participant.save();
        return (0, respond_1.sendOk)(res, participant);
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
async function previewScreen(req, res) {
    try {
        console.log(req.body);
        await (0, rabbitmq_1.produceMessageToQueue)("preview-screen", JSON.stringify(req.body));
        return (0, respond_1.sendOk)(res, "Added to Queue");
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
