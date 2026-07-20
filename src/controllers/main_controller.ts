import { raw, Request, Response } from "express";

import { sendOk } from "../utils/respond";
import { AppError } from "../types/error.type";
import User from "../model/user"
import Gallery from "../model/gallery"


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
