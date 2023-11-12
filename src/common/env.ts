import * as dotenv from 'dotenv';

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


  defaultChatProvider: process.env.DEFAULT_CHAT_PROVIDER,
  defaultRepoProvider: process.env.DEFAULT_REPO_PROVIDER

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

export default env;


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


export function getMongoDBConfig(){
  return `${env.mongodbURL}/${env.databaseName}?retryWrites=true`;
}
