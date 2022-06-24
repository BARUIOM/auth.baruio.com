import axios from "axios";
import { Router } from "express";
import { getApp } from "firebase/app";

import { validator } from "../middlewares/validator";

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

class TokenExchangeError extends Error { }

const exchangeRefreshToken = async (refreshToken: string) => {
    const payload = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken
    };

    const { options: { apiKey: key } } = getApp();
    const response = await axios.post('https://securetoken.googleapis.com/v1/token', payload, { params: { key } })
        .catch(e => { throw new TokenExchangeError(e) });

    if (response.status === 200)
        return {
            accessToken: response.data['access_token'],
            refreshToken: response.data['refresh_token']
        };

    throw new TokenExchangeError('Unable to refresh user token');
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
