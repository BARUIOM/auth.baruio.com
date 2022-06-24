import { Router } from "express";
import { FirebaseError } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

import { validator } from "../middlewares/validator";

const router = Router();
const handler = router.route('/sign-in');

const schema = {
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "email": {
            "type": "string",
            "format": "email"
        },
        "password": {
            "type": "string"
        }
    },
    "required": [
        "email",
        "password"
    ]
};

handler.post(validator(schema), async (req, res) => {
    try {
        const { email, password } = req.body;

        const auth = getAuth();
        const { user } = await signInWithEmailAndPassword(auth, email, password);

        const { token: accessToken } = await user.getIdTokenResult();
        const { refreshToken } = user;

        return res.status(200)
            .json({ accessToken, refreshToken });
    } catch (error) {
        if (error instanceof FirebaseError)
            return res.status(400).send();

        console.error(error);
        return res.status(500).send();
    }
});

export default router;
