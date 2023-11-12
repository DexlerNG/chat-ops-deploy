"use strict";
import deployRepository from "./entrypoint/repository";
import express from "express";

export const healthCheck = async (req: express.Request, res: express.Response) => {
    try {
        //1. Check DB
        const healthCheck = {
            uptime: process.uptime(),
            database: false,
            timestamp: Date.now()
        };

        await deployRepository.findOne({}, {_id: -1});
        healthCheck.database = true;

        return res.json(healthCheck);
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
};
