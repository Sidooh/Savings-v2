import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface UserPayload {
    id: number;
    email: string;
    name: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
        }
    }
}

export const User = (req: Request, res: Response, next: NextFunction) => {
    if (!req.cookies.jwt) return next();

    console.log(req.cookies.jwt);
    try {
        req.user = jwt.verify(req.cookies.jwt, process.env.JWT_KEY!) as UserPayload;
    } catch (e) {
    }

    next();
};
