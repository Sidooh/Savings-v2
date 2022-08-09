export default class Controller {
    protected static successResponse({data}: { data: any }) {
        return {
            result: 1,
            data
        };
    }

    protected static errorResponse({errors}: { errors: string | string[] }) {
        return {
            result: 0,
            errors: Array.isArray(errors) ? errors.map(e => ({message: e})) : [{message: errors}]
        };
    }
}
