"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const winston_1 = __importDefault(require("winston"));
const env_1 = __importDefault(require("./env"));
const config = {
    levels: winston_1.default.config.cli.levels,
    level: env_1.default.logLevel || "debug",
    format: winston_1.default.format.combine(winston_1.default.format.colorize({ all: true }), winston_1.default.format.timestamp(), winston_1.default.format.align()),
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize({ all: true }), winston_1.default.format.timestamp(), winston_1.default.format.align()),
        }),
        new winston_1.default.transports.File({ filename: 'app.log' }),
    ],
    defaultMeta: {
        service: env_1.default.serviceName,
    }
};
// export = winston.createLogger(config);
const logger = winston_1.default.createLogger(config);
//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.simple(),
    }));
}
module.exports = logger;
//# sourceMappingURL=logger.js.map