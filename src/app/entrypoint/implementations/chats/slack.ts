import {DeployEntity, DeployInterface} from "../../entity";
import {FunctionResponseDTO, RequestEntity} from "../../../../common/entities";
import TriggerCircleCIBuildPipeline from "../../pipelines/trigger-circleci-build.pipeline";
import logger from "../../../../common/logger";

export default class Slack implements DeployInterface{
    async processVerification(request: RequestEntity): Promise<FunctionResponseDTO<string>> {
        if (request.body.type == "url_verification") {
            return {
                data: request.body.challenge,
                statusCode: 200
            }
        }

        return {
            error: null,
            data: undefined,
            statusCode: 200
        };
    }
    async processCommand(request: RequestEntity): Promise<FunctionResponseDTO<string>> {
        const message: string = request.body.event.text;
        console.log(JSON.stringify(request.body));

        if (!message) {
            logger.error("Message is empty", request.body);
            return {
                data: "Empty Payload",
                statusCode: 400
            }
        }

        if (message.toLowerCase().trim().startsWith("deploy")) {
            new TriggerCircleCIBuildPipeline(request).run();

            return {
                error: null,
                data: request.body,
                statusCode: 200
            }
        }

        return {
            data: "Ok",
            statusCode: 200
        };
    }


}
