"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAxiosError = void 0;
const logger_1 = __importDefault(require("../logger"));
function resolveAxiosError(error) {
    let formattedError;
    try {
        if (error === null || error === void 0 ? void 0 : error.response) {
            formattedError = {
                status: error.response.status,
                statusText: error.response.statusText,
                message: error.response.data.error,
                url: error.response.config.url,
                params: error.response.config.params,
                data: error.response.config.data,
                headers: error.response.headers,
                raw: error.response.data,
                stackTrace: new Error().stack
            };
        }
        else {
            formattedError = {
                status: 500,
                statusText: error.message || "Unknown Error",
                message: error.message || "Oops, An Error Occurred",
                stack: error.stack,
                stackTrace: new Error().stack
            };
        }
    }
    catch (ex) {
        formattedError = {
            status: 500,
            statusText: "Unknown Error",
            message: "Oops, An Error Occurred",
            error: ex.message,
            stack: ex.stack
        };
    }
    finally {
        logger_1.default.error(formattedError.message, formattedError);
    }
    return formattedError;
}
exports.resolveAxiosError = resolveAxiosError;
//# sourceMappingURL=helpers.js.map