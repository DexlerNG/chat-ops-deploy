"use strict";
import express, {Express} from "express";
import path from "path";
import helmet from "helmet";
import logger from "morgan";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";

export const register = (app: express.Application, express) => {
    app.use(cors());
    app.use(helmet());
    app.use(logger("combined"));
    app.use(express.json({limit: "250mb"}));
    app.set("trust proxy", true);
    app.use(express.urlencoded({extended: false, limit: "250mb"}));
    app.use(express.static(path.join(__dirname, "public")));
    app.use(mongoSanitize({
        onSanitize: ({req, key}) => {
            console.log(`This request[${key}] is sanitized`, req.body);
        },
    }));
};
