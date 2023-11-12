"use strict";
import express from "express";


import * as entrypointController from "../app/entrypoint/controller";
import * as appController from "../app/controller";

export function register(app: express.Application) {
    app.all("/health-check", appController.healthCheck);
    app.all("/v1/process-command", entrypointController.processCommand);
    app.all("/v1/process-command/:chatProvider", entrypointController.processCommand);
    app.all("/v1/process-command/:chatProvider/:repoProvider", entrypointController.processCommand);
}


