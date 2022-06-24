import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { initializeApp as FirebaseWeb } from "firebase/app";
import { initializeApp as FirebaseAdmin, applicationDefault } from "firebase-admin/app";

FirebaseAdmin({ credential: applicationDefault() });
FirebaseWeb({ apiKey: process.env['FIREBASE_API_KEY'] });

const app = express();
app.use(express.json());

const server = app.listen(3000, () => {
    const address = server.address();
    console.log("Running BARUIO's authentication API", address);
});
