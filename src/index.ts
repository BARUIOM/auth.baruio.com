import dotenv from "dotenv";
dotenv.config();

import express from "express";

const app = express();
app.use(express.json());

const server = app.listen(3000, () => {
    const address = server.address();
    console.log("Running BARUIO's authentication API", address);
});
