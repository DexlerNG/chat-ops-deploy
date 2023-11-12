import {ChatPostMessageArguments, ReactionsAddArguments, UsersInfoResponse, WebClient} from "@slack/web-api";
import env from "../common/env";
import {User} from "@slack/web-api/dist/response/UsersInfoResponse";
import {FunctionResponseDTO} from "../common/entities";

const slackWebClientAPI = new WebClient(env.slackToken);


export const sendReaction = async (payload: ReactionsAddArguments) => {
    try {
        const response = await slackWebClientAPI.reactions.add(payload);
        // console.log("slack:chatPostMessage", payload, response);

        return {
            error: null,
            statusCode: 200,
            data: response.data
        }
    } catch (e) {
        console.log('Error posting message to slack', e);

        return {
            error: e.message,
            statusCode: 500,
            data: null
        }
    }
}

export const chatPostMessage = async (payload: ChatPostMessageArguments) => {
    try {
        const response = await slackWebClientAPI.chat.postMessage(payload);
        // console.log("slack:chatPostMessage", payload, response);

        return {
            error: null,
            statusCode: 200,
            data: response.data
        }
    } catch (e) {
        console.log('Error posting message to slack', e);

        return {
            error: e.message,
            statusCode: 500,
            data: null
        }
    }
}


export const getUserInfo = async (userId: string): Promise<FunctionResponseDTO<User>> => {
    try{
        const response = await slackWebClientAPI.users.info({
            user: userId
        });

        return {
            error: null,
            statusCode: 200,
            data: response.user
        }
    }catch (e){
        console.log('error getting user info', e);

        return {
            error: e.message,
            statusCode: 500,
            data: null
        }
    }
}
