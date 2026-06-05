"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const path_1 = __importDefault(require("path"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const register = (app, express) => {
    app.use((0, cors_1.default)());
    app.use((0, helmet_1.default)());
    app.use((0, morgan_1.default)("combined"));
    app.use(express.json({ limit: "250mb" }));
    app.set("trust proxy", true);
    app.use(express.urlencoded({ extended: false, limit: "250mb" }));
    app.use(express.static(path_1.default.join(__dirname, "public")));
};
exports.register = register;
//# sourceMappingURL=middleware.js.map