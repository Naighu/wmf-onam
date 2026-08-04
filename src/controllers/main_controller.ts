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
import Participant from "../model/participant";

export async function getUser(req: Request, res: Response) {
    try {

        const id = req.query.id;
        if (id) {
            const user = await User.findById(id)
            if (!user) {
                throw new AppError("NOT_FOUND", "Could not find the user", undefined);

            }
            const gallery = await Gallery.findOne({ user: user!._id })
            return sendOk(res, {
                user: user,
                gallery: gallery
            });

        }

        const mobile = req.query.mobile;

        if (mobile) {
            const user = await User.findOne({ mobile: mobile as string })
            if (!user) {
                throw new AppError("NOT_FOUND", "Could not find the user", undefined);

            }
            const gallery = await Gallery.findOne({ user: user!._id })
            return sendOk(res, {
                user: user,
                gallery: gallery
            });
        }

        const email = req.query.email;
        if (email) {
            const user = await User.findOne({ email: email as string })
            if (!user) {
                throw new AppError("NOT_FOUND", "Could not find the user", undefined);


            }
            const gallery = await Gallery.findOne({ user: user!._id })
            return sendOk(res, {
                user: user,
                gallery: gallery
            });
        }


    } catch (err: any) {
        if (err instanceof AppError) {
            throw err;
        } else {
            throw new AppError("INTERNAL", err, undefined);
        }
    }
}


export async function getUsers(req: Request, res: Response) {
    try {
        const name = req.query.name as string

        const users = await User.find({ first_name: new RegExp(name, "i")})

        if (!users || users.length == 0) {
            throw new AppError("NOT_FOUND", "No Users", undefined);

        }

        const galleries = await Gallery.find({ user: { $in: users.map((e) => e._id) } })
        return sendOk(res, {
            user: users,
            gallery: galleries
        });



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
                const destination = path.join(uploadDir, randomUUID() + "." + `${file.originalFilename.split(".").pop()}`);
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




export async function createParticipant(req: Request, res: Response) {

    try {
        const { mobile, category, thumbnail, name } = req.body

        const user = await User.findOne({ mobile: mobile })

        if (!user) {
            throw new AppError("NOT_FOUND", "Could not find the user", undefined);
        }



        const participant = await Participant.create({
            user: user._id,
            name: name,
            category: category,
            thumbnail: thumbnail
        })


        return sendOk(res, participant)
    } catch (err) {
        if (err instanceof AppError) {
            throw err;
        } else {
            throw new AppError("INTERNAL", err, undefined);
        }
    }
}

export async function updateParticipantMarks(req: Request, res: Response) {
    try {

        const marks = req.body.marks;
        const token = req.body.token;
        const participant_id = req.body.participant_id


        const participant = await Participant.findById(participant_id);
        if (!participant) {
            throw new AppError("NOT_FOUND", "Could not find the participant", undefined);
        }

        const alreadyMarked = participant.marked_by.includes(token)


        if (alreadyMarked) {
            throw new AppError("VALIDATION_ERROR", "Already Marked", undefined);

        } else {
            await Participant.updateOne({ _id: participant_id }, {
                $inc: {
                    total_marks: marks
                },
                $push: {
                    marked_by: token
                }
            })

            await produceMessageToQueue("preview-screen", JSON.stringify({
                type: "mark",
                mark: marks
            }))
        }

        return sendOk(res, "Successfully marked the participant")


    } catch (err: any) {
        if (err instanceof AppError) {
            throw err;
        } else {
            throw new AppError("INTERNAL", err, undefined);
        }
    }
}

export async function listParticipants(req: Request, res: Response) {
    try {
        const participants = await Participant.find({});
        return sendOk(res, participants);
    } catch (err) {
        if (err instanceof AppError) {
            throw err;
        } else {
            throw new AppError("INTERNAL", err, undefined);
        }
    }

}
export async function makeParticipantLive(req: Request, res: Response) {

    try {

        const participant_id = req.params.id
        const live = req.query.live === "true";

        const participant = await Participant.findById(participant_id);

        if (!participant) {
            throw new AppError("NOT_FOUND", "Could not find the participant", undefined);
        }

        participant.is_live = live;
        if (participant.is_live) {
            await produceMessageToQueue("competition-live", JSON.stringify([participant]))
        }

        await participant.save()

        return sendOk(res, participant)
    } catch (err) {
        if (err instanceof AppError) {
            throw err;
        } else {
            throw new AppError("INTERNAL", err, undefined);
        }
    }
}


export async function previewScreen(req: Request, res: Response) {
    try {
        console.log(req.body);

        await produceMessageToQueue("preview-screen", JSON.stringify(req.body))
        return sendOk(res, "Added to Queue")
    } catch (err) {
        if (err instanceof AppError) {
            throw err;
        } else {
            throw new AppError("INTERNAL", err, undefined);
        }
    }
}