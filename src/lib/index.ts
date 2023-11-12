"use strict";
import express from "express";
import * as database from "./database";
import * as middlewares from "./middleware";
export const register = async (app: express.Application, express) => {
    middlewares.register(app, express);
    database.register();
};
