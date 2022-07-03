import { Router } from "express";
import { getApp } from "firebase/app";

import { validator } from "../middlewares/validator.js";
import { OAuthHandler, TokenExchangeError } from "../modules/OAuthHandler.js";

const router = Router();
const handler = router.route('/token');

const schema = {
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "grant_type": {
            "type": "string",
            "enum": [
                "refresh_token"
            ]
        },
        "refresh_token": {
            "type": "string"
        }
    },
    "anyOf": [
        {
            "not": {
                "properties": {
                    "grant_type": {
                        "const": "refresh_token"
                    }
                },
                "required": [
                    "grant_type"
                ]
            }
        },
        {
            "required": [
                "refresh_token"
            ]
        }
    ],
    "required": [
        "grant_type"
    ]
};

const oauth = new OAuthHandler('https://securetoken.googleapis.com/v1/token');

const exchangeRefreshToken = async (refreshToken: string) => {
    const { options: { apiKey: key } } = getApp();

    return oauth.exchangeRefreshToken({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
    }, { params: { key } });
};

handler.post(validator(schema), async (req, res) => {
    try {
        const { grant_type } = req.body;

        if (grant_type === 'refresh_token') {
            const { refresh_token } = req.body;
            const credentials = await exchangeRefreshToken(refresh_token);

            return res.status(200).json(credentials);
        }

        return res.status(400).send();
    } catch (error) {
        if (error instanceof TokenExchangeError)
            return res.status(400).send();

        console.error(error);
        return res.status(500).send();
    }
});

export default router;
