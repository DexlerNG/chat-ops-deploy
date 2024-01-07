
###
# 1. Dependencies
###

FROM node:lts-alpine AS packages


RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

#Change Work Directory
WORKDIR /home/node/app

#Copy the package.json file
COPY package.json yarn.lock ./

RUN apk update && apk add curl && yarn install

COPY --chown=node:node . .

RUN yarn build

EXPOSE 80

CMD ["node", "./dist/server.js"]
