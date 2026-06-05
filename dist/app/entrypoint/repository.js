"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const model_1 = __importDefault(require("./model"));
const repository_1 = require("../repository");
class DeployRepository extends repository_1.MongoDBRepository {
    constructor() {
        super(model_1.default);
    }
}
module.exports = new DeployRepository();
//# sourceMappingURL=repository.js.map