import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import { initializeApp as FirebaseWeb } from "firebase/app";
import { initializeApp as FirebaseAdmin, applicationDefault } from "firebase-admin/app";

import SignInService from "./services/SignInService.js";
import SpotifyOAuthService from "./services/SpotifyOAuthService.js";
import SpotifyTokenService from "./services/SpotifyTokenService.js";
import TokenService from "./services/TokenService.js";
import UserService from "./services/UserService.js";

FirebaseAdmin({ credential: applicationDefault() });
FirebaseWeb({ apiKey: process.env['FIREBASE_API_KEY'] });

const app = express();
app.use(express.json());
app.disable('x-powered-by');

const NODE_ENV = process.env['NODE_ENV'];

if (NODE_ENV !== 'production')
    app.use(cors());

app.use(SignInService);
app.use(SpotifyOAuthService);
app.use(SpotifyTokenService);
app.use(TokenService);
app.use(UserService);

const PORT = process.env['PORT'] || 3001;
const server = app.listen(PORT, () => {
    const address = server.address();
    console.log("Running BARUIO's authentication API", address);
});
