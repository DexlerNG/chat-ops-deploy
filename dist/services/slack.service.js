"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserInfo = exports.chatPostMessage = exports.sendReaction = void 0;
const web_api_1 = require("@slack/web-api");
const env_1 = __importDefault(require("../common/env"));
const slackWebClientAPI = new web_api_1.WebClient(env_1.default.slackToken);
const sendReaction = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield slackWebClientAPI.reactions.add(payload);
        // console.log("slack:chatPostMessage", payload, response);
        return {
            error: null,
            statusCode: 200,
            data: response.data
        };
    }
    catch (e) {
        console.log('Error posting message to slack', e);
        return {
            error: e.message,
            statusCode: 500,
            data: null
        };
    }
});
exports.sendReaction = sendReaction;
const chatPostMessage = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield slackWebClientAPI.chat.postMessage(payload);
        // console.log("slack:chatPostMessage", payload, response);
        return {
            error: null,
            statusCode: 200,
            data: response.data
        };
    }
    catch (e) {
        console.log('Error posting message to slack', e);
        return {
            error: e.message,
            statusCode: 500,
            data: null
        };
    }
});
exports.chatPostMessage = chatPostMessage;
const getUserInfo = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield slackWebClientAPI.users.info({
            user: userId
        });
        return {
            error: null,
            statusCode: 200,
            data: response.user
        };
    }
    catch (e) {
        console.log('error getting user info', e);
        return {
            error: e.message,
            statusCode: 500,
            data: null
        };
    }
});
exports.getUserInfo = getUserInfo;
//# sourceMappingURL=slack.service.js.map