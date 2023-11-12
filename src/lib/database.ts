"use strict";

import mongoose from "mongoose";
import logger from "../common/logger";
import {getMongoDBConfig} from "../common/env";

// if (process.env.NODE_ENV == "development")

let db: any = null;

export function register(){
    mongoose.set("debug", true);

    mongoose.connect(getMongoDBConfig(), {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        readPreference: "secondaryPreferred",
        authSource: "admin"
    });

    mongoose.Promise = global.Promise;

    db = mongoose.connection;
    db.on("connected", () => {
        console.log("DATABASE CONNECTED");
    });


    db.on("error", (error) => {
        logger.error("An error occurred", JSON.stringify(error));
        process.exit(1);
    });

    process.on("SIGINT", function () {
        db.close();
        logger.info("DATABASE DISCONNECTED");
        process.exit(1);
    });

    global.db = db;
}


export {
    db
};
