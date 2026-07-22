import { Request, Response } from "express";
const multiparty = require('multiparty');
import { sendOk } from "../utils/respond";
import { AppError } from "../types/error.type";
import User from "../model/user"
import Gallery from "../model/gallery"
import { produceMessageToQueue } from "../services/rabbitmq";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

export async function getUser(req: Request, res: Response) {
    try {

        const id = req.query.id;
        if (id) {
            const user = await User.findById(id)
            return sendOk(res, user);

        }

        const mobile = req.query.mobile;

        if (mobile) {
            const user = await User.findOne({ mobile: mobile as string })
            return sendOk(res, user);
        }

        const email = req.query.email;
        const user = await User.findOne({ email: email as string })
        return sendOk(res, user);


    } catch (err: any) {
        if (err instanceof AppError) {
            throw err;
        } else {
            throw new AppError("INTERNAL", err, undefined);
        }
    }
}


export async function getGalleryImages(req: Request, res: Response) {
    try {
        const raw_page = req.query.page
        let page = 1

        if (!Number(raw_page)) {
            throw new AppError("VALIDATION_ERROR", "Provide valid page", undefined);
        } else {
            page = Number(raw_page)
        }
        const limit = 10

        const gallery = await Gallery.find().skip((page - 1) * limit).limit(limit).populate('user')
        return sendOk(res, gallery);


    } catch (err: any) {
        if (err instanceof AppError) {
            throw err;
        } else {
            throw new AppError("INTERNAL", err, undefined);
        }
    }
}


export async function updateLikesCount(req: Request, res: Response) {
    try {

        const liked = req.body.liked ?? false
        const token_id = req.body.token;
        const gallery_id = req.body.gallery

        const gallery = await Gallery.findById(gallery_id);
        if (!gallery) {
            throw new AppError("NOT_FOUND", "Could not find the gallery", undefined);
        }

        const alreadyLiked = gallery.liked.includes(token_id)


        if (alreadyLiked && !liked) {
            await Gallery.updateOne({ _id: gallery_id }, {
                $inc: {
                    likes: -1
                },
                $pull: {
                    liked: token_id
                }
            })
        } else if (!alreadyLiked && liked) {
            await Gallery.updateOne({ _id: gallery_id }, {
                $inc: {
                    likes: 1
                },
                $push: {
                    liked: token_id
                }
            })
        }

        return sendOk(res, "Done")


    } catch (err: any) {
        if (err instanceof AppError) {
            throw err;
        } else {
            throw new AppError("INTERNAL", err, undefined);
        }
    }
}


export async function uploadGallery(req: Request, res: Response) {
    try {
        const form = new multiparty.Form();
        form.parse(req, async (error: any, fields: any, files: any) => {
            const first_name = fields.first_name?.[0];
            const last_name = fields.last_name?.[0];
            const suburb = fields.suburb?.[0];
            const email = fields.email?.[0];
            const mobile = fields.mobile?.[0];

            const paths = []

            let user = await User.findOne({
                email, mobile
            })

            if (!user) {
                user = await User.create({
                    first_name,
                    last_name,
                    suburb,
                    email,
                    mobile
                })
            }

            const uploadDir = path.join(process.cwd(), "uploads");
            await fs.promises.mkdir(uploadDir, { recursive: true });

            for (const file of files.files) {
                const destination = path.join(uploadDir, randomUUID() +"." + `${file.originalFilename.split(".").pop()}`);
                await fs.promises.copyFile(file.path, destination);
                paths.push(destination)
            }
            const data = {
                user_id: user._id,
                paths: paths
            }


            console.log(data);
            await produceMessageToQueue("upload-s3", JSON.stringify(data))


            return sendOk(res, "Added to Queue")
        })

    } catch (err: any) {
        if (err instanceof AppError) {
            throw err;
        } else {
            throw new AppError("INTERNAL", err, undefined);
        }
    }
}
