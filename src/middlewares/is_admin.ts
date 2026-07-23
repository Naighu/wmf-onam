import { NextFunction,Request ,Response} from "express";
import { AppError } from "../types/error.type";

export function isAdmin(req: Request, res: Response, _next: NextFunction) {
    if(req.headers.authorization === process.env.ADMIN_PASSWORD) {
        _next()
    }else{
         throw new AppError("FORBIDDEN", "Not Authorized to perform this task", undefined);
    }
}