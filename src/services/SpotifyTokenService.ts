import dotenv from "dotenv";
dotenv.config();

import { Router } from "express";

import { validator } from "../middlewares/validator.js";
import { OAuthHandler, TokenExchangeError } from "../modules/OAuthHandler.js";

const router = Router();
const handler = router.route('/oauth/spotify/token');

const schema = {
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "grant_type": {
            "type": "string",
            "enum": [
                "authorization_code",
                "refresh_token"
            ]
        },
        "code": {
            "type": "string"
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
                    "grant_type",
                    "code",
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

const {
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    SPOTIFY_OAUTH_REDIRECT_URI,
} = process.env;

const oauth = new OAuthHandler(
    'https://accounts.spotify.com/api/token',
    'https://accounts.spotify.com/authorize'
);

const getEncodedAuthorization = () => {
    const value = [SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET].join(':');
    return Buffer.from(value).toString('base64');
};

const exchangeCodeForToken = async (code: string) => {
    const headers = {
        'Authorization': 'Basic ' + getEncodedAuthorization()
    };

    return oauth.exchangeCodeForToken({
        grant_type: 'authorization_code',
        redirect_uri: SPOTIFY_OAUTH_REDIRECT_URI!,
        code: code,
    }, { headers });
};

const exchangeRefreshToken = async (refreshToken: string) => {
    const headers = {
        'Authorization': 'Basic ' + getEncodedAuthorization()
    };

    return oauth.exchangeRefreshToken({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
    }, { headers });
};

handler.post(validator(schema), async (req, res) => {
    try {
        const { grant_type } = req.body;

        if (grant_type === 'authorization_code') {
            const { code } = req.body;
            const credentials = await exchangeCodeForToken(code);

            return res.status(200).json(credentials);
        }

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
