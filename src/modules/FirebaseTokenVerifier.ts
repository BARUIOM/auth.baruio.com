import { DecodedIdToken, getAuth } from "firebase-admin/auth";
import type { Request, Response, NextFunction } from "express";

export type AuthenticatedRequest = Request & {
    uid?: string;
};

export class TokenValidationError extends Error { }

export const validateToken = async (idToken?: string): Promise<DecodedIdToken> => {
    if (!idToken)
        throw new TokenValidationError('Empty id token provided');

    const auth = getAuth();
    const decoded = await auth.verifyIdToken(idToken)
        .catch(() => { throw new TokenValidationError('Invalid token') });

    return decoded;
};

export const validateAuthorizationHeader = (authorization?: string): Promise<DecodedIdToken> => {
    if (!authorization)
        throw new TokenValidationError('Empty authorization header provided');

    const [scheme, idToken] = authorization.split(' ');

    if (scheme !== 'Bearer')
        throw new TokenValidationError('Invalid authentication scheme');

    return validateToken(idToken);
};

export const tokenValidationMiddleware = (optional: boolean = false) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { authorization } = req.headers;

        if (!authorization && optional)
            return next();

        try {
            const { uid } = await validateAuthorizationHeader(authorization);
            Object.assign(req, { uid });

            return next();
        } catch (error) {
            if (error instanceof TokenValidationError)
                return res.status(403).send();

            console.error(error);
            return res.status(500).send();
        }
    };
};
