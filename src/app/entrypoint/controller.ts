"use strict";

import express from "express";
import * as service from "./service";
import response from "../../common/response";
export const processCommand = async (req: express.Request, res: express.Response) => {
    const {
        error,
        statusCode,
        data
    } = await service.processCommand({
        body: req.body,
        query: req.query,
        headers: req.headers,
        params: req.params,
    });

    console.log("Response", data, error, statusCode);

    if (error) return response.error(res, error, statusCode);

    return response.success(res, data, statusCode);
};

export const processWebhook = async (req: express.Request, res: express.Response) => {
    const {
        error,
        statusCode,
        data
    } = await service.processWebhook({
        body: req.body,
        query: req.query,
        headers: req.headers,
        params: req.params,
    });


    if (error) return response.error(res, error, statusCode);

    return response.success(res, data, statusCode);
};
