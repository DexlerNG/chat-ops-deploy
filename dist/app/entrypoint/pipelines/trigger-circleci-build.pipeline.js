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
const pipeline_1 = require("@boost/pipeline");
const logger_1 = __importDefault(require("../../../common/logger"));
class TriggerCircleCIBuildPipeline {
    constructor(request, chatInterface, deployEntity) {
        this.request = request;
        this.chatInterface = chatInterface;
        this.deployEntity = deployEntity;
    }
    startBuildProcess(_, input) {
        return __awaiter(this, void 0, void 0, function* () {
            return input;
        });
    }
    run() {
        const triggerInput = {
            chatInterface: this.chatInterface,
            request: this.request,
            deployEntity: this.deployEntity,
            eventPayload: this.request.body
        };
        new pipeline_1.WaterfallPipeline(new pipeline_1.Context(), triggerInput)
            .pipe("startBuildProcess", this.startBuildProcess)
            .run()
            .catch(error => logger_1.default.error(error.message));
    }
}
module.exports = TriggerCircleCIBuildPipeline;
//# sourceMappingURL=trigger-circleci-build.pipeline.js.map