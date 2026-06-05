"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.register = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../common/logger"));
const env_1 = require("../common/env");
// if (process.env.NODE_ENV == "development")
let db = null;
exports.db = db;
function register() {
    mongoose_1.default.set("debug", true);
    mongoose_1.default.connect((0, env_1.getMongoDBConfig)(), {
        readPreference: "secondaryPreferred",
        authSource: "admin"
    });
    mongoose_1.default.Promise = global.Promise;
    exports.db = db = mongoose_1.default.connection;
    db.on("connected", () => {
        console.log("DATABASE CONNECTED");
    });
    db.on("error", (error) => {
        logger_1.default.error("An error occurred", JSON.stringify(error));
        process.exit(1);
    });
    process.on("SIGINT", function () {
        db.close();
        logger_1.default.info("DATABASE DISCONNECTED");
        process.exit(1);
    });
    global.db = db;
}
exports.register = register;
//# sourceMappingURL=database.js.map