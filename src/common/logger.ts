import winston from "winston";
import env from "./env";

const config = {
    levels: winston.config.cli.levels,
    level: env.logLevel || "debug",
    format: winston.format.combine(
        winston.format.colorize({all: true}),
        winston.format.timestamp(),
        winston.format.align(),
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize({all: true}),
                winston.format.timestamp(),
                winston.format.align(),
            ),
        }),
        new winston.transports.File({ filename: 'app.log' }),
    ],
    defaultMeta: {
        service: env.serviceName,
    }
};

// export = winston.createLogger(config);
const logger = winston.createLogger(config);

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

export = logger
