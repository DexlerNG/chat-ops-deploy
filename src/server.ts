"use strict";
import * as dotenv from "dotenv";

dotenv.config({});

import express from "express";
import * as routes from "./routes"
import * as lib from "./lib"
import env from "./common/env";


async function setupServer(){
    let app: express.Application = express();

    await lib.register(app, express);

    routes.register(app);

// catch 404 and forward to error handler
    app.use((req, res) => {
        return res.status(404).json({error: `${req.method} ${req.url} not found`});
    });


// error handler
    app.use((err: any, req:  any, res: any) => {
        res.status(err.status || 500);
        res.send({error: err.message});
    });


    app.listen(env.port, () => {
        console.log(`===========  Server Starting on ${env.port} ===============`)
    });
}

setupServer();
