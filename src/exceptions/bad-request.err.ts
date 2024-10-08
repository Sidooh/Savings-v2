import { CustomError } from "./custom.err";

export class BadRequestError extends CustomError {
    statusCode = 400;

    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, BadRequestError.prototype)
    }

    serializeErrors(): { message: string; field?: string }[] {
        return [{ message: this.message }];
    }
}
