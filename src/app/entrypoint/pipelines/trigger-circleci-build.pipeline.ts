import {Context, WaterfallPipeline} from "@boost/pipeline";
import logger from "../../../common/logger";
import * as circleciService from "../../../services/circleci.service";
import {DeployEntity, DeployStatus} from "../entity";
import deployRepository from "../repository";
import {RequestEntity, SlackUser} from "../../../common/entities";
import {ChatProviderInterface} from "../interface";
interface TriggerCircleCIBuildPipelineInput {
    request: RequestEntity
    chatInterface?: ChatProviderInterface
    eventPayload?: any
    deployEntity?: DeployEntity
}

class TriggerCircleCIBuildPipeline {
    constructor(
        private readonly request: RequestEntity,
        private readonly chatInterface: ChatProviderInterface,
        private readonly deployEntity: DeployEntity,
    ) {}
    async startBuildProcess(_: Context, input: TriggerCircleCIBuildPipelineInput){


        return input;
    }
    run() {

        const triggerInput: TriggerCircleCIBuildPipelineInput = {
            chatInterface: this.chatInterface,
            request: this.request,
            deployEntity: this.deployEntity,
            eventPayload: this.request.body
        }

        new WaterfallPipeline(new Context(), triggerInput)
            .pipe("startBuildProcess", this.startBuildProcess)
            .run()
            .catch(error => logger.error(error.message));
    }
}

export = TriggerCircleCIBuildPipeline;
