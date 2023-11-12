import {User} from "@slack/web-api/dist/response/UsersInfoResponse";
import {ChatPostMessageArguments} from "@slack/web-api";
import winston from "winston";

type SlackUser = User;
type SlackChatPostMessageArguments = ChatPostMessageArguments;

type RequestEntity = {
    headers: any
    body: any
    query: any
    params: any
}

class FunctionResponseDTO<T> {
    error?: string;
    statusCode?: number;
    data?: T;
    [x: string]: any;
}
export {
    SlackUser,
    SlackChatPostMessageArguments,
    RequestEntity,
    FunctionResponseDTO
}
