import Ajv from "ajv";
import addFormats from "ajv-formats";
import type { Request, Response, NextFunction } from "express";

const ajv = addFormats(new Ajv());

export const validator = (schema: Record<string, unknown>) => {
    const validate = ajv.compile(schema);

    return (req: Request, res: Response, next: NextFunction) => {
        let payload = req.body;

        if (req.method === 'GET')
            payload = req.query;

        const isValid = validate(payload);

        if (isValid)
            return next();

        res.status(400).json(validate.errors);
    };
};
