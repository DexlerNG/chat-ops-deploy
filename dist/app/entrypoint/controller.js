"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.processWebhook = exports.processCommand = void 0;
const service = __importStar(require("./service"));
const response_1 = __importDefault(require("../../common/response"));
const processCommand = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { error, statusCode, data } = yield service.processCommand({
        body: req.body,
        query: req.query,
        headers: req.headers,
        params: req.params,
    });
    console.log("Response", data, error, statusCode);
    if (error)
        return response_1.default.error(res, error, statusCode);
    return response_1.default.success(res, data, statusCode);
});
exports.processCommand = processCommand;
const processWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { statusCode, data } = yield service.processWebhook({
        body: req.body,
        query: req.query,
        headers: req.headers,
        params: req.params,
    });
    // if (error) return response.error(res, error, statusCode);
    return response_1.default.success(res, "processed", statusCode);
});
exports.processWebhook = processWebhook;
//# sourceMappingURL=controller.js.map