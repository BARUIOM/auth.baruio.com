import dotenv from "dotenv";
dotenv.config();

import { Router } from "express";

import { OAuthHandler } from "../modules/OAuthHandler.js";

const router = Router();
const handler = router.route('/oauth/spotify');

const {
    SPOTIFY_CLIENT_ID,
    SPOTIFY_OAUTH_REDIRECT_URI,
} = process.env;

const oauth = new OAuthHandler(
    'https://accounts.spotify.com/api/token',
    'https://accounts.spotify.com/authorize'
);

const scopes = [
    "user-follow-modify",
    "user-follow-read",
    "user-read-recently-played",
    "user-top-read",
    "playlist-read-collaborative",
    "playlist-modify-public",
    "playlist-read-private",
    "playlist-modify-private",
    "user-read-email",
    "user-read-private",
    "user-library-modify",
    "user-library-read"
];

handler.get(async (req, res) => {
    const url = oauth.getAuthorizationURL({
        client_id: SPOTIFY_CLIENT_ID!,
        response_type: 'code',
        redirect_uri: SPOTIFY_OAUTH_REDIRECT_URI!,
        scope: scopes
    });

    res.redirect(url!);
});

export default router;
