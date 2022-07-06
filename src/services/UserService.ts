import { Router } from "express";
import { getAuth } from "firebase-admin/auth";

import { AuthenticatedRequest, tokenValidationMiddleware } from "../modules/FirebaseTokenVerifier.js";

const router = Router();
const handler = router.route('/me');

handler.get(tokenValidationMiddleware(), async (req: AuthenticatedRequest, res) => {
    const auth = getAuth();
    const user = await auth.getUser(req.uid!);

    return res.status(200).json(user);
});

export default router;
