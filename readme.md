# Chat Ops Deploy
This is a backend service that aims connects to connect multiple chat platforms and provide a common interface to deploy applications from a chat platform to aany CI/CD platform running your deployment script. 

## Supported Commands
- deploy <repo-name> <environment> <branch-name> 

## Supported Chat Platforms
- Slack

## Supported CI/CD Platforms
- CircleCI

### General Requirements
- Update The .env

### Slack Requirements
- Create a Slack App
- Go to the `oauth and permissions` section and do the following 
  - SLACK_TOKEN: grab you Bot User OAuth Token,
      - Add the following permissions
          - Chat:write
          - Users:read
          - If you are using a public channel
              - channels:history
              - channels:read
          - If you are using a private channel
              - groups:history
              - groups:read
              - groups:write
          - If you want to reaction feature
              - reactions:write
      - You will be prompted to reinstall the app
- Go to the event subscription section and of the following
    - Add a request url pointing to the chatsOpsDeploy service, and make sure the url is verified from slack. The url should be `https://<your-host>/v1/process-command/?:chatProvider/?:repoProvider`
    - Add the permission `message.channels`  for public channel or `message.groups` for private channels to allow the bot get messages sent and send to the backend service
- Install the app to the channel of your choosing on slack workspace



### CircleCI Requirements
- Create a CircleCI API Token
- Run the script `ts-node ./src/app/entrypoint/commands/sync-circleci-webhooks.script.ts` to sync the webhooks to your circleci projects. This is basically just pulling all your projects and adding a webhook to them
- The url to the webhook is `https://<your-host>/v1/process-webhook/?:CICDProvider`
