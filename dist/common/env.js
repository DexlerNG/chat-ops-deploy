"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMongoDBConfig = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config({});
const env = {
    port: Number(process.env.PORT || 3000),
    nodeEnv: process.env.NODE_ENV || "development",
    isProduction: process.env.NODE_ENV === "production",
    isDevelopment: process.env.NODE_ENV === "development",
    serviceName: process.env.APP_NAME || 'chat-ops-deploy',
    defaultDomain: process.env.DEFAULT_REDIRECT_DOMAIN,
    mongodbURL: process.env.MONGODB_URL,
    databaseName: process.env.DATABASE_NAME,
    ///Log
    logLevel: process.env.LOG_LEVEL || "debug",
    //SLACK
    slackURL: process.env.SLACK_BASE_URL || "https://slack.com",
    slackToken: process.env.SLACK_TOKEN,
    //CircleCI
    circleciBaseURL: process.env.CIRCLE_CI_BASE_URL || "https://circleci.com",
    circleciToken: process.env.CIRCLE_CI_TOKEN,
    circleciOrg: process.env.CIRCLE_CI_ORG,
    //GitHub Actions
    githubBaseURL: process.env.GITHUB_BASE_URL || "https://api.github.com",
    githubToken: process.env.GITHUB_TOKEN,
    githubOwner: process.env.GITHUB_OWNER,
    githubWorkflowId: process.env.GITHUB_WORKFLOW_ID || "main.yml",
    defaultChatProvider: process.env.DEFAULT_CHAT_PROVIDER,
    defaultRepoProvider: process.env.DEFAULT_REPO_PROVIDER,
    defaultCICDProvider: process.env.DEFAULT_CICD_PROVIDER
};
// const missingVariables = requiredVariables.reduce((acc, variable) => {
//   const isVariableMissing = !env[variable];
//   return isVariableMissing ? acc.concat(variable.toUpperCase()) : acc;
// }, []);
//
// if (!!missingVariables.length)
//   throw new Error(
//     `The following required variables are missing: ${missingVariables}}`,
//   );
exports.default = env;
// export function getKafkaConfig(): KafkaConfig {
//   const kafkaConfig:  KafkaConfig = {
//     clientId: `p2p.${env.environment}`,
//     brokers: env.kafkaClusterURL.split(','),
//     ssl: false,
//     logLevel: logLevel.INFO
//   };
//
//   if (env.kafkaSASLPassword && env.kafkaSASLUsername){
//     kafkaConfig.ssl = true;
//     kafkaConfig.sasl = {
//       mechanism: 'plain',
//       username: env.kafkaSASLUsername,
//       password: env.kafkaSASLPassword,
//     };
//   }
//
//   return kafkaConfig;
// }
function getMongoDBConfig() {
    return `${env.mongodbURL}/${env.databaseName}?retryWrites=true`;
}
exports.getMongoDBConfig = getMongoDBConfig;
//# sourceMappingURL=env.js.map