"use strict";
import express from "express";
import path from "path";
import helmet from "helmet";
import logger from "morgan";
import cors from "cors";
import env from "../common/env";
import { validGithubRequest, validSlackRequest } from "../app/entrypoint/actions/release-auth";

export const register = (app: express.Application, express) => {
    app.use(cors());
    app.use(helmet());
    app.use(logger("combined"));
    // Verify the signed bytes before Express parses or inflates the body.
    const readSignedJson = express.raw({type: "application/json", inflate: false, limit: "1mb"});
    app.use("/v1/process-command", readSignedJson, (req, res, next) => {
        if (!Buffer.isBuffer(req.body) || !validSlackRequest(req.body, req.get("x-slack-request-timestamp") || "",
            req.get("x-slack-signature") || "", env.slackSigningSecret)) return res.sendStatus(401);
        try { req.body = JSON.parse(req.body.toString("utf8")); } catch { return res.sendStatus(400); }
        if (!env.slackWorkspace || req.body.team_id !== env.slackWorkspace) {
            // Slack's signed URL verification can omit the workspace ID.
            if (req.body.type !== "url_verification") return res.sendStatus(403);
        }
        if (req.body.type !== "url_verification") {
            const event = req.body.event;
            if (!env.slackDeployChannel || event?.channel !== env.slackDeployChannel || !req.body.event_id ||
                req.body.type !== "event_callback" || event.type !== "message" || event.subtype || event.bot_id ||
                !event.user || typeof event.text !== "string") return res.sendStatus(403);
        }
        return next();
    });
    app.use("/v1/process-webhook/:provider?", (req, res, next) => {
        const provider = req.params.provider || env.defaultCICDProvider;
        if (provider === "circleci") return next();
        if (provider !== "github") return res.sendStatus(403);
        readSignedJson(req, res, (err) => {
            if (err) return next(err);
            if (!Buffer.isBuffer(req.body) || !validGithubRequest(req.body, req.get("x-hub-signature-256") || "", env.githubWebhookSecret)) return res.sendStatus(401);
            if (req.get("x-github-event") !== "workflow_run") return res.sendStatus(403);
            try { req.body = JSON.parse(req.body.toString("utf8")); } catch { return res.sendStatus(400); }
            return next();
        });
    });
    app.use(express.json({limit: "250mb"}));
    app.set("trust proxy", true);
    app.use(express.urlencoded({extended: false, limit: "250mb"}));
    app.use(express.static(path.join(__dirname, "public")));
};
