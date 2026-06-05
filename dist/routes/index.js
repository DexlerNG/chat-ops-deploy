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
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const entrypointController = __importStar(require("../app/entrypoint/controller"));
const appController = __importStar(require("../app/controller"));
function register(app) {
    app.all("/health-check", appController.healthCheck);
    app.all("/v1/process-command", entrypointController.processCommand);
    app.all("/v1/process-command/:chatProvider", entrypointController.processCommand);
    app.all("/v1/process-command/:chatProvider/:repoProvider", entrypointController.processCommand);
    app.all("/v1/process-webhook/:CICDProvider", entrypointController.processWebhook);
}
exports.register = register;
//# sourceMappingURL=index.js.map