import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../exceptions/custom.err";
import { AxiosError } from 'axios';

export const ErrorMiddleware = (error: Error | any, req: Request, res: Response, next: NextFunction) => {
    let message = error.message || 'Something went wrong';

    if (error instanceof CustomError) return res.status(error.statusCode).send({errors: error.serializeErrors()});
    if (error instanceof AxiosError) return res.status(error.response.status).send(error.response.data);

    console.error(error);

    res.status(400).send({errors: [{message}]});
};
