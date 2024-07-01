export default class Controller {
    protected static successResponse({data}: { data: any }) {
        return {
            result: 1,
            data
        };
    }

    protected static errorResponse({errors, message}: { errors: string | string[], message: string }) {
        return {
            result: 0,
            message,
            errors: Array.isArray(errors) ? errors.map(e => ({message: e})) : [{message: errors}]
        };
    }
}
