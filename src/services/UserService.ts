import { Router } from "express";
import { getAuth } from "firebase-admin/auth";

const router = Router();
const handler = router.route('/me');

handler.get(async (req, res) => {
    const authorization = req.headers['authorization'];

    if (!authorization)
        return res.status(403).send();

    const [type, idToken] = authorization.split(' ');

    if (type !== 'Bearer' || !idToken)
        return res.status(403).send();

    try {
        const auth = getAuth();
        const decoded = await auth.verifyIdToken(idToken);
        const user = await auth.getUser(decoded.uid);

        return res.status(200).json(user);
    } catch {
        return res.status(403).send();
    }
});

export default router;
